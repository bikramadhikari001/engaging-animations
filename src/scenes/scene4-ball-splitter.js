/**
 * Scene 4: Ball Splitter
 * 
 * A large ball drops from the top, hits a wedge, and splits into 2.
 * Each half hits another wedge and splits again. And again.
 * Cascade of splitting: 1 → 2 → 4 → 8 → 16 → 32 → ...
 * Each generation gets smaller.
 * Incredibly satisfying chain reaction.
 */
import { createPhysicsWorld } from '../utils/physics.js';
import { collisionSound, startAmbient, popSound } from '../utils/sound.js';
import Matter from 'matter-js';

const { Bodies, Composite, Body, Events, Vector } = Matter;

export function createScene(container) {
    const pw = createPhysicsWorld(container);
    const W = pw.CANVAS_W;
    const H = pw.CANVAS_H;

    // === BUILD SPLITTER LEVELS ===
    // Each level has wedges that split balls
    const levels = [
        { y: 350, wedges: 1, ballRadius: 45 },
        { y: 580, wedges: 2, ballRadius: 30 },
        { y: 780, wedges: 4, ballRadius: 20 },
        { y: 960, wedges: 8, ballRadius: 13 },
        { y: 1120, wedges: 16, ballRadius: 8 },
    ];

    // Floor and walls
    pw.addRect(W / 2, H + 25, W + 100, 50, { label: 'floor' });
    pw.addRect(-25, H / 2, 50, H + 100, { label: 'boundary' });
    pw.addRect(W + 25, H / 2, 50, H + 100, { label: 'boundary' });

    // Shelf at bottom to collect tiny balls
    pw.addRect(W / 2, H - 200, W - 80, 6, { label: 'wall' });

    // Build wedges for each level
    for (const level of levels) {
        const spacing = W / (level.wedges + 1);
        for (let i = 0; i < level.wedges; i++) {
            const x = spacing * (i + 1);
            // Wedge = two small angled rectangles meeting at a point (V shape)
            const wedgeSize = Math.max(30, 80 - level.wedges * 3);
            pw.addRect(x - wedgeSize / 3, level.y + 15, wedgeSize, 5, {
                label: 'peg',
                angle: 0.5,
                restitution: 0.6,
            });
            pw.addRect(x + wedgeSize / 3, level.y + 15, wedgeSize, 5, {
                label: 'peg',
                angle: -0.5,
                restitution: 0.6,
            });
            // Small tip circle
            pw.addCircle(x, level.y, 5, { label: 'peg', restitution: 0.7 });
        }
    }

    // === COLLISION-BASED SPLITTING ===
    const splitTracker = new Set(); // track which balls have already split

    pw.onCollision((a, b, speed) => {
        if (speed < 0.5) return;

        const isPeg = a.label === 'peg' || b.label === 'peg';
        const ball = a.label === 'ball' ? a : (b.label === 'ball' ? b : null);
        const isFloor = a.label === 'floor' || b.label === 'floor' ||
            a.label === 'wall' || b.label === 'wall';

        if (isPeg && ball && !splitTracker.has(ball.id)) {
            const r = ball.circleRadius;
            if (r > 6) { // only split if big enough
                splitTracker.add(ball.id);
                // Remove the original ball
                setTimeout(() => {
                    try {
                        pw.removeBody(ball);
                    } catch (e) { }
                    // Spawn 2 smaller balls
                    const newR = r * 0.65;
                    const pos = ball.position;
                    const vel = ball.velocity;
                    pw.addBall(pos.x - r * 0.5, pos.y, newR, {
                        restitution: 0.5,
                    });
                    pw.addBall(pos.x + r * 0.5, pos.y, newR, {
                        restitution: 0.5,
                    });
                    Body.setVelocity(
                        Composite.allBodies(pw.world).filter(b => b.label === 'ball').slice(-2)[0],
                        { x: vel.x - 2, y: vel.y }
                    );
                    Body.setVelocity(
                        Composite.allBodies(pw.world).filter(b => b.label === 'ball').slice(-1)[0],
                        { x: vel.x + 2, y: vel.y }
                    );
                    popSound();
                }, 0);
            } else {
                collisionSound(speed, 'peg');
            }
        } else if (isFloor && ball) {
            collisionSound(speed, 'wall');
        } else if (a.label === 'ball' && b.label === 'ball') {
            collisionSound(speed, 'ball');
        }
    });

    // === SPAWNER — drop one big ball periodically ===
    function dropBigBall() {
        // Clean up small balls at bottom
        const bodies = Composite.allBodies(pw.world);
        let count = 0;
        for (const b of bodies) {
            if (b.label === 'ball') count++;
        }
        // If too many, clear them
        if (count > 300) {
            for (const b of bodies) {
                if (b.label === 'ball' && b.position.y > H - 300) {
                    pw.removeBody(b);
                }
            }
        }

        splitTracker.clear();
        const bigBall = pw.addBall(W / 2 + (Math.random() - 0.5) * 40, 60, 45, {
            restitution: 0.5,
            density: 0.005,
        });
    }

    startAmbient();
    dropBigBall();

    const spawnInterval = setInterval(dropBigBall, 8000);

    // Ball count display
    function customDraw(ctx) {
        const bodies = Composite.allBodies(pw.world);
        let count = 0;
        for (const b of bodies) if (b.label === 'ball') count++;
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${count}`, W / 2, 40);
    }

    pw.start(customDraw);

    return {
        destroy() {
            clearInterval(spawnInterval);
            pw.destroy();
        }
    };
}
