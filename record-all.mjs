#!/usr/bin/env node
/**
 * record-all.mjs — Record all 3 scenes
 *
 * Auto-detects CI and uses frame-by-frame capture for perfect smoothness.
 * Local: uses real-time MediaRecorder (keeps audio fidelity).
 *
 * Usage:
 *   node record-all.mjs          # auto-detect
 *   CI=true node record-all.mjs  # force CI mode
 */
import { execSync } from 'child_process';

const IS_CI = !!process.env.CI;
const script = IS_CI ? 'record-ci.mjs' : 'record.mjs';

const scenes = [
    { scene: 3, name: 'newtons-cradle' },
    { scene: 6, name: 'geometric-art' },
    { scene: 7, name: 'ping-pong' },
];

console.log(`\n🎬 Recording mode: ${IS_CI ? 'CI (frame-by-frame)' : 'Local (real-time)'}`);
console.log(`📜 Script: ${script}\n`);

for (const { scene, name } of scenes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎬 Scene ${scene}: ${name}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        execSync(`node ${script} ${scene} ${name}`, {
            stdio: 'inherit',
            timeout: IS_CI ? 300_000 : 120_000, // 5 min for CI (frame-by-frame is slower)
        });
        console.log(`\n✅ ${name} done!\n`);
    } catch (e) {
        console.error(`\n❌ ${name} failed: ${e.message}\n`);
    }
}

console.log('\n🏁 All recordings complete!');
