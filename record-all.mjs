#!/usr/bin/env node
/**
 * record-all.mjs — Record all 3 scenes sequentially
 *
 * Usage: node record-all.mjs
 * CI:    xvfb-run node record-all.mjs
 */
import { execSync } from 'child_process';

const scenes = [
    { scene: 3, name: 'newtons-cradle' },
    { scene: 6, name: 'geometric-art' },
    { scene: 7, name: 'ping-pong' },
];

for (const { scene, name } of scenes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎬 Recording scene ${scene}: ${name}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        execSync(`node record.mjs ${scene} ${name}`, {
            stdio: 'inherit',
            timeout: 120_000, // 2 min timeout per scene
        });
        console.log(`\n✅ ${name} done!\n`);
    } catch (e) {
        console.error(`\n❌ ${name} failed: ${e.message}\n`);
        // Continue to next scene even if one fails
    }
}

console.log('\n🏁 All recordings complete!');
