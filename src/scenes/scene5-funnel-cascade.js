/**
 * Scene 5: Funnel Cascade
 * 
 * Multi-level system of funnels, ramps, and obstacles.
 * Balls pour from top, bounce through ramps, collect in funnels,
 * drop through to next level, repeat.
 * Like a vertical marble run.
 */
import { createPhysicsWorld } from '../utils/physics.js';
import { collisionSound, startAmbient, popSound } from '../utils/sound.js';
import Matter from 'matter-js';

const { Composite } = Matter;

export function createScene(container) {
    const pw = createPhysicsWorld(container);
    const W = pw.CANVAS_W;
    const H = pw.CANVAS_H;

    // === BOUNDARIES ===
    pw.addRect(W / 2, H + 25, W + 100, 50, { label: 'floor' });
    pw.addRect(-25, H / 2, 50, H + 100, { label: 'boundary' });
    pw.addRect(W + 25, H / 2, 50, H + 100, { label: 'boundary' });

    // === LEVEL 1: Top ramps (zigzag) ===
    pw.addRect(300, 300, 450, 8, { label: 'wall', angle: 0.18 });
    pw.addRect(750, 420, 450, 8, { label: 'wall', angle: -0.18 });
    pw.addRect(300, 540, 450, 8, { label: 'wall', angle: 0.18 });

    // Pegs between ramps
    for (let i = 0; i < 6; i++) {
        pw.addCircle(180 + i * 140, 360, 8, { label: 'peg' });
        pw.addCircle(250 + i * 140, 480, 8, { label: 'peg' });
    }

    // === LEVEL 2: Funnel ===
    // Left wall of funnel
    pw.addRect(280, 680, 350, 8, { label: 'wall', angle: 0.4 });
    // Right wall of funnel
    pw.addRect(800, 680, 350, 8, { label: 'wall', angle: -0.4 });
    // Funnel gap (no floor — balls fall through)

    // Pegs inside funnel
    for (let i = 0; i < 5; i++) {
        pw.addCircle(400 + i * 60, 720, 6, { label: 'peg' });
    }

    // === LEVEL 3: Zigzag back ===
    pw.addRect(750, 850, 400, 8, { label: 'wall', angle: -0.15 });
    pw.addRect(300, 960, 400, 8, { label: 'wall', angle: 0.15 });
    pw.addRect(750, 1070, 400, 8, { label: 'wall', angle: -0.15 });

    // Pegs
    for (let i = 0; i < 8; i++) {
        pw.addCircle(200 + i * 100, 900, 7, { label: 'peg' });
        pw.addCircle(250 + i * 100, 1020, 7, { label: 'peg' });
    }

    // === LEVEL 4: Second funnel (narrower) ===
    pw.addRect(350, 1180, 280, 8, { label: 'wall', angle: 0.5 });
    pw.addRect(730, 1180, 280, 8, { label: 'wall', angle: -0.5 });

    // === LEVEL 5: Final cascade of pegs into collection ===
    for (let row = 0; row < 6; row++) {
        const offset = row % 2 === 0 ? 0 : 45;
        for (let col = 0; col < 8; col++) {
            pw.addCircle(250 + col * 75 + offset, 1350 + row * 55, 6, { label: 'peg' });
        }
    }

    // Collection bins at bottom
    for (let i = 0; i < 6; i++) {
        pw.addRect(200 + i * 130, H - 120, 4, 160, { label: 'wall' });
    }

    // === COLLISION SOUNDS ===
    pw.onCollision((a, b, speed) => {
        if (speed < 0.8) return;
        const isPeg = a.label === 'peg' || b.label === 'peg';
        const isWall = a.label === 'wall' || b.label === 'wall' ||
            a.label === 'floor' || b.label === 'floor';
        const isBall = a.label === 'ball' && b.label === 'ball';

        if (isPeg) collisionSound(speed, 'peg');
        else if (isBall) collisionSound(speed, 'ball');
        else if (isWall) collisionSound(speed, 'wall');
    });

    // === BALL SPAWNER ===
    let ballCount = 0;
    const maxBalls = 180;

    function spawnBall() {
        if (ballCount >= maxBalls) {
            // Remove balls at very bottom
            const bodies = Composite.allBodies(pw.world);
            for (const b of bodies) {
                if (b.label === 'ball' && b.position.y > H - 30) {
                    pw.removeBody(b);
                    ballCount--;
                    if (ballCount < maxBalls - 20) break;
                }
            }
        }
        const x = W / 2 + (Math.random() - 0.5) * 200;
        pw.addBall(x, 50, 9 + Math.random() * 5, {
            restitution: 0.4 + Math.random() * 0.2,
        });
        ballCount++;
    }

    startAmbient();

    const spawnInterval = setInterval(() => {
        spawnBall();
    }, 250);

    // Initial burst
    for (let i = 0; i < 6; i++) {
        setTimeout(() => spawnBall(), i * 80);
    }

    function customDraw(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${ballCount}`, W / 2, 40);
    }

    pw.start(customDraw);

    return {
        destroy() {
            clearInterval(spawnInterval);
            pw.destroy();
        }
    };
}
