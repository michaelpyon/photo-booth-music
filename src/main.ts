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

async function startCamera(
  camera: CameraManager,
  loadingEl: HTMLElement,
): Promise<boolean> {
  // Reset to loading state
  const content = loadingEl.querySelector('.loading-content')!;
  content.innerHTML =
    '<div class="waveform-loader"><span></span><span></span><span></span><span></span><span></span></div><p>Requesting camera access...</p>';
  loadingEl.classList.remove('hidden');

  try {
    await camera.start();
    return true;
  } catch (e) {
    const isDenied =
      e instanceof DOMException &&
      (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError');

    content.innerHTML = `
      <div class="camera-denied">
        <div class="camera-denied-icon">&#128247;</div>
        <h2>Camera Access Required</h2>
        <p>${
          isDenied
            ? 'Camera permission was denied. Air Composer needs your camera to track hand movements and turn them into music.'
            : 'Could not access the camera. Please make sure a camera is connected and not in use by another application.'
        }</p>
        <button class="btn camera-denied-retry" type="button">Try Again</button>
        ${isDenied ? '<p class="camera-denied-hint">If the browser does not prompt you again, click the camera icon in your address bar to reset permissions, then try again.</p>' : ''}
      </div>
    `;

    return new Promise<boolean>((resolve) => {
      content.querySelector('.camera-denied-retry')!.addEventListener(
        'click',
        () => {
          resolve(startCamera(camera, loadingEl));
        },
        { once: true },
      );
    });
  }
}

async function main() {
  const video = document.getElementById('webcam') as HTMLVideoElement;
  const canvas = document.getElementById('overlay') as HTMLCanvasElement;
  const loadingEl = document.getElementById('loading')!;
  const toolbar = document.getElementById('toolbar')!;
  const modeSelectorEl = document.getElementById('mode-selector')!;
  const modeControlsEl = document.getElementById('mode-controls')!;

  // 1. Start camera (with retry support)
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

  const loadingContent = loadingEl.querySelector('.loading-content')!;
  loadingContent.innerHTML =
    '<div class="waveform-loader"><span></span><span></span><span></span><span></span><span></span></div><p>Loading hand tracking model...</p>';
  await tracker.init();
  loadingEl.classList.add('hidden');

  // Staggered entrance animation for toolbar
  toolbar.classList.add('entered');
  const toolbarChildren = toolbar.querySelectorAll('.btn, .toolbar-select, .divider, .btn-group, .detected-key-badge');
  toolbarChildren.forEach((child, i) => {
    const el = child as HTMLElement;
    el.style.opacity = '0';
    el.style.animation = `toolbar-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
    el.style.animationDelay = `${80 * (i + 1)}ms`;
  });

  // 7.5 Show welcome popup on first visit
  if (WelcomePopup.shouldShow()) {
    new WelcomePopup(() => {
      audioEngine.resume();
    });
  }

  // 8. Resume audio on any click
  document.addEventListener('click', () => audioEngine.resume(), { once: true });

  // 9. Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't capture shortcuts when typing in an input/select
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

    switch (e.key) {
      // Mode switching
      case '1':
        modeSelector.select('theremin');
        break;
      case '2':
        modeSelector.select('formant');
        break;

      // Theremin-specific shortcuts
      case 'a':
      case 'A':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.toggleAudio();
        }
        break;
      case 's':
      case 'S':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.toggleScaleSnap();
        }
        break;
      case 'l':
      case 'L':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.toggleListen();
        }
        break;
      case 'f':
      case 'F':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.setYMode('filter');
        }
        break;
      case 't':
      case 'T':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.setYMode('timbre');
        }
        break;
      case 'v':
      case 'V':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.setYMode('vibrato');
        }
        break;
      case 'o':
      case 'O':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminControls.setYMode('octave');
        }
        break;

      // Theremin range shifting
      case 'ArrowUp':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminMode.rangeOffset += 0.5;
        }
        break;
      case 'ArrowDown':
        if (activeMode === thereminMode) {
          e.preventDefault();
          thereminMode.rangeOffset -= 0.5;
        }
        break;

      // Formant guide toggle
      case 'h':
      case 'H':
        if (activeMode === formantMode) {
          e.preventDefault();
          formantMode.guideVisible = !formantMode.guideVisible;
        }
        break;
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
