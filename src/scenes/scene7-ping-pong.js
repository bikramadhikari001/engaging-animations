/**
 * Scene 7: THE FINAL — AI vs AI Pong Championship
 *
 * Left/Right layout with all 15 TikTok engagement features.
 * Uses Bebas Neue / Oswald sports fonts.
 */
import { startBeat, setBeatBPM, pongHitSound } from '../utils/sound.js';

const F_TITLE = '"Bebas Neue", sans-serif';
const F_BODY = '"Oswald", sans-serif';

export function createScene(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let frameCount = 0;
    let running = true;
    let animId;
    let GAME_DURATION = 3600;

    // LEFT / RIGHT paddles (original orientation)
    const paddleW = 14;
    const paddleH = H * 0.10;
    const paddleMargin = 30;

    const left = {
        x: paddleMargin, y: H / 2 - paddleH / 2,
        score: 0, speed: 7, name: 'ALPHA', color: 'rgba(100,180,255,',
    };
    const right = {
        x: W - paddleMargin - paddleW, y: H / 2 - paddleH / 2,
        score: 0, speed: 7, name: 'OMEGA', color: 'rgba(255,120,100,',
    };

    const ball = {
        x: W / 2, y: H / 2, r: 10,
        vx: 0, vy: 0, speed: 7,
        spin: 0, trail: [],
    };

    let gamePhase = 'intro';
    let introTimer = 90;
    let countdownTimer = 120;
    let pointPauseTimer = 0;
    let lastScorer = null;
    let rallyCount = 0;
    let shakeTimer = 0;
    let shakeIntensity = 0;
    let matchPoint = false;
    let overtime = false;
    let smashCount = 0;
    let longestRally = 0;
    let totalRallies = 0;
    let statsTimer = 120;

    let particles = [];
    let commentary = '';
    let commentaryTimer = 0;
    let scoreFlashSide = null;
    let scoreFlashTimer = 0;

    let shouldLetScore = false;
    let letScoreSide = null;

    const commentaries = {
        save: ['WHAT A SAVE!', 'INCREDIBLE!', 'HOW?!', 'UNREAL!', 'DENIED!'],
        score: ['GOAAAL!', 'UNSTOPPABLE!', 'CLEAN!', 'BEAUTIFUL!', 'BOOM!'],
        rally: ['INSANE RALLY!', "WON'T STOP!", 'BACK & FORTH!', 'RELENTLESS!'],
        smash: ['SMASHED IT!', 'POWER SHOT!', 'THUNDERBOLT!', 'CANNON!'],
    };

    function showCommentary(type) {
        const list = commentaries[type];
        commentary = list[Math.floor(Math.random() * list.length)];
        commentaryTimer = 50;
    }

    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 14,
                vy: (Math.random() - 0.5) * 14,
                life: 25 + Math.random() * 20,
                maxLife: 45,
                size: 2 + Math.random() * 4,
                color,
            });
        }
    }

    function serveBall() {
        ball.x = W / 2;
        ball.y = H * 0.3 + Math.random() * H * 0.4;
        ball.trail = [];
        ball.spin = 0;
        rallyCount = 0;

        const dir = lastScorer === 'left' ? 1 : -1;
        const angle = (Math.random() - 0.5) * 0.8;
        const progress = Math.min(frameCount / 3600, 1);
        ball.speed = 7 + progress * 6;

        ball.vx = dir * ball.speed * Math.cos(angle);
        ball.vy = ball.speed * Math.sin(angle);
    }

    // --- AI ---
    function updateAI(paddle, side) {
        const progress = Math.min(frameCount / 3600, 1);
        const ballComingToMe = (side === 'left' && ball.vx < 0) || (side === 'right' && ball.vx > 0);

        let targetY;
        if (shouldLetScore && letScoreSide === side && ballComingToMe) {
            const wrongDir = ball.y > H / 2 ? -1 : 1;
            targetY = ball.y + wrongDir * (paddleH * 1.2 + Math.random() * 60);
            paddle.speed = 4;
        } else if (ballComingToMe) {
            targetY = ball.y - paddleH / 2;
            targetY += (Math.random() - 0.5) * paddleH * 0.2;
            paddle.speed = 7 + progress * 5;
        } else {
            targetY = H / 2 - paddleH / 2;
            paddle.speed = 4 + progress * 2;
        }

        const diff = targetY - paddle.y;
        paddle.y += Math.sign(diff) * Math.min(Math.abs(diff), paddle.speed);
        paddle.y = Math.max(0, Math.min(H - paddleH, paddle.y));
    }

    function checkDrama() {
        const progress = Math.min(frameCount / 3600, 1);
        const diff = Math.abs(left.score - right.score);

        shouldLetScore = false;
        letScoreSide = null;

        if (diff >= 2) {
            shouldLetScore = true;
            letScoreSide = left.score > right.score ? 'left' : 'right';
        }
        if (progress > 0.75 && diff >= 2) {
            shouldLetScore = true;
            letScoreSide = left.score > right.score ? 'left' : 'right';
        }
        // #13 — Overtime
        if (progress > 0.92 && diff === 0 && left.score > 0 && !overtime) {
            overtime = true;
            GAME_DURATION += 300;
            commentary = 'OVERTIME!';
            commentaryTimer = 80;
        }
        if (overtime && diff === 0 && frameCount > GAME_DURATION - 180) {
            shouldLetScore = true;
            letScoreSide = Math.random() > 0.5 ? 'left' : 'right';
        }

        matchPoint = progress > 0.80 && diff <= 1;

        // #6 — BPM escalation
        setBeatBPM(Math.min(100 + progress * 60 + (matchPoint ? 20 : 0), 170));
    }

    function updateBall() {
        ball.vy += ball.spin * 0.15; // #11 — spin curves vertically
        ball.spin *= 0.98;

        ball.x += ball.vx;
        ball.y += ball.vy;

        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 15) ball.trail.shift();

        // Top/bottom wall bounce
        if (ball.y - ball.r < 0) {
            ball.y = ball.r; ball.vy = Math.abs(ball.vy);
            pongHitSound('wall');
        }
        if (ball.y + ball.r > H) {
            ball.y = H - ball.r; ball.vy = -Math.abs(ball.vy);
            pongHitSound('wall');
        }

        // Left paddle hit
        if (
            ball.vx < 0 &&
            ball.x - ball.r < left.x + paddleW &&
            ball.x + ball.r > left.x &&
            ball.y > left.y - ball.r * 0.3 &&
            ball.y < left.y + paddleH + ball.r * 0.3
        ) {
            ball.x = left.x + paddleW + ball.r;
            const hitPos = (ball.y - left.y) / paddleH;
            const angle = (hitPos - 0.5) * 1.3;
            let speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) * 1.03;

            // #7 — SMASH on edge hits
            const isSmash = hitPos < 0.1 || hitPos > 0.9;
            if (isSmash) {
                speed *= 1.6;
                smashCount++;
                shakeTimer = 6; shakeIntensity = 8;
                showCommentary('smash');
                spawnParticles(ball.x, ball.y, '255,200,100', 8);
                pongHitSound('smash');
            }

            ball.vx = Math.abs(speed * Math.cos(angle));
            ball.vy = speed * Math.sin(angle);
            ball.spin = (hitPos - 0.5) * 2; // #11
            rallyCount++;
            totalRallies++;
            pongHitSound('paddle');
            if (!isSmash) { shakeTimer = 3; shakeIntensity = 2 + Math.min(rallyCount, 5); }

            if (rallyCount >= 5 && rallyCount % 3 === 0) showCommentary('rally');
            if (hitPos > 0.35 && hitPos < 0.65 && speed > 10) showCommentary('save');
        }

        // Right paddle hit
        if (
            ball.vx > 0 &&
            ball.x + ball.r > right.x &&
            ball.x - ball.r < right.x + paddleW &&
            ball.y > right.y - ball.r * 0.3 &&
            ball.y < right.y + paddleH + ball.r * 0.3
        ) {
            ball.x = right.x - ball.r;
            const hitPos = (ball.y - right.y) / paddleH;
            const angle = (hitPos - 0.5) * 1.3;
            let speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2) * 1.03;

            const isSmash = hitPos < 0.1 || hitPos > 0.9;
            if (isSmash) {
                speed *= 1.6;
                smashCount++;
                shakeTimer = 6; shakeIntensity = 8;
                showCommentary('smash');
                spawnParticles(ball.x, ball.y, '255,200,100', 8);
                pongHitSound('smash');
            }

            ball.vx = -Math.abs(speed * Math.cos(angle));
            ball.vy = speed * Math.sin(angle);
            ball.spin = (hitPos - 0.5) * 2;
            rallyCount++;
            totalRallies++;
            pongHitSound('paddle');
            if (!isSmash) { shakeTimer = 3; shakeIntensity = 2 + Math.min(rallyCount, 5); }

            if (rallyCount >= 5 && rallyCount % 3 === 0) showCommentary('rally');
        }

        // Score
        if (ball.x < -20) {
            right.score++;
            lastScorer = 'right';
            longestRally = Math.max(longestRally, rallyCount);
            gamePhase = 'point-scored';
            pointPauseTimer = 50;
            shakeTimer = 12; shakeIntensity = matchPoint ? 14 : 8;
            pongHitSound('wall');
            showCommentary('score');
            scoreFlashSide = 'right'; scoreFlashTimer = 30;
            spawnParticles(0, ball.y, '255,120,100', 20);
        }
        if (ball.x > W + 20) {
            left.score++;
            lastScorer = 'left';
            longestRally = Math.max(longestRally, rallyCount);
            gamePhase = 'point-scored';
            pointPauseTimer = 50;
            shakeTimer = 12; shakeIntensity = matchPoint ? 14 : 8;
            pongHitSound('wall');
            showCommentary('score');
            scoreFlashSide = 'left'; scoreFlashTimer = 30;
            spawnParticles(W, ball.y, '100,180,255', 20);
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.94; p.vy *= 0.94;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    // === RENDER ===
    function draw() {
        if (!running) return;
        frameCount++;
        if (shakeTimer > 0) shakeTimer--;

        ctx.save();
        if (shakeTimer > 0) {
            ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(-10, -10, W + 20, H + 20);

        const progress = Math.min(frameCount / 3600, 1);
        const timeLeft = Math.max(0, Math.ceil((GAME_DURATION - frameCount) / 60));
        const secondsIn = Math.floor(frameCount / 60);

        // === #3 — INTRO: "THE FINAL" ===
        if (gamePhase === 'intro') {
            introTimer--;
            const fade = Math.min(introTimer / 20, 1);
            ctx.textAlign = 'center';

            ctx.fillStyle = `rgba(255,255,255,${fade * 0.95})`;
            ctx.font = `72px ${F_TITLE}`;
            ctx.fillText('THE FINAL', W / 2, H / 2 - 50);

            ctx.fillStyle = `rgba(100,180,255,${fade * 0.8})`;
            ctx.font = `36px ${F_TITLE}`;
            ctx.fillText(left.name, W / 2 - 80, H / 2 + 20);

            ctx.fillStyle = `rgba(255,255,255,${fade * 0.5})`;
            ctx.font = `28px ${F_BODY}`;
            ctx.fillText('vs', W / 2, H / 2 + 20);

            ctx.fillStyle = `rgba(255,120,100,${fade * 0.8})`;
            ctx.font = `36px ${F_TITLE}`;
            ctx.fillText(right.name, W / 2 + 80, H / 2 + 20);

            if (introTimer <= 0) { gamePhase = 'countdown'; countdownTimer = 120; }
        }

        // === COUNTDOWN ===
        if (gamePhase === 'countdown') {
            countdownTimer--;
            drawCourt(); drawPaddle(left); drawPaddle(right);

            const count = Math.ceil(countdownTimer / 60);
            if (countdownTimer > 0 && count > 0) {
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = `160px ${F_TITLE}`;
                ctx.fillText(count, W / 2, H / 2 + 55);
            }
            if (countdownTimer <= 0) { gamePhase = 'playing'; serveBall(); }
        }

        // === POINT SCORED ===
        if (gamePhase === 'point-scored') {
            pointPauseTimer--;
            drawCourt(); drawPaddle(left); drawPaddle(right); drawScore();

            if (pointPauseTimer > 35) {
                const flash = (pointPauseTimer - 35) / 15;
                ctx.fillStyle = `rgba(255,255,255,${flash * 0.25})`;
                ctx.fillRect(-10, -10, W + 20, H + 20);
            }

            ctx.textAlign = 'center';
            const fadeIn = Math.min(1, (50 - pointPauseTimer) / 8);
            const scorer = lastScorer === 'left' ? left : right;
            ctx.fillStyle = `${scorer.color}${fadeIn * 0.8})`;
            ctx.font = `40px ${F_TITLE}`;
            ctx.fillText(lastScorer === 'left' ? '← POINT' : 'POINT →', W / 2, H / 2);

            if (pointPauseTimer <= 0) {
                gamePhase = frameCount >= GAME_DURATION ? 'finished' : 'playing';
                if (gamePhase === 'playing') serveBall();
            }
        }

        // === PLAYING ===
        if (gamePhase === 'playing') {
            checkDrama();
            updateAI(left, 'left');
            updateAI(right, 'right');
            updateBall();

            if (frameCount >= GAME_DURATION && gamePhase === 'playing') gamePhase = 'finished';

            // #9 — Vignette during match point
            if (matchPoint) {
                const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.6);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.5)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, H);
            }

            drawCourt(); drawPaddle(left); drawPaddle(right);
            drawSpeedLines(); drawBall(); drawScore();
        }

        // === FINISHED ===
        if (gamePhase === 'finished') {
            drawCourt(); drawPaddle(left); drawPaddle(right); drawScore();

            const winPulse = 0.8 + Math.sin(frameCount * 0.05) * 0.2;
            const winner = left.score > right.score ? left : (right.score > left.score ? right : null);
            ctx.textAlign = 'center';

            if (winner) {
                ctx.fillStyle = `${winner.color}${0.95 * winPulse})`;
                ctx.font = `64px ${F_TITLE}`;
                ctx.fillText(`${winner.name} WINS!`, W / 2, H / 2 - 20);
            } else {
                ctx.fillStyle = `rgba(255,255,255,${0.9 * winPulse})`;
                ctx.font = `64px ${F_TITLE}`;
                ctx.fillText('DRAW!', W / 2, H / 2 - 20);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = `36px ${F_TITLE}`;
            ctx.fillText(`${left.score}  —  ${right.score}`, W / 2, H / 2 + 30);

            if (overtime) {
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.font = `22px ${F_BODY}`;
                ctx.fillText('AFTER OVERTIME', W / 2, H / 2 + 65);
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.font = `22px ${F_BODY}`;
                ctx.fillText('FULL TIME', W / 2, H / 2 + 65);
            }

            statsTimer--;
            if (statsTimer <= 0) gamePhase = 'stats';
        }

        // === #15 — STATS ===
        if (gamePhase === 'stats') {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';

            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = `42px ${F_TITLE}`;
            ctx.fillText('MATCH STATS', W / 2, H * 0.18);

            // Score
            ctx.fillStyle = `rgba(100,180,255,0.7)`;
            ctx.font = `60px ${F_TITLE}`;
            ctx.fillText(left.score, W * 0.25, H * 0.30);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = `40px ${F_TITLE}`;
            ctx.fillText('—', W / 2, H * 0.30);
            ctx.fillStyle = `rgba(255,120,100,0.7)`;
            ctx.font = `60px ${F_TITLE}`;
            ctx.fillText(right.score, W * 0.75, H * 0.30);

            // Names
            ctx.font = `20px ${F_BODY}`;
            ctx.fillStyle = 'rgba(100,180,255,0.4)';
            ctx.fillText(left.name, W * 0.25, H * 0.30 + 30);
            ctx.fillStyle = 'rgba(255,120,100,0.4)';
            ctx.fillText(right.name, W * 0.75, H * 0.30 + 30);

            // Stats
            const stats = [
                ['LONGEST RALLY', `${longestRally}`],
                ['SMASHES', `${smashCount}`],
                ['TOTAL HITS', `${totalRallies}`],
                [overtime ? '⚡ OVERTIME' : 'FULL TIME', ''],
            ];

            let yPos = H * 0.42;
            for (const [label, value] of stats) {
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.font = `22px ${F_BODY}`;
                ctx.fillText(label, W / 2, yPos);
                if (value) {
                    ctx.fillStyle = 'rgba(255,255,255,0.6)';
                    ctx.font = `36px ${F_TITLE}`;
                    ctx.fillText(value, W / 2, yPos + 35);
                }
                yPos += 70;
            }
        }

        // --- PARTICLES ---
        updateParticles();
        for (const p of particles) {
            const alpha = p.life / p.maxLife;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color},${alpha})`;
            ctx.fill();
        }

        // --- #8 COMMENTARY ---
        if (commentaryTimer > 0) {
            commentaryTimer--;
            const cAlpha = Math.min(commentaryTimer / 8, 1);
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255,255,255,${cAlpha * 0.9})`;
            ctx.font = `48px ${F_TITLE}`;
            ctx.fillText(commentary, W / 2, H / 2);
        }

        // --- HUD ---
        const textAlpha = Math.min(frameCount / 90, 1);
        ctx.textAlign = 'center';

        // Timer
        if (gamePhase === 'playing' || gamePhase === 'point-scored') {
            const urgent = timeLeft <= 10;
            const pulse = urgent ? 0.8 + Math.sin(frameCount * 0.15) * 0.2 : 0.5;
            ctx.fillStyle = `rgba(255,255,255,${pulse * textAlpha})`;
            ctx.font = `${urgent ? 50 : 36}px ${F_TITLE}`;
            ctx.fillText(`${timeLeft}`, W / 2, 60);
        }

        // Match point
        if (matchPoint && gamePhase === 'playing') {
            const mp = 0.3 + Math.sin(frameCount * 0.08) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${mp})`;
            ctx.font = `28px ${F_TITLE}`;
            ctx.fillText('MATCH POINT', W / 2, H - 100);
        }

        // #13 — Overtime indicator
        if (overtime && gamePhase === 'playing') {
            const otP = 0.4 + Math.sin(frameCount * 0.1) * 0.3;
            ctx.fillStyle = `rgba(255,200,100,${otP})`;
            ctx.font = `24px ${F_TITLE}`;
            ctx.fillText('⚡ OVERTIME', W / 2, 90);
        }

        // Rally
        if (gamePhase === 'playing' && rallyCount >= 3) {
            ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(frameCount * 0.12) * 0.15})`;
            ctx.font = `24px ${F_TITLE}`;
            ctx.fillText(`RALLY ${rallyCount}`, W / 2, H - 65);
        }

        // #10 — Prediction at 30s
        if (secondsIn >= 28 && secondsIn <= 33 && gamePhase === 'playing') {
            const pFade = secondsIn <= 29 ? (secondsIn - 28) : Math.max(0, (33 - secondsIn) / 3);
            ctx.fillStyle = `rgba(255,255,255,${pFade * 0.6})`;
            ctx.font = `24px ${F_BODY}`;
            ctx.fillText('WHO WINS? 👇 Comment', W / 2, H - 35);
        }

        // #14 — Watch till the end
        if (secondsIn >= 4 && secondsIn <= 8) {
            const wFade = secondsIn <= 5 ? (secondsIn - 4) : Math.max(0, (8 - secondsIn) / 3);
            ctx.fillStyle = `rgba(255,255,255,${wFade * 0.35})`;
            ctx.font = `20px ${F_BODY}`;
            ctx.fillText('Watch till the end...', W / 2, H - 20);
        }

        // Sound on (first 8s)
        if (secondsIn < 8) {
            const sFade = Math.min(1, secondsIn / 2) * Math.max(0, (8 - secondsIn) / 4);
            ctx.fillStyle = `rgba(255,255,255,${sFade * 0.4})`;
            ctx.font = `20px ${F_BODY}`;
            ctx.fillText('🎧 Sound on', W / 2, H - 20);
        }

        ctx.restore();
        animId = requestAnimationFrame(draw);
    }

    // #2 — Colored paddles
    function drawPaddle(p) {
        ctx.fillStyle = `${p.color}0.95)`;
        ctx.fillRect(p.x, p.y, paddleW, paddleH);
        ctx.fillStyle = `${p.color}0.08)`;
        ctx.fillRect(p.x - 2, p.y - 2, paddleW + 4, paddleH + 4);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    // #5 — Speed lines
    function drawSpeedLines() {
        const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        if (speed < 8) return;
        for (let i = 0; i < ball.trail.length - 1; i++) {
            const alpha = (i / ball.trail.length) * (speed / 20) * 0.3;
            const r = ball.r * (0.2 + (i / ball.trail.length) * 0.5);
            ctx.beginPath();
            ctx.arc(ball.trail[i].x, ball.trail[i].y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha, 0.3)})`;
            ctx.fill();
        }
    }

    function drawCourt() {
        // Vertical center line (dashed)
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Center circle
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // #12 — Score with flash animation
    function drawScore() {
        let leftSize = 80, rightSize = 80;
        if (scoreFlashTimer > 0) {
            scoreFlashTimer--;
            const scale = 1 + (scoreFlashTimer / 30) * 0.5;
            if (scoreFlashSide === 'left') leftSize = Math.floor(80 * scale);
            if (scoreFlashSide === 'right') rightSize = Math.floor(80 * scale);
        }

        // Left score (ALPHA)
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(100,180,255,0.35)';
        ctx.font = `${leftSize}px ${F_TITLE}`;
        ctx.fillText(left.score, W * 0.25, 140);
        ctx.fillStyle = 'rgba(100,180,255,0.18)';
        ctx.font = `16px ${F_BODY}`;
        ctx.fillText(left.name, W * 0.25, 165);

        // Right score (OMEGA)
        ctx.fillStyle = 'rgba(255,120,100,0.35)';
        ctx.font = `${rightSize}px ${F_TITLE}`;
        ctx.fillText(right.score, W * 0.75, 140);
        ctx.fillStyle = 'rgba(255,120,100,0.18)';
        ctx.font = `16px ${F_BODY}`;
        ctx.fillText(right.name, W * 0.75, 165);
    }

    startBeat();
    draw();

    return {
        destroy() {
            running = false;
            if (animId) cancelAnimationFrame(animId);
        }
    };
}
