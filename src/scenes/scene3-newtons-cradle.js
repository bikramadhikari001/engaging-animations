/**
 * Scene 3: Newton's Cradle — REAL WORLD SIMULATION
 *
 * Realism: energy decay, imperfect balls, metallic gradient, motion blur,
 * string sag, sound variation, solid frame, gentle pull-back start.
 * 
 * Environmental forces: random wind gusts, floating dust, rare tremors.
 */
import { createPhysicsWorld } from '../utils/physics.js';
import { collisionSound, startAmbient } from '../utils/sound.js';
import Matter from 'matter-js';

const { Composite, Constraint, Body } = Matter;

// ── RANDOMIZATION ──
const BALL_PALETTES = [
    { hi: 'rgba(255,255,255,0.95)', mid: 'rgba(200,200,200,0.9)', lo: 'rgba(120,120,120,0.85)', edge: 'rgba(60,60,60,0.8)', trail: '180,180,180', name: 'silver' },
    { hi: 'rgba(255,230,150,0.95)', mid: 'rgba(220,180,60,0.9)', lo: 'rgba(160,120,30,0.85)', edge: 'rgba(100,70,10,0.8)', trail: '200,170,60', name: 'gold' },
    { hi: 'rgba(255,200,160,0.95)', mid: 'rgba(200,130,80,0.9)', lo: 'rgba(150,80,40,0.85)', edge: 'rgba(90,50,20,0.8)', trail: '190,120,70', name: 'copper' },
    { hi: 'rgba(200,220,255,0.95)', mid: 'rgba(140,170,220,0.9)', lo: 'rgba(80,110,160,0.85)', edge: 'rgba(40,60,100,0.8)', trail: '140,170,210', name: 'chrome-blue' },
    { hi: 'rgba(255,200,210,0.95)', mid: 'rgba(220,150,160,0.9)', lo: 'rgba(180,100,110,0.85)', edge: 'rgba(120,60,70,0.8)', trail: '210,150,160', name: 'rose-gold' },
    { hi: 'rgba(160,160,180,0.95)', mid: 'rgba(80,80,100,0.9)', lo: 'rgba(40,40,60,0.85)', edge: 'rgba(20,20,30,0.8)', trail: '100,100,120', name: 'obsidian' },
];
const BG_COLORS = [
    { top: '#000308', bot: '#000a18' },   // deep blue
    { top: '#050008', bot: '#0a0018' },   // deep purple
    { top: '#000805', bot: '#001810' },   // dark teal
    { top: '#080005', bot: '#180010' },   // dark wine
    { top: '#020202', bot: '#080808' },   // near-black
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function createScene(container) {
    const pw = createPhysicsWorld(container);
    const W = pw.CANVAS_W;
    const H = pw.CANVAS_H;

    pw.engine.gravity.y = 1.0;

    const cx = W / 2;
    const cy = H * 0.55;
    const numBalls = 5;
    const stringLength = 400;
    const barY = cy - stringLength;
    const baseRadius = 46;

    // Per-run visual randomization
    const ballPalette = pick(BALL_PALETTES);
    const bgTheme = pick(BG_COLORS);
    pw.setBgGradient(bgTheme.top, bgTheme.bot);
    const pullAngle = -(Math.PI / 3.5 + Math.random() * 0.3);  // varies starting energy

    // Slight imperfection per ball
    const ballData = [];
    for (let i = 0; i < numBalls; i++) {
        ballData.push({
            radius: baseRadius + (Math.random() - 0.5) * 2.5,
            density: 0.035 + (Math.random() - 0.5) * 0.003,
        });
    }

    const spacing = baseRadius * 2.02;
    const startX = cx - ((numBalls - 1) * spacing) / 2;
    const barWidth = numBalls * spacing + 120;

    // Solid frame
    pw.addRect(cx, barY, barWidth, 14, { label: 'wall' });
    pw.addRect(cx - barWidth / 2 + 8, barY + 35, 14, 60, { label: 'wall' });
    pw.addRect(cx + barWidth / 2 - 8, barY + 35, 14, 60, { label: 'wall' });
    pw.addRect(cx - barWidth / 2 + 8, barY + 68, 50, 8, { label: 'wall' });
    pw.addRect(cx + barWidth / 2 - 8, barY + 68, 50, 8, { label: 'wall' });

    // Balls + strings
    const balls = [];
    for (let i = 0; i < numBalls; i++) {
        const bd = ballData[i];
        const x = startX + i * spacing;
        const ball = pw.addBall(x, cy, bd.radius, {
            restitution: 0.98,
            friction: 0.0005,
            frictionAir: 0.00015,
            density: bd.density,
            inertia: Infinity,
        });
        const pivotX = x;
        const pivotY = barY + 7;
        Composite.add(pw.world, Constraint.create({
            pointA: { x: pivotX, y: pivotY },
            bodyB: ball,
            length: stringLength,
            stiffness: 0.99,
            damping: 0.002,
        }));
        balls.push({ ball, pivotX, pivotY, radius: bd.radius });
    }

    // Gentle start — animated pull-back
    let pullPhase = true;
    let pullProgress = 0;
    const pullDuration = 90;
    const firstBall = balls[0].ball;
    const firstPivotX = balls[0].pivotX;
    const firstPivotY = balls[0].pivotY;
    Body.setStatic(firstBall, true);

    // Motion blur history
    const posHistory = balls.map(() => []);
    const TRAIL_LENGTH = 6;

    // Collision sounds
    pw.onCollision((a, b, speed) => {
        if (speed < 0.15) return;
        if (a.label === 'ball' && b.label === 'ball') {
            collisionSound(speed, 'ball');
        }
    });

    // =============================================
    // WIND + ENVIRONMENTAL FORCES
    // =============================================
    let windForce = 0;
    let windTarget = 0;
    let nextGust = 300 + Math.random() * 600;

    const dust = [];
    const MAX_DUST = 30;

    let nextTremor = 1500 + Math.random() * 1200;
    let tremorActive = false;
    let tremorFrames = 0;

    function spawnDust() {
        if (dust.length >= MAX_DUST) return;
        const side = windForce >= 0 ? -20 : W + 20;
        dust.push({
            x: side,
            y: 200 + Math.random() * (H - 400),
            size: 1 + Math.random() * 2.5,
            alpha: 0.04 + Math.random() * 0.06,
            vy: (Math.random() - 0.5) * 0.3,
        });
    }

    let frameCount = 0;
    let nextPull = 1800;

    // =============================================
    // RENDER LOOP
    // =============================================
    function customDraw(ctx) {
        frameCount++;

        // --- WIND ---
        if (frameCount > nextGust) {
            windTarget = (Math.random() - 0.5) * 0.0008;
            nextGust = frameCount + 480 + Math.random() * 1200;
        }
        if (Math.abs(windForce - windTarget) > 0.00001) {
            windForce += (windTarget - windForce) * 0.02;
        } else {
            windTarget *= 0.995;
        }
        if (!pullPhase && Math.abs(windForce) > 0.000005) {
            for (const { ball } of balls) {
                Body.applyForce(ball, ball.position, { x: windForce, y: 0 });
            }
        }

        // --- TREMOR (rare) ---
        if (frameCount > nextTremor && !pullPhase) {
            tremorActive = true;
            tremorFrames = 0;
            nextTremor = frameCount + 1500 + Math.random() * 2400;
        }
        if (tremorActive) {
            tremorFrames++;
            if (tremorFrames < 12) {
                for (const { ball } of balls) {
                    Body.applyForce(ball, ball.position, {
                        x: (Math.random() - 0.5) * 0.0003,
                        y: (Math.random() - 0.5) * 0.0001,
                    });
                }
            } else {
                tremorActive = false;
            }
        }

        // --- DUST ---
        if (Math.abs(windForce) > 0.00003 && Math.random() < 0.15) {
            spawnDust();
        }

        // --- GENTLE PULL-BACK ---
        if (pullPhase) {
            pullProgress++;
            const t = Math.min(pullProgress / pullDuration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const angle = pullAngle * eased;
            const px = firstPivotX + Math.sin(angle) * stringLength;
            const py = firstPivotY + Math.cos(angle) * stringLength;
            Body.setPosition(firstBall, { x: px, y: py });
            Body.setVelocity(firstBall, { x: 0, y: 0 });
            if (t >= 1) {
                pullPhase = false;
                Body.setStatic(firstBall, false);
            }
        }

        // --- RE-PULL when energy dies ---
        if (!pullPhase && frameCount > nextPull) {
            let totalSpeed = 0;
            for (const { ball } of balls) {
                totalSpeed += Math.abs(ball.velocity.x) + Math.abs(ball.velocity.y);
            }
            if (totalSpeed < 2 || frameCount > nextPull + 300) {
                pullPhase = true;
                pullProgress = 0;
                Body.setStatic(firstBall, true);
                nextPull = frameCount + 1800;
            }
        }

        // --- MOTION BLUR history ---
        for (let i = 0; i < balls.length; i++) {
            posHistory[i].push({ x: balls[i].ball.position.x, y: balls[i].ball.position.y });
            if (posHistory[i].length > TRAIL_LENGTH) posHistory[i].shift();
        }

        // --- DRAW STRINGS (with sag) ---
        for (const { ball, pivotX, pivotY, radius } of balls) {
            const bx = ball.position.x;
            const by = ball.position.y - radius;
            const midX = (pivotX + bx) / 2;
            const midY = (pivotY + by) / 2;
            const offset = Math.abs(bx - pivotX);
            const sagX = (bx - pivotX) * 0.05;
            const sagY = 8 + offset * 0.01;

            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.quadraticCurveTo(midX + sagX, midY + sagY, bx, by);
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(pivotX, pivotY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.fill();
        }

        // --- DRAW BALLS (metallic gradient + motion blur) ---
        for (let i = 0; i < balls.length; i++) {
            const { ball, radius } = balls[i];
            const bx = ball.position.x;
            const by = ball.position.y;
            const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);

            // Motion blur trail
            if (speed > 1.5) {
                const history = posHistory[i];
                for (let t = 0; t < history.length - 1; t++) {
                    const alpha = (t / history.length) * 0.12;
                    const trailR = radius * (0.7 + (t / history.length) * 0.3);
                    ctx.beginPath();
                    ctx.arc(history[t].x, history[t].y, trailR, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${ballPalette.trail},${alpha})`;
                    ctx.fill();
                }
            }

            // Metallic ball with radial gradient
            const grad = ctx.createRadialGradient(
                bx - radius * 0.3, by - radius * 0.3, radius * 0.05,
                bx, by, radius
            );
            grad.addColorStop(0, ballPalette.hi);
            grad.addColorStop(0.3, ballPalette.mid);
            grad.addColorStop(0.7, ballPalette.lo);
            grad.addColorStop(1.0, ballPalette.edge);

            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Edge ring
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Moving specular highlight
            const swingAngle = Math.atan2(bx - balls[i].pivotX, by - balls[i].pivotY);
            const specX = bx - radius * 0.28 - swingAngle * 8;
            const specY = by - radius * 0.32;
            ctx.beginPath();
            ctx.arc(specX, specY, radius * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fill();
        }

        // --- DRAW DUST ---
        for (let i = dust.length - 1; i >= 0; i--) {
            const d = dust[i];
            d.x += windForce * 40000 + (windForce > 0 ? 0.4 : -0.4);
            d.y += d.vy;
            d.alpha -= 0.0003;
            if (d.x < -30 || d.x > W + 30 || d.alpha <= 0) {
                dust.splice(i, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${d.alpha})`;
            ctx.fill();
        }

        // --- HOOK TEXT (viral bait + countdown) ---
        const textAlpha = Math.min(frameCount / 120, 1);
        const pulse = 0.85 + Math.sin(frameCount * 0.02) * 0.15;

        // Countdown from 60
        const secondsElapsed = Math.floor(frameCount / 60);
        const remaining = Math.max(0, 60 - secondsElapsed);

        ctx.textAlign = 'center';

        if (remaining > 0) {
            ctx.fillStyle = `rgba(255,255,255,${0.9 * textAlpha * pulse})`;
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText(`Watch for ${remaining} seconds`, W / 2, 120);
        } else {
            ctx.fillStyle = `rgba(255,255,255,${0.9 * textAlpha * pulse})`;
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText('Complete ✓', W / 2, 120);
        }

        ctx.fillStyle = `rgba(255,255,255,${0.55 * textAlpha})`;
        ctx.font = '26px sans-serif';
        ctx.fillText('Neuroscience says this 432Hz frequency', W / 2, 178);
        ctx.fillText('reduces stress & activates alpha waves', W / 2, 214);

        // Sound on — brighter and bigger
        const soundPulse = 0.75 + Math.sin(frameCount * 0.04) * 0.25;
        ctx.fillStyle = `rgba(255,255,255,${soundPulse * textAlpha})`;
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('🎧 Sound on for full effect', W / 2, 268);
    }

    startAmbient();
    pw.start(customDraw);

    return {
        destroy() {
            pw.destroy();
        }
    };
}
