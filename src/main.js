/**
 * Main entry — Scene loader and manager
 * Loads 6 animation scenes.
 */
import { initAudio, stopAmbient } from './utils/sound.js';

import { createScene as scene1 } from './scenes/scene1-plinko.js';
import { createScene as scene2 } from './scenes/scene2-container-fill.js';
import { createScene as scene3 } from './scenes/scene3-newtons-cradle.js';
import { createScene as scene4 } from './scenes/scene4-ball-splitter.js';
import { createScene as scene5 } from './scenes/scene5-funnel-cascade.js';
import { createScene as scene6 } from './scenes/scene6-geometric-art.js';

const scenes = [scene1, scene2, scene3, scene4, scene5, scene6];
let currentSceneIndex = 0;
let currentScene = null;
let audioStarted = false;

// ---- Start overlay ----
const overlay = document.getElementById('start-overlay');
overlay.addEventListener('click', async () => {
    await initAudio();
    audioStarted = true;
    overlay.classList.add('hidden');
    loadScene(currentSceneIndex);
});

// ---- Scene selector buttons ----
const buttons = document.querySelectorAll('.scene-btn');
buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        if (!audioStarted) return;
        const idx = parseInt(btn.dataset.scene) - 1;
        if (idx === currentSceneIndex) return;
        currentSceneIndex = idx;
        updateActiveButton();
        loadScene(idx);
    });
});

// ---- Replay button ----
document.getElementById('replay-btn').addEventListener('click', () => {
    if (!audioStarted) return;
    loadScene(currentSceneIndex);
});

function updateActiveButton() {
    buttons.forEach((btn) => {
        const idx = parseInt(btn.dataset.scene) - 1;
        btn.classList.toggle('active', idx === currentSceneIndex);
    });
}

function loadScene(index) {
    stopAmbient();
    if (currentScene && currentScene.destroy) {
        currentScene.destroy();
        currentScene = null;
    }
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';
    currentScene = scenes[index](container);
}

// ---- Puppeteer auto-start (for headless recording) ----
window.__autoStart = async () => {
    await initAudio();
    audioStarted = true;
    overlay.classList.add('hidden');
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    const sceneIdx = window.__recordScene ?? 2;
    loadScene(sceneIdx);
};
