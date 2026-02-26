/**
 * record.mjs — Headed browser recording with audio
 *
 * Records any scene as a 1080×1920 MP4 video with audio.
 *
 * Usage:
 *   node record.mjs              # records scene 3 (Newton's Cradle)
 *   node record.mjs 6            # records scene 6 (Geometric Art)
 *   node record.mjs 6 compass    # records scene 6 with custom filename
 */
import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCENE_INDEX = parseInt(process.argv[2] || '3') - 1; // 0-indexed
const FILE_NAME = process.argv[3] || `scene${SCENE_INDEX + 1}`;
const WIDTH = 1080;
const HEIGHT = 1920;
const RECORD_SECONDS = 63;
const OUTPUT_DIR = path.resolve('output');
const WEBM_FILE = path.join(OUTPUT_DIR, `${FILE_NAME}.webm`);
const MP4_FILE = path.join(OUTPUT_DIR, `${FILE_NAME}.mp4`);
const URL = 'http://localhost:3000';

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`🚀 Recording scene ${SCENE_INDEX + 1} as "${FILE_NAME}"...`);
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--window-size=${WIDTH},${HEIGHT}`,
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
        ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    const client = await page.createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: OUTPUT_DIR,
    });

    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Chunk') || text.includes('✅') || text.includes('🔴') || text.includes('⏹') || text.includes('Audio')) {
            console.log(`  🌐 ${text}`);
        }
    });

    // Inject MediaRecorder + set scene index
    const dlName = `${FILE_NAME}.webm`;
    await page.evaluate((sceneIdx, seconds, downloadName) => {
        window.__recordScene = sceneIdx;

        const origStart = window.__autoStart;
        window.__autoStart = async () => {
            await origStart();
            await new Promise(r => setTimeout(r, 500));
            const canvas = document.querySelector('canvas');
            if (!canvas) { console.log('No canvas'); return; }

            const canvasStream = canvas.captureStream(30);
            let combinedStream;
            try {
                const audioCtx = Tone.getContext().rawContext;
                const dest = audioCtx.createMediaStreamDestination();
                Tone.getDestination().output.connect(dest);
                const audioTracks = dest.stream.getAudioTracks();
                console.log('Audio tracks found: ' + audioTracks.length);
                if (audioTracks.length > 0) {
                    combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
                    console.log('✅ Audio + Video combined');
                } else { combinedStream = canvasStream; }
            } catch (e) { combinedStream = canvasStream; }

            const chunks = [];
            const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
                ? 'video/webm;codecs=vp8,opus' : 'video/webm';
            const recorder = new MediaRecorder(combinedStream, {
                mimeType: mime, videoBitsPerSecond: 8000000, audioBitsPerSecond: 192000,
            });
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                    console.log('Chunk received: ' + e.data.size + ' bytes (total: ' + chunks.length + ')');
                }
            };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mime });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = downloadName;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                window.__recordingDone = true;
                console.log('✅ Download triggered');
            };
            window.__recordingDone = false;
            recorder.start(1000);
            console.log('🔴 Recording started');
            setTimeout(() => { recorder.stop(); console.log('⏹️ Stopped'); }, seconds * 1000);
        };
    }, SCENE_INDEX, RECORD_SECONDS, dlName);

    console.log('▶️  Starting...');
    await page.evaluate(() => window.__autoStart());

    console.log(`⏳ Recording for ${RECORD_SECONDS}s...\n`);
    const startTime = Date.now();
    const progress = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        process.stdout.write(`\r🔴 ${elapsed}s / ${RECORD_SECONDS}s  `);
    }, 1000);

    await page.waitForFunction('window.__recordingDone === true', {
        timeout: (RECORD_SECONDS + 15) * 1000, polling: 1000,
    });
    clearInterval(progress);

    console.log('\n\n⬇️  Downloading...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();

    if (!fs.existsSync(WEBM_FILE)) {
        const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
        if (files.length > 0) fs.renameSync(path.join(OUTPUT_DIR, files.sort().pop()), WEBM_FILE);
    }

    if (!fs.existsSync(WEBM_FILE) || fs.statSync(WEBM_FILE).size === 0) {
        console.error('❌ WebM not found. Check ~/Downloads.');
        return;
    }

    console.log(`💾 WebM: ${(fs.statSync(WEBM_FILE).size / 1048576).toFixed(1)} MB`);
    console.log('🔄 Converting to MP4...');
    try {
        execSync(`ffmpeg -y -i "${WEBM_FILE}" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart "${MP4_FILE}"`, { stdio: 'pipe' });
        const size = (fs.statSync(MP4_FILE).size / 1048576).toFixed(1);
        console.log(`\n✅ ${MP4_FILE}\n📦 ${size} MB | 1080×1920 | ~${RECORD_SECONDS}s | 🔊 Audio`);
    } catch (e) {
        console.log(`\n✅ WebM: ${WEBM_FILE}`);
    }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
