# Satisfying Physics Simulations

Oddly satisfying 2D physics animations designed for short-form vertical video (TikTok, Reels, Shorts). Powered by **Matter.js** for real physics and **Tone.js** for research-backed ASMR audio.

## Scenes

| # | Scene | Description |
|---|-------|-------------|
| 1 | **Plinko** | Balls rain through 16 rows of pegs into collection bins |
| 2 | **Container Fill** | Balls pour into a semicircular bowl, stack, explode, and refill |
| 3 | **Newton's Cradle** | Realistic cradle with energy decay, metallic balls, wind gusts, and tremors |
| 4 | **Ball Splitter** | One ball drops → hits wedge → splits into 2 → cascade to 32+ tiny balls |
| 5 | **Funnel Cascade** | Vertical marble run with zigzag ramps, funnels, and peg grids |

## Features

- **Real 2D physics** — Matter.js engine with gravity, collisions, friction, restitution
- **B&W aesthetic** — Pure black background, white shapes, metallic ball gradients
- **ASMR audio** — 432Hz ambient drone (alpha wave inducer) + 3-layer steel collision sounds with per-hit pitch/volume variation
- **Environmental forces** — Random wind gusts, floating dust particles, rare tremors
- **60-second countdown** — Hook text overlay for viral engagement
- **Video recording** — Puppeteer + ffmpeg pipeline exports 1080×1920 MP4 with audio

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000 — tap to start
```

## Record Video

Exports a 63-second 1080×1920 MP4 with audio:

```bash
# Terminal 1: start dev server
npm run dev

# Terminal 2: record
node record.mjs
# Output: output/newtons-cradle.mp4
```

Requires the dev server running on port 3000. Opens a real browser window (audio capture requires headed mode). Keep the window visible during recording.

## Tech Stack

- **[Matter.js](https://brm.io/matter-js/)** — 2D physics engine
- **[Tone.js](https://tonejs.github.io/)** — Web Audio synthesis
- **[Vite](https://vitejs.dev/)** — Dev server and bundler
- **[Puppeteer](https://pptr.dev/)** — Headless/headed browser automation for recording
- **[FFmpeg](https://ffmpeg.org/)** — Video encoding (WebM → MP4)

## Project Structure

```
src/
├── main.js                     # Scene loader and manager
├── style.css                   # UI styles
├── scenes/
│   ├── scene1-plinko.js        # Plinko board
│   ├── scene2-container-fill.js # Bowl fill
│   ├── scene3-newtons-cradle.js # Newton's Cradle (featured)
│   ├── scene4-ball-splitter.js  # Exponential split cascade
│   └── scene5-funnel-cascade.js # Vertical marble run
└── utils/
    ├── physics.js               # Matter.js wrapper + canvas renderer
    └── sound.js                 # 432Hz ambient drone + collision sounds
index.html                       # Entry point
record.mjs                      # Puppeteer video recording script
```

## Sound Design (Research-Backed)

**Background drone:**
- 432Hz tuning (shown to reduce heart rate and anxiety vs 440Hz)
- A minor pentatonic chord progression through chorus + 12s reverb
- Induces alpha brainwave state (relaxed-but-focused)

**Collision sounds (3 layers per hit):**
1. MetalSynth sharp transient (attack of steel impact)
2. Sine wave metallic ring (2200Hz, 180ms decay)
3. MembraneSynth low thud (ball weight/body feel)
- ±15% pitch variation + ±1.5dB volume per hit for natural ASMR feel

## License

MIT
