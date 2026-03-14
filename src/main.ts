import './style.css';
import { CameraManager } from './camera/CameraManager.ts';
import { HandTracker } from './tracking/HandTracker.ts';
import { AudioEngine } from './audio/AudioEngine.ts';
import { KeyDetector } from './audio/KeyDetector.ts';
import { CanvasRenderer } from './rendering/CanvasRenderer.ts';
import { ThereminMode } from './modes/ThereminMode.ts';
import { FormantMode } from './modes/FormantMode.ts';
import { ModeSelector } from './ui/ModeSelector.ts';
import type { ModeName } from './ui/ModeSelector.ts';
import { ThereminControls } from './ui/ThereminControls.ts';
import { WelcomePopup } from './ui/WelcomePopup.ts';
import type { TrackingResult } from './tracking/HandTracker.ts';

async function main() {
  const video = document.getElementById('webcam') as HTMLVideoElement;
  const canvas = document.getElementById('overlay') as HTMLCanvasElement;
  const loadingEl = document.getElementById('loading')!;
  const modeSelectorEl = document.getElementById('mode-selector')!;
  const modeControlsEl = document.getElementById('mode-controls')!;

  // 1. Start camera
  const camera = new CameraManager(video);
  try {
    await camera.start();
  } catch (e) {
    loadingEl.innerHTML = `
      <div class="camera-denied">
        <div class="denied-icon">🎵</div>
        <h1 class="denied-title">Air Composer</h1>
        <p class="denied-tagline">Play music with your hands</p>
        <div class="denied-divider"></div>
        <p class="denied-explain">Air Composer uses your webcam to track hand movements and turn them into music.</p>
        <div class="denied-steps">
          <p class="denied-steps-heading">To get started:</p>
          <ol>
            <li>Click the camera icon in your browser's address bar</li>
            <li>Select "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <button class="denied-reload" onclick="location.reload()">Refresh Page</button>
        <div class="denied-about">
          <p class="denied-about-heading">What is Air Composer?</p>
          <p>Wave your hands in front of your webcam to play a synthesizer. Your left hand controls pitch, your right hand controls volume and effects. No downloads, no plugins.</p>
        </div>
        <a class="denied-back" href="https://pyon.dev">&larr; Back to pyon.dev</a>
      </div>
    `;
    return;
  }

  // 2. Init audio engine (will be resumed on first interaction)
  const audioEngine = new AudioEngine();

  // 3. Set up canvas renderer
  const renderer = new CanvasRenderer(canvas, video);

  // 4. Create modes
  const thereminMode = new ThereminMode(audioEngine);
  const formantMode = new FormantMode(audioEngine);
  let activeMode: ThereminMode | FormantMode = thereminMode;

  // 5. Create key detector
  const keyDetector = new KeyDetector(audioEngine.ctx);

  // 6. Create UI
  const modeSelector = new ModeSelector(modeSelectorEl);
  const thereminControls = new ThereminControls(modeControlsEl);

  // Wire theremin controls
  thereminControls.onAudioToggle = (on) => {
    audioEngine.resume();
    thereminMode.audioOn = on;
  };
  thereminControls.onYModeChange = (mode) => {
    thereminMode.yMode = mode;
  };
  thereminControls.onScaleSnapToggle = (on) => {
    thereminMode.scaleSnap = on;
  };
  thereminControls.onRootChange = (root) => {
    thereminMode.rootNote = root;
  };
  thereminControls.onScaleChange = (scale) => {
    thereminMode.scaleName = scale;
  };

  // Wire listen toggle
  thereminControls.onListenToggle = async (on) => {
    audioEngine.resume();
    if (on) {
      try {
        await keyDetector.start();
        thereminMode.listening = true;
      } catch (_e) {
        // Mic permission denied — revert button state
        thereminMode.listening = false;
      }
    } else {
      keyDetector.stop();
      thereminMode.listening = false;
    }
  };

  // Wire key detection results
  keyDetector.onKeyChange = (root, quality, confidence) => {
    thereminMode.rootNote = root;
    thereminMode.scaleName = quality;
    thereminControls.setDetectedKey(root, quality, confidence);
  };

  keyDetector.onChordChange = (chord) => {
    thereminMode.currentChord = chord?.label ?? '';
  };

  // Wire mode switching
  modeSelector.onChange = (mode: ModeName) => {
    audioEngine.resume();
    activeMode.deactivate();
    if (mode === 'theremin') {
      activeMode = thereminMode;
      thereminControls.show();
    } else {
      activeMode = formantMode;
      thereminControls.hide();
    }
    activeMode.activate();
  };

  // Activate default mode
  thereminMode.activate();
  thereminControls.show();

  // 7. Init hand tracking
  const tracker = new HandTracker(video, (result: TrackingResult) => {
    activeMode.onTrackingResult(result, renderer);
  });

  loadingEl.querySelector('p')!.textContent = 'Loading hand tracking model...';
  await tracker.init();
  loadingEl.classList.add('hidden');

  // 7.5 Show welcome popup on first visit
  if (WelcomePopup.shouldShow()) {
    new WelcomePopup(() => {
      audioEngine.resume();
    });
  }

  // 8. Resume audio on any click
  document.addEventListener('click', () => audioEngine.resume(), { once: true });

  // 9. Keyboard shortcuts (mode-specific)
  document.addEventListener('keydown', (e) => {
    if (activeMode === thereminMode) {
      // Arrow keys to shift theremin pitch range
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        thereminMode.rangeOffset += 0.5;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        thereminMode.rangeOffset -= 0.5;
      }
    } else if (activeMode === formantMode) {
      // H key to toggle tutorial guide
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        formantMode.guideVisible = !formantMode.guideVisible;
      }
    }
  });

  // 10. Start tracking and render loop
  tracker.start();

  const onResize = () => renderer.resize();
  window.addEventListener('resize', onResize);
  onResize();

  function renderLoop() {
    renderer.clear();
    renderer.drawVideoFrame();
    activeMode.render(renderer);
    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
}

main().catch(console.error);
