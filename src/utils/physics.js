/**
 * Physics Engine Wrapper — Matter.js + Canvas Renderer
 * 
 * Provides a clean API for creating physics scenes.
 * Handles: engine setup, custom canvas rendering, collision events, gravity.
 */
import Matter from 'matter-js';

const { Engine, Render, Runner, Bodies, Body, Composite, Events, Vector } = Matter;

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

/**
 * Create a physics world with canvas rendering.
 * Returns an object with the engine, canvas context, and helper methods.
 */
export function createPhysicsWorld(container) {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const scaleX = w / CANVAS_W;
    const scaleY = h / CANVAS_H;
    const scale = Math.min(scaleX, scaleY);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Create engine
    const engine = Engine.create({
        gravity: { x: 0, y: 1.2 },
    });

    const world = engine.world;

    // Runner for fixed timestep
    const runner = Runner.create({ delta: 1000 / 60 });
    Runner.run(runner, engine);

    // Scale helper
    function s(v) { return v * scale; }
    function sx(x) { return x * scale; }
    function sy(y) { return y * scale; }

    // Body creation helpers — all take CANVAS_W/CANVAS_H coords
    function addBall(x, y, radius, options = {}) {
        const body = Bodies.circle(x, y, radius, {
            restitution: options.restitution ?? 0.6,
            friction: options.friction ?? 0.05,
            density: options.density ?? 0.001,
            label: options.label ?? 'ball',
            render: { fillStyle: '#fff' },
            ...options,
        });
        Composite.add(world, body);
        return body;
    }

    function addRect(x, y, w, h, options = {}) {
        const body = Bodies.rectangle(x, y, w, h, {
            isStatic: options.isStatic ?? true,
            restitution: options.restitution ?? 0.4,
            friction: options.friction ?? 0.1,
            label: options.label ?? 'wall',
            angle: options.angle ?? 0,
            render: { fillStyle: '#fff' },
            ...options,
        });
        Composite.add(world, body);
        return body;
    }

    function addCircle(x, y, radius, options = {}) {
        const body = Bodies.circle(x, y, radius, {
            isStatic: options.isStatic ?? true,
            restitution: options.restitution ?? 0.5,
            label: options.label ?? 'peg',
            render: { fillStyle: '#fff' },
            ...options,
        });
        Composite.add(world, body);
        return body;
    }

    function removeBody(body) {
        Composite.remove(world, body);
    }

    function clear() {
        Composite.clear(world, false);
    }

    // Collision event handler
    function onCollision(callback) {
        Events.on(engine, 'collisionStart', (event) => {
            for (const pair of event.pairs) {
                const speed = Vector.magnitude(
                    Vector.sub(pair.bodyA.velocity, pair.bodyB.velocity)
                );
                callback(pair.bodyA, pair.bodyB, speed);
            }
        });
    }

    // Render loop — custom canvas drawing (no Matter.js renderer)
    let animFrameId = null;
    let drawCallback = null;

    function render() {
        ctx.clearRect(0, 0, w, h);

        // Black background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.scale(scale, scale);

        // Draw all bodies
        const bodies = Composite.allBodies(world);
        for (const body of bodies) {
            if (body.label === 'ball') {
                drawBall(ctx, body);
            } else if (body.label === 'peg') {
                drawPeg(ctx, body);
            } else if (body.label === 'wall' || body.label === 'floor' || body.label === 'boundary') {
                drawWall(ctx, body);
            } else if (body.label === 'funnel') {
                drawWall(ctx, body);
            }
        }

        // Custom draw callback
        if (drawCallback) drawCallback(ctx);

        ctx.restore();

        animFrameId = requestAnimationFrame(render);
    }

    function drawBall(ctx, body) {
        const { x, y } = body.position;
        const r = body.circleRadius;
        const speed = Vector.magnitude(body.velocity);

        // Brightness based on speed — faster = brighter
        const brightness = Math.min(255, 120 + speed * 15);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
        ctx.fill();

        // Subtle highlight
        if (r > 5) {
            ctx.beginPath();
            ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.min(0.4, speed * 0.05)})`;
            ctx.fill();
        }
    }

    function drawPeg(ctx, body) {
        const { x, y } = body.position;
        const r = body.circleRadius || 8;

        // Subtle peg
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawWall(ctx, body) {
        const verts = body.vertices;
        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let i = 1; i < verts.length; i++) {
            ctx.lineTo(verts[i].x, verts[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function start(customDraw) {
        drawCallback = customDraw || null;
        render();
    }

    function destroy() {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        Runner.stop(runner);
        Engine.clear(engine);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return {
        engine, world, canvas, ctx,
        addBall, addRect, addCircle, removeBody, clear,
        onCollision, start, destroy,
        s, sx, sy, scale,
        CANVAS_W, CANVAS_H,
        Matter, // expose for direct access
    };
}
