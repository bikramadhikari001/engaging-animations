#!/usr/bin/env node
/**
 * publish.mjs — Full TikTok pipeline
 *
 * 1. Pick a random scene (3, 6, or 7)
 * 2. Generate video via record-ci.mjs
 * 3. Upload to Google Drive + make public
 * 4. Append title + download link to Google Sheet
 *
 * If recording fails (e.g. pong timeout), retries with a different scene.
 *
 * Usage:
 *   node publish.mjs                    # full pipeline
 *   node publish.mjs --dry-run          # preview title without recording/uploading
 *   node publish.mjs --scene 7          # force a specific scene
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const DRIVE_FOLDER = '1MA26NOrRb38yoLV9cDThiT22_dh0qc9H';
const SHEET_ID = '1GfVjcVrW_ymyPErYSK8RCNIbyZGnMVtsec1bhPekz-Q';

// ── Scene definitions ──────────────────────────────────────────
const SCENES = [
    {
        scene: 3,
        name: 'newtons-cradle',
        titles: [
            'This Hypnotic Motion Will Calm Your Brain 🧠✨',
            "You Can't Stop Watching This... Trust Me 😮‍💨",
            'POV: Your Brain on Physics 🎱💫',
            'Why Is This So Satisfying?! 🤯',
            'Newton Was Onto Something Beautiful 🔮',
            'Watch This 10 Times And Still Not Bored 😵‍💫',
            'The Most Relaxing Thing on the Internet 🌊',
            'This Sound + This Motion = Pure Zen 🎧✨',
            'Physics Never Looked This Good 🎱🔥',
            'I Could Watch This Forever... 🫠',
            'Infinite Satisfaction in 60 Seconds ⚡',
            'This Is What Perfection Looks Like 💎',
        ],
        hashtags: '#newtoncradle #physics #satisfying #oddlysatisfying #asmr #mesmerizing #hypnotic #relaxing #zen #focusmusic',
    },
    {
        scene: 6,
        name: 'geometric-art',
        titles: [
            'A Pen Drawing Perfect Geometry... Mesmerizing 🔮',
            'Watch This Line Create Pure Art ✨',
            'This AI Compass Is Better Than Any Artist 🎨',
            'Mathematical Beauty in 60 Seconds 📐💫',
            'The Pen Moves and Magic Happens ✍️🔮',
            'You Will NOT Look Away From This 👀',
            'Sacred Geometry Being Born Right Now 🌀',
            'This Pattern Will Reset Your Brain 🧠✨',
            'Geometry Has Never Been This Beautiful 💎',
            'Watch the Pen Dance in Perfect Circles 🎭',
            'Art Made by Math Alone 📐🎨',
            'Put Your Headphones On For This One 🎧🔮',
        ],
        hashtags: '#geometricart #sacredgeometry #generativeart #compass #drawing #art #satisfying #mesmerizing #mathisbeautiful #asmr',
    },
    {
        scene: 7,
        name: 'ping-pong',
        titles: [
            'AI vs AI Pong: THE FINAL 🏓🔥 Who Wins?!',
            "THE MOST DRAMATIC Pong Match You'll Ever See 😱",
            'WHO WINS? Comment Below 👇🏓',
            'This AI Pong Match Goes INSANE at the End 🤯',
            'You Will NOT Believe the Final Score 🏓💀',
            '60 Seconds of Pure Pong Drama ⚡🏓',
            'ALPHA vs OMEGA — Only One Survives 🔵🔴',
            'The Greatest AI Battle of All Time 🤖🏓',
            'Wait For the Overtime... 😮🏓',
            'This Match Point Will Give You Chills 🥶🏓',
            'THE FINAL: Watch Till The End 👀🏓',
            'AI Pong World Cup — Sound ON 🎧🏓🔥',
        ],
        hashtags: '#pong #aivs #gaming #satisfying #dramatic #sports #viral #watchthisend #mindblowing #trending',
    },
];

// ── Global hashtags (always append some of these) ──────────────
const GLOBAL_TAGS = '#fyp #foryou #foryoupage #viral #trending #watchthis #animation #satisfying';

// ── Pick random ────────────────────────────────────────────────
function pickScene(forceScene, exclude = []) {
    if (forceScene) {
        return SCENES.find(s => s.scene === forceScene) || SCENES[0];
    }
    const available = SCENES.filter(s => !exclude.includes(s.scene));
    if (available.length === 0) return SCENES[0]; // fallback
    return available[Math.floor(Math.random() * available.length)];
}

function pickTitle(scene) {
    const title = scene.titles[Math.floor(Math.random() * scene.titles.length)];
    const globalTags = GLOBAL_TAGS.split(' ').sort(() => Math.random() - 0.5).slice(0, 4).join(' ');
    return `${title}\n\n${scene.hashtags} ${globalTags}`;
}

function generateVideo(scene) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `${scene.name}-${timestamp}`;
    const mp4File = path.resolve('output', `${fileName}.mp4`);

    const IS_CI = !!process.env.CI;
    const script = IS_CI ? 'record-ci.mjs' : 'record.mjs';

    execSync(`node ${script} ${scene.scene} ${fileName}`, {
        stdio: 'inherit',
        timeout: IS_CI ? 300_000 : 120_000,
    });

    if (!fs.existsSync(mp4File)) {
        throw new Error(`Expected file not found: ${mp4File}`);
    }
    return mp4File;
}

function uploadToSheet(mp4File, title) {
    const skill = path.join(process.env.HOME || '~', '.gemini/antigravity/skills/google-docs');
    let python = path.join(skill, '.venv/bin/python');
    if (!fs.existsSync(python)) python = path.join(skill, 'venv/bin/python');
    if (!fs.existsSync(python)) python = 'python3';

    const publishScript = path.resolve('scripts/publish_to_drive.py');

    // Escape title for shell (replace quotes)
    const safeTitle = title.replace(/"/g, '\\"');

    execSync(
        `${python} "${publishScript}" "${mp4File}" "${safeTitle}" --folder "${DRIVE_FOLDER}" --sheet "${SHEET_ID}"`,
        { stdio: 'inherit', timeout: 60_000 }
    );
}

// ── Main ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const forceSceneIdx = args.indexOf('--scene');
const forceScene = forceSceneIdx >= 0 ? parseInt(args[forceSceneIdx + 1]) : null;

const MAX_RETRIES = 2;
let excludeScenes = [];
let success = false;

for (let attempt = 0; attempt <= MAX_RETRIES && !success; attempt++) {
    const scene = pickScene(forceScene, excludeScenes);
    const title = pickTitle(scene);

    console.log('═'.repeat(60));
    console.log(`🎬 TIKTOK PUBLISH PIPELINE${attempt > 0 ? ` (retry ${attempt})` : ''}`);
    console.log('═'.repeat(60));
    console.log(`\n📹 Scene: ${scene.scene} (${scene.name})`);
    console.log(`📝 Title: ${title}\n`);

    if (dryRun) {
        console.log('🔍 DRY RUN — no recording or upload');
        process.exit(0);
    }

    // 1. Generate video
    console.log('─'.repeat(60));
    console.log('📸 Step 1: Generating video...\n');

    let mp4File;
    try {
        mp4File = generateVideo(scene);
    } catch (e) {
        console.error(`\n⚠️ Video generation failed for ${scene.name}: ${e.message}`);
        excludeScenes.push(scene.scene);
        if (attempt < MAX_RETRIES) {
            console.log(`\n🔄 Retrying with a different scene...\n`);
            continue;
        }
        console.error('❌ All retries exhausted');
        process.exit(1);
    }

    const fileSize = (fs.statSync(mp4File).size / 1048576).toFixed(1);
    console.log(`\n✅ Video: ${mp4File} (${fileSize} MB)`);

    // 2. Upload to Drive + Sheet
    console.log('\n' + '─'.repeat(60));
    console.log('☁️  Step 2: Uploading to Google Drive + Sheet...\n');

    try {
        uploadToSheet(mp4File, title);
    } catch (e) {
        console.error(`\n❌ Upload failed: ${e.message}`);
        process.exit(1);
    }

    success = true;
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 PUBLISHED SUCCESSFULLY!');
    console.log('═'.repeat(60));
}
