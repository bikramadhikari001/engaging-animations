/**
 * Scene 1: Plinko Board
 * 
 * Balls drop continuously from the top through a grid of pegs.
 * Each peg collision makes a satisfying click.
 * Balls collect at the bottom in bins.
 * Runs forever — new balls keep spawning.
 */
import { createPhysicsWorld } from '../utils/physics.js';
import { collisionSound, startAmbient, popSound } from '../utils/sound.js';

export function createScene(container) {
    const pw = createPhysicsWorld(container);
    const W = pw.CANVAS_W;
    const H = pw.CANVAS_H;

    // === BUILD THE PLINKO BOARD ===

    // Boundary walls
    pw.addRect(W / 2, H + 25, W + 100, 50, { label: 'floor' }); // floor
    pw.addRect(-25, H / 2, 50, H + 100, { label: 'boundary' }); // left
    pw.addRect(W + 25, H / 2, 50, H + 100, { label: 'boundary' }); // right

    // Peg grid
    const pegRadius = 8;
    const rows = 16;
    const cols = 12;
    const pegSpacingX = W / (cols + 1);
    const pegSpacingY = 70;
    const startY = 350;

    for (let row = 0; row < rows; row++) {
        const offset = row % 2 === 0 ? 0 : pegSpacingX / 2;
        const numCols = row % 2 === 0 ? cols : cols - 1;
        for (let col = 0; col < numCols; col++) {
            const x = pegSpacingX + col * pegSpacingX + offset;
            const y = startY + row * pegSpacingY;
            pw.addCircle(x, y, pegRadius, { label: 'peg', restitution: 0.5 });
        }
    }

    // Bin dividers at bottom
    const binY = startY + rows * pegSpacingY + 60;
    const binHeight = H - binY;
    const numBins = cols + 1;
    for (let i = 0; i <= numBins; i++) {
        const x = i * (W / numBins);
        pw.addRect(x, binY + binHeight / 2, 4, binHeight, { label: 'wall' });
    }

    // Ramp guides at top
    pw.addRect(W * 0.35, 200, 250, 6, { label: 'wall', angle: 0.2 });
    pw.addRect(W * 0.65, 200, 250, 6, { label: 'wall', angle: -0.2 });

    // === COLLISION SOUNDS ===
    pw.onCollision((a, b, speed) => {
        if (speed < 1) return;
        const isPeg = a.label === 'peg' || b.label === 'peg';
        const isWall = a.label === 'wall' || b.label === 'wall' ||
            a.label === 'floor' || b.label === 'floor' ||
            a.label === 'boundary' || b.label === 'boundary';
        const isBall = a.label === 'ball' && b.label === 'ball';

        if (isPeg) collisionSound(speed, 'peg');
        else if (isBall) collisionSound(speed, 'ball');
        else if (isWall) collisionSound(speed, 'wall');
    });

    // === BALL SPAWNER ===
    let ballCount = 0;
    const maxBalls = 200;
    let spawnTimer = 0;

    function spawnBall() {
        if (ballCount >= maxBalls) {
            // Remove oldest balls that are below the screen
            const bodies = pw.Matter.Composite.allBodies(pw.world);
            for (const b of bodies) {
                if (b.label === 'ball' && b.position.y > H - 50) {
                    pw.removeBody(b);
                    ballCount--;
                    break;
                }
            }
        }
        const x = W / 2 + (Math.random() - 0.5) * 60;
        pw.addBall(x, 50, 10 + Math.random() * 6, {
            restitution: 0.4 + Math.random() * 0.3,
        });
        ballCount++;
        popSound();
    }

    // === CUSTOM DRAW (counter) ===
    function customDraw(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${ballCount} balls`, W / 2, 50);
    }

    // === START ===
    startAmbient();

    // Spawn balls on interval
    const spawnInterval = setInterval(() => {
        spawnBall();
    }, 300);

    // Initial burst
    for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnBall(), i * 100);
    }

    pw.start(customDraw);

    return {
        destroy() {
            clearInterval(spawnInterval);
            pw.destroy();
        }
    };
}
