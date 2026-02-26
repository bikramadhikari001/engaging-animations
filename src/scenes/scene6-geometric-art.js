/**
 * Scene 6: Geometric Compass Art
 *
 * A single pen draws inside a circle, one line at a time.
 * Uses modular multiplication to build unique mathematical patterns.
 * Every run produces a different result via randomized parameters.
 */
import { startAmbient } from '../utils/sound.js';

export function createScene(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.28;

    let frameCount = 0;
    let running = true;
    let animId;

    // Randomized parameters
    const numPoints = 180 + Math.floor(Math.random() * 120);
    const baseMultiplier = 2 + Math.random() * 50;
    const numLayers = 1 + Math.floor(Math.random() * 2);
    const rotationSpeed = (Math.random() - 0.5) * 0.0001;
    const innerCircleCount = 1 + Math.floor(Math.random() * 2);

    const layers = [];
    for (let i = 0; i < numLayers; i++) {
        layers.push({
            multiplier: baseMultiplier + i * (2 + Math.random() * 5),
            opacity: 0.35 - i * 0.10,
            radiusScale: 1 - i * 0.12,
        });
    }

    // State
    let drawnLines = [];
    let lineQueue = [];
    let totalLinesToDraw = 0;
    let currentLineIndex = 0;
    let penX = cx, penY = cy - radius;
    let penState = 'drawing-circle';
    let circleProgress = 0;
    let lineProgress = 0;
    let moveProgress = 0;

    const LINE_DRAW_FRAMES = 8;
    const PEN_MOVE_FRAMES = 4;
    const CIRCLE_DRAW_FRAMES = 120;

    function getPoint(index, total, r) {
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    }

    function buildLineQueue() {
        const queue = [];
        for (const layer of layers) {
            for (let i = 0; i < numPoints; i++) {
                const from = getPoint(i, numPoints, radius * layer.radiusScale);
                const targetIdx = Math.floor(i * layer.multiplier) % numPoints;
                const to = getPoint(targetIdx, numPoints, radius * layer.radiusScale);
                queue.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, opacity: layer.opacity });
            }
        }
        return queue;
    }

    function drawPen(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
    }

    function draw() {
        if (!running) return;
        frameCount++;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // === PHASE 1: Draw circle with compass ===
        if (penState === 'drawing-circle') {
            circleProgress += 1 / CIRCLE_DRAW_FRAMES;
            if (circleProgress >= 1) {
                circleProgress = 1;
                penState = 'moving';
                moveProgress = 0;
                lineQueue = buildLineQueue();
                totalLinesToDraw = lineQueue.length;
            }
            const angle = circleProgress * Math.PI * 2 - Math.PI / 2;

            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, radius, -Math.PI / 2, angle);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            penX = cx + Math.cos(angle) * radius;
            penY = cy + Math.sin(angle) * radius;
            drawPen(penX, penY);
        }

        // === Static circle + inner circles ===
        if (circleProgress >= 1) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            for (let i = 1; i <= innerCircleCount; i++) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius * (1 - i * 0.25), 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fill();
        }

        // === Draw completed lines ===
        for (const line of drawnLines) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.strokeStyle = `rgba(255,255,255,${line.opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        // === Pen moving to next start point ===
        if (penState === 'moving' && lineQueue.length > 0) {
            moveProgress += 1 / PEN_MOVE_FRAMES;
            const nextLine = lineQueue[0];
            const prevX = drawnLines.length > 0 ? drawnLines[drawnLines.length - 1].x2 : penX;
            const prevY = drawnLines.length > 0 ? drawnLines[drawnLines.length - 1].y2 : penY;
            penX = prevX + (nextLine.x1 - prevX) * Math.min(moveProgress, 1);
            penY = prevY + (nextLine.y1 - prevY) * Math.min(moveProgress, 1);
            drawPen(penX, penY);
            if (moveProgress >= 1) {
                penState = 'drawing-line';
                lineProgress = 0;
            }
        }

        // === Pen drawing a line ===
        if (penState === 'drawing-line' && lineQueue.length > 0) {
            lineProgress += 1 / LINE_DRAW_FRAMES;
            const line = lineQueue[0];
            const endX = line.x1 + (line.x2 - line.x1) * Math.min(lineProgress, 1);
            const endY = line.y1 + (line.y2 - line.y1) * Math.min(lineProgress, 1);

            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(255,255,255,${line.opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            penX = endX;
            penY = endY;
            drawPen(penX, penY);

            if (lineProgress >= 1) {
                drawnLines.push(line);
                lineQueue.shift();
                currentLineIndex++;
                if (lineQueue.length > 0) {
                    penState = 'moving';
                    moveProgress = 0;
                } else {
                    penState = 'done';
                }
            }
        }

        // === HOOK TEXT + COUNTDOWN ===
        const textAlpha = Math.min(frameCount / 120, 1);
        const pulse = 0.85 + Math.sin(frameCount * 0.02) * 0.15;
        const remaining = Math.max(0, 60 - Math.floor(frameCount / 60));

        ctx.textAlign = 'center';

        if (remaining > 0) {
            ctx.fillStyle = `rgba(255,255,255,${0.9 * textAlpha * pulse})`;
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText(`Watch for ${remaining} seconds`, cx, 80);
        } else {
            ctx.fillStyle = `rgba(255,255,255,${0.9 * textAlpha * pulse})`;
            ctx.font = 'bold 38px sans-serif';
            ctx.fillText('Complete ✓', cx, 80);
        }

        ctx.fillStyle = `rgba(255,255,255,${0.5 * textAlpha})`;
        ctx.font = '24px sans-serif';
        ctx.fillText('432Hz frequency paired with geometric focus', cx, 130);
        ctx.fillText('reduces cortisol & activates alpha brainwaves', cx, 164);

        const soundPulse = 0.7 + Math.sin(frameCount * 0.04) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${soundPulse * textAlpha})`;
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('🎧 Sound on for full effect', cx, H - 60);

        animId = requestAnimationFrame(draw);
    }

    startAmbient();
    draw();

    return {
        destroy() {
            running = false;
            if (animId) cancelAnimationFrame(animId);
        }
    };
}
