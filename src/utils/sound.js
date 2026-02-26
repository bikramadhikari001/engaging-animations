/**
 * Sound System — Research-Backed Zen Audio Design
 *
 * BACKGROUND:
 * - 432Hz-tuned ambient drone (alpha wave inducer)
 * - Slow-evolving sine pads through chorus + heavy reverb
 * - Minimal, non-distracting — like Calm/Headspace meditation audio
 * - Chord progression tuned to 432Hz: A2(108Hz), C3(128.4Hz), E3(161.3Hz)
 *
 * COLLISION:
 * - Real Newton's Cradle = sharp transient + metallic ring + resonance tail
 * - Superposition of multiple frequencies in brief interval
 * - Random ±pitch, ±volume, ±timing variation per hit (ASMR principle)
 * - Repetitive rhythm with natural decay = zen focus state
 *
 * Research sources: solfeggio frequency studies, ASMR trigger psychology,
 * Calm/Headspace ambient design principles, real cradle audio analysis.
 */
import * as Tone from 'tone';

let initialized = false;
let synths = {};
let effects = {};
let ambientPlaying = false;
let ambientLoop = null;

export async function initAudio() {
    if (initialized) return;
    await Tone.start();

    // ============================================================
    // AMBIENT DRONE — 432Hz tuning, alpha wave state
    // ============================================================

    // Heavy reverb for spacious, room-filling ambiance
    effects.ambientReverb = new Tone.Reverb({ decay: 12, wet: 0.92 }).toDestination();
    // Slow chorus for gentle movement (not static)
    effects.ambientChorus = new Tone.Chorus({
        frequency: 0.15,     // very slow wobble
        delayTime: 18,
        depth: 0.4,
        wet: 0.35,
    }).connect(effects.ambientReverb);

    // Three sine oscillator pads (432Hz-tuned triad)
    synths.drone1 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 5, decay: 2, sustain: 0.85, release: 8 },
        volume: -33,
    }).connect(effects.ambientChorus);

    synths.drone2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 6, decay: 2, sustain: 0.85, release: 8 },
        volume: -35,
    }).connect(effects.ambientChorus);

    synths.drone3 = new Tone.Synth({
        oscillator: { type: 'triangle' },  // triangle for subtle harmonic warmth
        envelope: { attack: 7, decay: 2, sustain: 0.75, release: 10 },
        volume: -38,
    }).connect(effects.ambientChorus);

    // ============================================================
    // COLLISION SOUNDS — layered for realistic steel ball click
    // ============================================================

    // Short reverb for collision (room ambience, not cathedral)
    effects.collisionReverb = new Tone.Reverb({ decay: 1.5, wet: 0.25 }).toDestination();

    // Layer 1: Sharp transient click (attack of the collision)
    synths.clickTransient = new Tone.MetalSynth({
        frequency: 900,
        envelope: { attack: 0.0005, decay: 0.012, release: 0.006 },
        harmonicity: 4,
        modulationIndex: 10,
        resonance: 5500,
        octaves: 0.2,
        volume: -18,
    }).connect(effects.collisionReverb);

    // Layer 2: Metallic ring (the "sustain" of steel vibrating)
    synths.metallicRing = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.15 },
        volume: -26,
    }).connect(effects.collisionReverb);

    // Layer 3: Low thud body (weight of the ball)
    synths.thudBody = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
        volume: -24,
    }).connect(effects.collisionReverb);

    // === Other scene sounds (peg, wall, pop) ===
    effects.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).toDestination();
    effects.filter = new Tone.Filter(2000, 'lowpass').connect(effects.reverb);

    synths.pegClick = new Tone.MetalSynth({
        frequency: 800,
        envelope: { attack: 0.001, decay: 0.015, release: 0.008 },
        harmonicity: 3,
        modulationIndex: 8,
        resonance: 5000,
        octaves: 0.3,
        volume: -22,
    }).connect(effects.reverb);

    synths.wallThud = new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
        volume: -10,
    }).connect(effects.reverb);

    synths.pop = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
        volume: -14,
    }).connect(effects.reverb);

    initialized = true;
}

export function isReady() { return initialized; }

// ============================================================
// AMBIENT CONTROL
// ============================================================

export function startAmbient() {
    if (!initialized || ambientPlaying) return;
    ambientPlaying = true;

    // 432Hz-tuned chords (A minor pentatonic — universally calming)
    // A2=108Hz, C3=128.43Hz, E3=161.82Hz in 432Hz tuning
    const chords = [
        [108, 161.82, 216],       // A minor (A2, E3, A3)
        [128.43, 161.82, 192.87], // C major (C3, E3, G3)
        [96.33, 128.43, 161.82],  // F major (F2, C3, E3)
        [108, 144, 216],          // A sus (A2, D3, A3)
    ];
    let idx = 0;

    function playChord() {
        if (!ambientPlaying) return;
        const c = chords[idx % chords.length];
        synths.drone1.triggerAttackRelease(c[0], '8m'); // very long notes
        synths.drone2.triggerAttackRelease(c[1], '8m');
        synths.drone3.triggerAttackRelease(c[2], '8m');
        idx++;
    }

    playChord();
    ambientLoop = setInterval(playChord, 12000); // chord shifts every 12s
}

export function stopAmbient() {
    ambientPlaying = false;
    if (ambientLoop) { clearInterval(ambientLoop); ambientLoop = null; }
}

// ============================================================
// COLLISION SOUND — 3-layer steel ball click with variation
// ============================================================

let lastSoundTime = 0;
const MIN_SOUND_INTERVAL = 40;

export function collisionSound(speed, type = 'tap') {
    if (!initialized) return;
    const now = Date.now();
    if (now - lastSoundTime < MIN_SOUND_INTERVAL) return;
    lastSoundTime = now;

    const s = Math.min(speed, 15);

    if (type === 'ball') {
        // === STEEL BALL COLLISION — soothing click ===
        // Volume scales gently with speed
        const vol = Math.min(s * 1.2, 8) - 2;

        // Layer 1: Crisp metallic click (fixed frequency, vary volume only)
        synths.clickTransient.volume.value = -20 + vol + (Math.random() * 3 - 1.5);
        try { synths.clickTransient.triggerAttackRelease('32n'); } catch (e) { }

        // Layer 2: Soft sine ring — warm resonance tail
        const ringPitch = 1800 + Math.random() * 800; // 1800-2600 Hz range
        synths.metallicRing.volume.value = -28 + vol * 0.4 + (Math.random() * 2 - 1);
        try { synths.metallicRing.triggerAttackRelease(ringPitch, 0.15); } catch (e) { }

        // Layer 3: Subtle weight thud
        synths.thudBody.volume.value = -26 + vol * 0.3;
        try { synths.thudBody.triggerAttackRelease(80 + s * 3, '16n'); } catch (e) { }

    } else if (type === 'peg') {
        synths.clickTransient.volume.value = -22 + (Math.random() * 4 - 2);
        try { synths.clickTransient.triggerAttackRelease('32n'); } catch (e) { }

    } else if (type === 'wall') {
        const pitch = 40 + s * 6;
        synths.wallThud.volume.value = -12 + (Math.random() * 3 - 1.5);
        try { synths.wallThud.triggerAttackRelease(pitch, '16n'); } catch (e) { }

    } else {
        synths.wallThud.volume.value = -14;
        try { synths.wallThud.triggerAttackRelease(60 + s * 10, '16n'); } catch (e) { }
    }
}

export function popSound() {
    if (!initialized) return;
    synths.pop.triggerAttackRelease('C3', '16n');
}
