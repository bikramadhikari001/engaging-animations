#!/usr/bin/env python3
"""
publish_to_drive.py — Upload video to Drive, share publicly, append to Google Sheet.

Usage:
  python publish_to_drive.py VIDEO_PATH TITLE --folder FOLDER_ID --sheet SHEET_ID

Outputs the download URL to stdout (last line).
"""

import argparse
import os
import sys
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
]

# Look for credentials in multiple locations
SKILL_DIR = os.path.expanduser("~/.gemini/antigravity/skills/google-docs")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)


def find_file(name):
    """Find credentials/token in skill dir, project dir, script dir, or /tmp."""
    for d in [SKILL_DIR, PROJECT_DIR, SCRIPT_DIR, "/tmp", "."]:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    return None


def get_credentials():
    """Get OAuth2 credentials, supporting CI via env vars."""
    creds = None

    # CI: credentials from environment variables
    token_json = os.environ.get("GOOGLE_TOKEN_JSON")
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")

    if token_json:
        # Reconstruct token file from env
        token_data = json.loads(token_json)
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    else:
        token_file = find_file("token.json")
        if token_file:
            creds = Credentials.from_authorized_user_file(token_file, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Save refreshed token back
            token_file = find_file("token.json")
            if token_file:
                with open(token_file, "w") as f:
                    f.write(creds.to_json())
            # Also update env-based token if in CI
            if token_json:
                print(f"TOKEN_REFRESHED:{creds.to_json()}", file=sys.stderr)
        else:
            creds_file = find_file("credentials.json")
            if creds_json:
                import tempfile
                with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
                    f.write(creds_json)
                    creds_file = f.name
            if not creds_file:
                print("❌ No credentials.json found")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(creds_file, SCOPES)
            creds = flow.run_local_server(port=0)
            token_file = find_file("token.json") or os.path.join(PROJECT_DIR, "token.json")
            with open(token_file, "w") as f:
                f.write(creds.to_json())

    return creds


def upload_to_drive(creds, file_path, folder_id, file_name=None):
    """Upload file to Drive folder, return file ID."""
    drive = build("drive", "v3", credentials=creds)

    name = file_name or os.path.basename(file_path)
    metadata = {"name": name, "parents": [folder_id]}
    media = MediaFileUpload(file_path, resumable=True)

    uploaded = drive.files().create(
        body=metadata, media_body=media,
        fields="id, name, size, webViewLink"
    ).execute()

    file_id = uploaded["id"]
    print(f"✅ Uploaded: {uploaded['name']} ({uploaded.get('size', '?')} bytes)")
    print(f"   ID: {file_id}")
    return file_id


def make_public(creds, file_id):
    """Share file as 'anyone with link can view'."""
    drive = build("drive", "v3", credentials=creds)
    drive.permissions().create(
        fileId=file_id,
        body={"type": "anyone", "role": "reader"},
        fields="id"
    ).execute()
    print(f"🔓 Shared publicly: {file_id}")


def append_to_sheet(creds, sheet_id, video_link, title):
    """Append a row to the Google Sheet."""
    sheets = build("sheets", "v4", credentials=creds)
    body = {
        "values": [[video_link, title]]
    }
    sheets.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range="Sheet1!A:B",
        valueInputOption="RAW",
        body=body
    ).execute()
    print(f"📊 Added to sheet: {title[:50]}...")


def main():
    parser = argparse.ArgumentParser(description="Upload video to Drive + append to Sheet")
    parser.add_argument("video_path", help="Path to the video file")
    parser.add_argument("title", help="Title for the TikTok post")
    parser.add_argument("--folder", required=True, help="Google Drive folder ID")
    parser.add_argument("--sheet", required=True, help="Google Sheet ID")
    args = parser.parse_args()

    if not os.path.isfile(args.video_path):
        print(f"❌ File not found: {args.video_path}")
        sys.exit(1)

    creds = get_credentials()

    # 1. Upload to Drive
    file_id = upload_to_drive(creds, args.video_path, args.folder)

    # 2. Make publicly accessible
    make_public(creds, file_id)

    # 3. Build download link
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    print(f"🔗 Download URL: {download_url}")

    # 4. Append to sheet
    append_to_sheet(creds, args.sheet, download_url, args.title)

    # Output the URL as last line for scripting
    print(f"\nDOWNLOAD_URL={download_url}")


if __name__ == "__main__":
    main()
