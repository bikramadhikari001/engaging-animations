/**
 * Scene 2: Container Fill
 * 
 * Balls pour into a geometric container (circle/bowl shape).
 * They stack up with real physics, settling and jostling.
 * Once full, the container tips and spills — then refills.
 * Deeply satisfying to watch fill up.
 */
import { createPhysicsWorld } from '../utils/physics.js';
import { collisionSound, startAmbient, popSound } from '../utils/sound.js';
import Matter from 'matter-js';

const { Bodies, Composite, Body } = Matter;

export function createScene(container) {
    const pw = createPhysicsWorld(container);
    const W = pw.CANVAS_W;
    const H = pw.CANVAS_H;

    // === BUILD THE CONTAINER (bowl shape using angled walls) ===
    const bowlCenterX = W / 2;
    const bowlCenterY = H * 0.65;
    const bowlWidth = 500;
    const bowlDepth = 400;
    const wallThickness = 8;

    // Bowl made of line segments (approximated arc)
    const numSegments = 16;
    const bowlBodies = [];
    for (let i = 0; i < numSegments; i++) {
        const angle1 = Math.PI + (i / numSegments) * Math.PI;
        const angle2 = Math.PI + ((i + 1) / numSegments) * Math.PI;
        const x1 = bowlCenterX + Math.cos(angle1) * (bowlWidth / 2);
        const y1 = bowlCenterY + Math.sin(angle1) * (bowlDepth / 2);
        const x2 = bowlCenterX + Math.cos(angle2) * (bowlWidth / 2);
        const y2 = bowlCenterY + Math.sin(angle2) * (bowlDepth / 2);

        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const ang = Math.atan2(y2 - y1, x2 - x1);

        const seg = pw.addRect(mx, my, len + 4, wallThickness, {
            label: 'wall',
            angle: ang,
            restitution: 0.3,
        });
        bowlBodies.push(seg);
    }

    // Floor
    pw.addRect(W / 2, H + 25, W + 100, 50, { label: 'floor' });
    // Side walls (to catch spills)
    pw.addRect(-25, H / 2, 50, H + 100, { label: 'boundary' });
    pw.addRect(W + 25, H / 2, 50, H + 100, { label: 'boundary' });

    // Funnel above bowl to guide balls
    pw.addRect(bowlCenterX - 170, bowlCenterY - 350, 300, 6, { label: 'wall', angle: 0.35 });
    pw.addRect(bowlCenterX + 170, bowlCenterY - 350, 300, 6, { label: 'wall', angle: -0.35 });

    // === COLLISION SOUNDS ===
    pw.onCollision((a, b, speed) => {
        if (speed < 0.8) return;
        const isWall = a.label === 'wall' || b.label === 'wall' ||
            a.label === 'floor' || b.label === 'floor';
        const isBall = a.label === 'ball' && b.label === 'ball';

        if (isBall) collisionSound(speed, 'ball');
        else if (isWall) collisionSound(speed, 'wall');
        else collisionSound(speed, 'tap');
    });

    // === BALL SPAWNER ===
    let ballCount = 0;
    const maxBalls = 250;
    let phase = 'fill'; // fill | settle | empty
    let phaseTimer = 0;

    function spawnBall() {
        if (ballCount >= maxBalls) return;
        const x = bowlCenterX + (Math.random() - 0.5) * 80;
        const r = 8 + Math.random() * 7;
        pw.addBall(x, 80, r, {
            restitution: 0.3 + Math.random() * 0.2,
            friction: 0.08,
        });
        ballCount++;
    }

    // Counter display
    function customDraw(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${ballCount}`, W / 2, 50);
    }

    // === START ===
    startAmbient();

    const spawnInterval = setInterval(() => {
        if (phase === 'fill') {
            spawnBall();
            spawnBall(); // pour 2 at a time for visual density
            if (ballCount >= maxBalls) {
                phase = 'settle';
                phaseTimer = setTimeout(() => {
                    // After settling, remove all balls below bowl and respawn
                    phase = 'empty';
                    const bodies = Composite.allBodies(pw.world);
                    let removed = 0;
                    for (const b of bodies) {
                        if (b.label === 'ball') {
                            Body.setVelocity(b, { x: (Math.random() - 0.5) * 10, y: -8 - Math.random() * 12 });
                            removed++;
                        }
                    }
                    setTimeout(() => {
                        // Remove all remaining balls
                        const remaining = Composite.allBodies(pw.world);
                        for (const b of remaining) {
                            if (b.label === 'ball') {
                                pw.removeBody(b);
                            }
                        }
                        ballCount = 0;
                        phase = 'fill';
                    }, 5000);
                }, 3000);
            }
        }
    }, 120);

    // Initial burst
    for (let i = 0; i < 8; i++) {
        setTimeout(() => spawnBall(), i * 60);
    }

    pw.start(customDraw);

    return {
        destroy() {
            clearInterval(spawnInterval);
            clearTimeout(phaseTimer);
            pw.destroy();
        }
    };
}
