/**
 * record-ci.mjs — Deterministic frame-by-frame video capture
 *
 * FIXES choppy CI video by:
 * 1. Overriding requestAnimationFrame so we control frame timing
 * 2. Capturing each frame as a screenshot (guaranteed perfect)
 * 3. Stitching at exactly 30fps with ffmpeg
 * 4. Generating audio synthetically (432Hz drone / beat)
 *
 * Usage:
 *   node record-ci.mjs 3 newtons-cradle    # scene 3
 *   node record-ci.mjs 6 geometric-art     # scene 6
 *   node record-ci.mjs 7 ping-pong         # scene 7
 */
import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCENE_INDEX = parseInt(process.argv[2] || '3') - 1;
const FILE_NAME = process.argv[3] || `scene${SCENE_INDEX + 1}`;
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION = 63; // seconds
const TOTAL_FRAMES = FPS * DURATION;
const OUTPUT_DIR = path.resolve('output');
const FRAMES_DIR = path.join(OUTPUT_DIR, `frames-${FILE_NAME}`);
const MP4_FILE = path.join(OUTPUT_DIR, `${FILE_NAME}.mp4`);
const URL = 'http://localhost:3000';

async function main() {
    // Clean/create directories
    if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`🎬 Frame-by-frame capture: scene ${SCENE_INDEX + 1} → "${FILE_NAME}"`);
    console.log(`📐 ${WIDTH}×${HEIGHT} @ ${FPS}fps × ${DURATION}s = ${TOTAL_FRAMES} frames\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        protocolTimeout: 300000, // 5 min — pong scene needs more time
        args: [
            `--window-size=${WIDTH},${HEIGHT}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--autoplay-policy=no-user-gesture-required',
        ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    // Override requestAnimationFrame BEFORE page loads so it's deterministic
    await page.evaluateOnNewDocument(() => {
        let _rafId = 0;
        const _callbacks = new Map();
        let _time = 0;

        window._originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = (cb) => {
            const id = ++_rafId;
            _callbacks.set(id, cb);
            return id;
        };
        window.cancelAnimationFrame = (id) => {
            _callbacks.delete(id);
        };

        // Advance one frame: calls all pending rAF callbacks with a fixed timestep
        window.__tick = (dt) => {
            _time += dt;
            const cbs = Array.from(_callbacks.entries());
            _callbacks.clear();
            for (const [, cb] of cbs) {
                try { cb(_time); } catch (e) { console.error(e); }
            }
        };

        // Also override performance.now to return our controlled time
        const _perfNow = performance.now.bind(performance);
        performance.now = () => _time;
    });

    console.log('📡 Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Set the scene and start (audio will fail silently in headless — that's fine)
    await page.evaluate((sceneIdx) => {
        window.__recordScene = sceneIdx;
    }, SCENE_INDEX);

    console.log('▶️  Starting animation...');
    await page.evaluate(() => {
        // Start without waiting for audio
        return window.__autoStart().catch(() => { });
    });

    // Give the scene a moment to initialize
    // Tick a few times to get past any initialization frames
    for (let i = 0; i < 3; i++) {
        await page.evaluate((dt) => window.__tick(dt), 1000 / 60);
        await new Promise(r => setTimeout(r, 50));
    }

    // Capture frames using canvas.toDataURL (much faster than page.screenshot)
    const startTime = Date.now();
    const frameDt = 1000 / 60;
    const ticksPerFrame = 2; // 2 animation ticks per captured frame

    console.log(`\n📸 Capturing ${TOTAL_FRAMES} frames...\n`);

    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
        // Advance animation
        await page.evaluate((dt, ticks) => {
            for (let t = 0; t < ticks; t++) window.__tick(dt);
        }, frameDt, ticksPerFrame);

        // Extract canvas as JPEG data URL (WAY faster than page.screenshot)
        let retries = 3;
        while (retries > 0) {
            try {
                const dataUrl = await page.evaluate(() => {
                    const c = document.querySelector('canvas');
                    return c ? c.toDataURL('image/jpeg', 0.85) : null;
                });
                if (dataUrl) {
                    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
                    const frameNum = String(frame).padStart(5, '0');
                    fs.writeFileSync(
                        path.join(FRAMES_DIR, `frame_${frameNum}.jpg`),
                        Buffer.from(base64, 'base64')
                    );
                }
                break;
            } catch (e) {
                retries--;
                if (retries === 0) console.warn(`\n⚠️ Frame ${frame} skipped: ${e.message}`);
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // Progress
        if (frame % 60 === 0 || frame === TOTAL_FRAMES - 1) {
            const pct = Math.floor((frame / TOTAL_FRAMES) * 100);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            process.stdout.write(`\r📸 Frame ${frame + 1}/${TOTAL_FRAMES} (${pct}%) — ${elapsed}s`);
        }
    }

    console.log('\n\n⏹️  Capture complete!');

    // Collect audio events from the scene (pong logs collisions)
    let audioEvents = [];
    try {
        audioEvents = await page.evaluate(() => window.__audioEvents || []);
        console.log(`🎵 Collected ${audioEvents.length} audio events`);
    } catch (e) { /* no events */ }

    await browser.close();

    // Generate audio track
    console.log('🎵 Generating audio...');
    const audioFile = path.join(OUTPUT_DIR, `${FILE_NAME}-audio.m4a`);
    const audioTempFile = path.join(OUTPUT_DIR, `${FILE_NAME}-video-only.mp4`);

    if (SCENE_INDEX + 1 === 7 && audioEvents.length > 0) {
        // Event-driven pong audio: generate per-event sounds at exact timestamps
        const sfxDir = path.join(OUTPUT_DIR, `sfx-${FILE_NAME}`);
        if (fs.existsSync(sfxDir)) fs.rmSync(sfxDir, { recursive: true });
        fs.mkdirSync(sfxDir, { recursive: true });

        // Generate master sound effects (short samples)
        const paddleSfx = path.join(sfxDir, 'paddle.wav');
        const wallSfx = path.join(sfxDir, 'wall.wav');
        const smashSfx = path.join(sfxDir, 'smash.wav');
        const scoreSfx = path.join(sfxDir, 'score.wav');

        // Paddle: sharp 2kHz ping (0.05s)
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=2000:duration=0.05" -af "volume=0.8,afade=t=out:st=0.02:d=0.03" "${paddleSfx}"`, { stdio: 'pipe' });
        // Wall: deep 80Hz thump (0.08s)
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=80:duration=0.08" -af "volume=0.6,afade=t=out:st=0.03:d=0.05" "${wallSfx}"`, { stdio: 'pipe' });
        // Smash: noise burst (0.12s)
        execSync(`ffmpeg -y -f lavfi -i "anoisesrc=d=0.12:c=white:a=0.5" -af "bandpass=f=3000:w=2000,volume=1.0,afade=t=out:st=0.04:d=0.08" "${smashSfx}"`, { stdio: 'pipe' });
        // Score: descending tone (0.3s)
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=500:duration=0.3" -af "asetrate=44100*0.6,atempo=1.67,volume=0.7,afade=t=out:st=0.1:d=0.2" "${scoreSfx}"`, { stdio: 'pipe' });

        // Generate a silent base track
        const baseSilence = path.join(sfxDir, 'silence.wav');
        execSync(`ffmpeg -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t ${DURATION} "${baseSilence}"`, { stdio: 'pipe' });

        // Build ffmpeg filter to mix all events at correct timestamps
        // Group events and place them using adelay
        const sfxMap = { paddle: paddleSfx, wall: wallSfx, smash: smashSfx, score: scoreSfx };
        let inputs = [`-i "${baseSilence}"`]; // input 0 = silence base
        let filterParts = [];
        let mixInputs = ['[0]']; // start with silence

        // Limit to 150 events to avoid ffmpeg command line overflow
        const events = audioEvents.slice(0, 150);
        console.log(`🔊 Mixing ${events.length} collision sounds...`);

        for (let i = 0; i < events.length; i++) {
            const ev = events[i];
            const sfx = sfxMap[ev.type] || paddleSfx;
            const delayMs = Math.max(0, Math.round(ev.t * 1000));
            inputs.push(`-i "${sfx}"`);
            filterParts.push(`[${i + 1}]adelay=${delayMs}|${delayMs},apad=whole_dur=${DURATION}[e${i}]`);
            mixInputs.push(`[e${i}]`);
        }

        // Also add a subtle beat underneath
        const beatFile = path.join(sfxDir, 'beat.wav');
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=55:duration=${DURATION}" -f lavfi -i "sine=frequency=800:duration=${DURATION}" -filter_complex "[0]volume=0.2[k];[1]apulsator=mode=sine:hz=3:amount=1,volume=0.08[h];[k][h]amix=inputs=2:duration=longest" "${beatFile}"`, { stdio: 'pipe' });
        inputs.push(`-i "${beatFile}"`);
        const beatIdx = events.length + 1;
        mixInputs.push(`[${beatIdx}]`);

        const totalMixInputs = mixInputs.length;
        const filterGraph = filterParts.length > 0
            ? filterParts.join(';') + `;${mixInputs.join('')}amix=inputs=${totalMixInputs}:duration=longest:normalize=0`
            : `${mixInputs.join('')}amix=inputs=${totalMixInputs}:duration=longest:normalize=0`;

        execSync(`ffmpeg -y ${inputs.join(' ')} -filter_complex "${filterGraph}" -c:a aac -b:a 128k "${audioFile}"`, { stdio: 'pipe' });

        // Cleanup sfx
        fs.rmSync(sfxDir, { recursive: true });
    } else if (SCENE_INDEX + 1 === 7) {
        // Fallback pong audio (no events captured)
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=55:duration=${DURATION}" -f lavfi -i "sine=frequency=800:duration=${DURATION}" -f lavfi -i "anoisesrc=d=${DURATION}:c=pink:a=0.3" -filter_complex "[0]volume=0.35[kick];[1]apulsator=mode=sine:hz=4.3:amount=1,volume=0.12[hat];[2]bandpass=f=2000:w=800,apulsator=mode=sine:hz=2.1:amount=1,volume=0.25[ping];[kick][hat][ping]amix=inputs=3:duration=longest" -c:a aac -b:a 128k "${audioFile}"`, { stdio: 'pipe' });
    } else {
        // Scenes 3 & 6: 432Hz ambient drone
        execSync(`ffmpeg -y -f lavfi -i "sine=frequency=432:duration=${DURATION}" -f lavfi -i "sine=frequency=216:duration=${DURATION}" -filter_complex "[0]volume=0.15[a];[1]volume=0.1[b];[a][b]amix=inputs=2:duration=longest" -c:a aac -b:a 128k "${audioFile}"`, { stdio: 'pipe' });
    }

    // Stitch frames into video
    console.log('🔄 Encoding video...');
    execSync(`ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.jpg" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "${audioTempFile}"`, { stdio: 'pipe' });

    // Merge video + audio
    console.log('🔊 Merging audio...');
    execSync(`ffmpeg -y -i "${audioTempFile}" -i "${audioFile}" -c:v copy -c:a copy -shortest -movflags +faststart "${MP4_FILE}"`, { stdio: 'pipe' });

    // Cleanup temp files
    fs.rmSync(FRAMES_DIR, { recursive: true });
    try { fs.unlinkSync(audioFile); } catch (e) { }
    try { fs.unlinkSync(audioTempFile); } catch (e) { }

    const size = (fs.statSync(MP4_FILE).size / 1048576).toFixed(1);
    console.log(`\n✅ ${MP4_FILE}`);
    console.log(`📦 ${size} MB | ${WIDTH}×${HEIGHT} | ${FPS}fps × ${DURATION}s | 🔊 Audio`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
