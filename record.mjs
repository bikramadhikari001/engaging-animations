/**
 * record.mjs — Headed browser recording with audio
 *
 * Opens a real Chrome window, lets MediaRecorder capture canvas + audio,
 * catches the downloaded WebM file, converts to MP4.
 *
 * Usage: node record.mjs
 */
import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const WIDTH = 1080;
const HEIGHT = 1920;
const RECORD_SECONDS = 63;
const OUTPUT_DIR = path.resolve('output');
const WEBM_FILE = path.join(OUTPUT_DIR, 'newtons-cradle.webm');
const MP4_FILE = path.join(OUTPUT_DIR, 'newtons-cradle.mp4');
const URL = 'http://localhost:3000';

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('🚀 Launching browser...');
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

    // Set download path so we can find the file
    const client = await page.createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: OUTPUT_DIR,
    });

    console.log(`📡 Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });

    // Listen to browser console for progress
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Chunk') || text.includes('✅') || text.includes('🔴') || text.includes('⏹') || text.includes('Audio')) {
            console.log(`  🌐 ${text}`);
        }
    });

    console.log('▶️  Starting scene + recording...');
    await page.evaluate(() => window.__autoStart());

    console.log(`⏳ Recording for ${RECORD_SECONDS}s... keep browser visible!\n`);

    // Progress
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = RECORD_SECONDS + 5 - elapsed;
        if (remaining > 0) {
            process.stdout.write(`\r🔴 ${elapsed}s / ${RECORD_SECONDS}s  `);
        }
    }, 1000);

    // Wait for recording to finish
    await page.waitForFunction('window.__recordingDone === true', {
        timeout: (RECORD_SECONDS + 15) * 1000,
        polling: 1000,
    });
    clearInterval(progressInterval);

    // Wait for download to complete
    console.log('\n\n⬇️  Waiting for download to finish...');
    await new Promise(r => setTimeout(r, 5000));

    await browser.close();
    console.log('🌐 Browser closed.');

    // Find the downloaded webm file
    const downloadedFile = path.join(OUTPUT_DIR, 'newtons-cradle.webm');
    if (!fs.existsSync(downloadedFile)) {
        // Check for Chrome's default download naming
        const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
        if (files.length > 0) {
            const newest = files.sort().pop();
            fs.renameSync(path.join(OUTPUT_DIR, newest), downloadedFile);
        }
    }

    if (!fs.existsSync(downloadedFile) || fs.statSync(downloadedFile).size === 0) {
        console.error('❌ WebM file not found or empty. Check ~/Downloads for the file.');
        console.log('   If it downloaded to ~/Downloads, move it to output/ and run:');
        console.log(`   ffmpeg -y -i ~/Downloads/newtons-cradle.webm -c:v libx264 -crf 20 -c:a aac -b:a 192k "${MP4_FILE}"`);
        return;
    }

    const webmSize = (fs.statSync(downloadedFile).size / (1024 * 1024)).toFixed(1);
    console.log(`💾 WebM: ${downloadedFile} (${webmSize} MB)`);

    // Convert to MP4
    console.log('🔄 Converting to MP4...');
    try {
        execSync(
            `ffmpeg -y -i "${downloadedFile}" -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart "${MP4_FILE}"`,
            { stdio: 'pipe' }
        );
        const mp4Size = (fs.statSync(MP4_FILE).size / (1024 * 1024)).toFixed(1);
        console.log(`\n✅ Done!`);
        console.log(`📁 ${MP4_FILE}`);
        console.log(`📦 ${mp4Size} MB | 1080×1920 | ~${RECORD_SECONDS}s | 🔊 Audio included`);
    } catch (e) {
        console.log(`\n✅ WebM ready (MP4 conversion failed)`);
        console.log(`📁 ${downloadedFile}`);
    }
}

main().catch(err => {
    console.error('❌', err.message);
    process.exit(1);
});
