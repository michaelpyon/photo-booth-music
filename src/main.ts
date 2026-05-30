import './style.css';
import { CameraManager } from './camera/CameraManager.ts';
import { HandTracker } from './tracking/HandTracker.ts';
import { AudioEngine } from './audio/AudioEngine.ts';
import { KeyDetector } from './audio/KeyDetector.ts';
import { CanvasRenderer } from './rendering/CanvasRenderer.ts';
import { ThereminMode } from './modes/ThereminMode.ts';
import { FormantMode } from './modes/FormantMode.ts';
import { ConductorMode } from './modes/ConductorMode.ts';
import { ModeSelector } from './ui/ModeSelector.ts';
import type { ModeName } from './ui/ModeSelector.ts';
import { ThereminControls } from './ui/ThereminControls.ts';
import { ConductorControls } from './ui/ConductorControls.ts';
import { WelcomePopup } from './ui/WelcomePopup.ts';
import type { TrackingResult } from './tracking/HandTracker.ts';

async function startCamera(
  camera: CameraManager,
  loadingEl: HTMLElement,
): Promise<boolean> {
  // Reset to loading state
  const content = loadingEl.querySelector('.loading-content')!;
  content.innerHTML =
    '<div class="spinner"></div><p>Requesting camera access...</p>';
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

/**
 * Lightweight landing demo. Stylized hands trail glowing violet note-streaks
 * with a waveform pulse, evoking hand to sound, with no camera required.
 * Autoplays and loops until the visitor clicks "Start playing".
 *
 * SWAP POINT: to show a real screen recording instead, swap the
 * <canvas id="demo-canvas"> in index.html for a looping <video> and delete
 * this function plus its call site.
 */
function startDemoAnimation(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const VIOLET = '#a78bfa';
  let raf = 0;
  let running = true;

  // Two stylized "hands": a small cluster of landmark dots that drift on
  // smooth sine paths. Each leaves a fading violet streak behind it.
  type Trail = { x: number; y: number }[];
  const hands = [
    { phase: 0, baseY: 0.42, amp: 0.16, speed: 0.55, freq: 1.0, trail: [] as Trail },
    { phase: Math.PI, baseY: 0.58, amp: 0.13, speed: 0.7, freq: 1.4, trail: [] as Trail },
  ];

  function size() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }
  size();
  const onResize = () => size();
  window.addEventListener('resize', onResize);

  const start = performance.now();

  function frame(now: number) {
    if (!running) return;
    const t = (now - start) / 1000;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, w, h);

    // Waveform pulse along the bottom, breathing with the hand motion.
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    const waveY = h * 0.86;
    const energy = 0.5 + 0.5 * Math.sin(t * 1.6);
    for (let px = 0; px <= w; px += 4 * dpr) {
      const k = px / w;
      const y =
        waveY +
        Math.sin(k * 14 + t * 4) * 10 * dpr * energy +
        Math.sin(k * 33 - t * 3) * 5 * dpr * energy;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.restore();

    for (const hand of hands) {
      const x = w * (0.5 + 0.34 * Math.sin(t * hand.speed * hand.freq + hand.phase));
      const y =
        h *
        (hand.baseY + hand.amp * Math.sin(t * hand.speed * 1.7 + hand.phase * 1.3));

      hand.trail.push({ x, y });
      if (hand.trail.length > 26) hand.trail.shift();

      // Glowing violet note-streak.
      for (let i = 0; i < hand.trail.length; i++) {
        const p = hand.trail[i];
        const a = (i / hand.trail.length) * 0.55;
        ctx.beginPath();
        ctx.fillStyle = VIOLET;
        ctx.globalAlpha = a;
        ctx.shadowColor = VIOLET;
        ctx.shadowBlur = 16 * dpr * a;
        ctx.arc(p.x, p.y, (2 + i * 0.25) * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Stylized hand: a palm dot with five short finger dots fanning out.
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#f0f0f0';
      ctx.shadowColor = VIOLET;
      ctx.shadowBlur = 18 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, 5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      for (let f = 0; f < 5; f++) {
        const ang = -Math.PI / 2 + (f - 2) * 0.42;
        const len = (22 + Math.sin(t * 3 + f + hand.phase) * 6) * dpr;
        const fx = Math.cos(ang) * len;
        const fy = Math.sin(ang) * len;
        ctx.strokeStyle = 'rgba(240,240,240,0.85)';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = VIOLET;
        ctx.arc(fx, fy, 2.5 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
  };
}

async function main() {
  const video = document.getElementById('webcam') as HTMLVideoElement;
  const canvas = document.getElementById('overlay') as HTMLCanvasElement;
  const loadingEl = document.getElementById('loading')!;
  const modeSelectorEl = document.getElementById('mode-selector')!;
  const modeControlsEl = document.getElementById('mode-controls')!;
  const landingEl = document.getElementById('landing')!;
  const demoCanvas = document.getElementById('demo-canvas') as HTMLCanvasElement;
  const startBtn = document.getElementById('start-playing') as HTMLButtonElement;

  // Init the audio engine up front so the "Start playing" click can resume it
  // within the user gesture (satisfies the browser autoplay policy).
  const audioEngine = new AudioEngine();

  // Run the no-camera demo animation behind the landing until the visitor
  // clicks "Start playing".
  const stopDemo = startDemoAnimation(demoCanvas);

  // Gate the camera + audio behind an explicit click. We do NOT call
  // camera.start() on load anymore: that produced a cold permission prompt
  // with no context. The click also serves as the autoplay gesture.
  await new Promise<void>((resolve) => {
    startBtn.addEventListener(
      'click',
      () => {
        audioEngine.resume();
        resolve();
      },
      { once: true },
    );
  });

  stopDemo();
  landingEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');

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

  // 2. Audio engine was created and resumed at the "Start playing" gesture.

  // 3. Set up canvas renderer
  const renderer = new CanvasRenderer(canvas, video);

  // 4. Create modes
  const thereminMode = new ThereminMode(audioEngine);
  const formantMode = new FormantMode(audioEngine);
  const conductorMode = new ConductorMode();
  let activeMode: ThereminMode | FormantMode | ConductorMode = thereminMode;

  // 5. Create key detector
  const keyDetector = new KeyDetector(audioEngine.ctx);

  // 6. Create UI
  const modeSelector = new ModeSelector(modeSelectorEl);
  const thereminControls = new ThereminControls(modeControlsEl);
  const conductorControls = new ConductorControls(modeControlsEl);
  conductorControls.hide();

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

  // Wire conductor controls
  conductorControls.onPlayPause = () => {
    audioEngine.resume();
    if (conductorMode.playing) {
      conductorMode.pause();
      conductorControls.updatePlaying(false);
    } else if (conductorMode.generativeMode) {
      conductorMode.startGenerative();
      conductorControls.updatePlaying(true);
    } else {
      conductorMode.playSong();
      conductorControls.updatePlaying(true);
    }
  };

  conductorControls.onSongChange = (index: number) => {
    audioEngine.resume();
    conductorMode.playSong(index);
    conductorControls.updatePlaying(true);
    conductorControls.updateGenerative(false);
  };

  conductorControls.onGenerativeToggle = () => {
    audioEngine.resume();
    if (conductorMode.generativeMode) {
      conductorMode.stop();
      conductorControls.updateGenerative(false);
      conductorControls.updatePlaying(false);
    } else {
      conductorMode.startGenerative();
      conductorControls.updateGenerative(true);
      conductorControls.updatePlaying(true);
    }
  };

  conductorMode.onStateChange = (state) => {
    conductorControls.updateTempo(state.tempo);
    conductorControls.updatePlaying(state.playing);
  };

  // Wire mode switching
  modeSelector.onChange = (mode: ModeName) => {
    audioEngine.resume();
    activeMode.deactivate();
    thereminControls.hide();
    conductorControls.hide();

    if (mode === 'theremin') {
      activeMode = thereminMode;
      thereminControls.show();
    } else if (mode === 'formant') {
      activeMode = formantMode;
    } else {
      activeMode = conductorMode;
      conductorControls.show();
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
  const loadingMarkup =
    '<div class="spinner"></div><p>Loading hand tracking model...</p>';
  loadingContent.innerHTML = loadingMarkup;

  // Reliability: the model loads from a CDN. If it fails, show a visible
  // on-brand error card with a retry button instead of a forever-spinner.
  // Loop until init succeeds, waiting for a click between attempts.
  for (;;) {
    try {
      await tracker.init();
      break;
    } catch (err) {
      console.error(err);
      loadingContent.innerHTML = `
        <div class="tracker-error">
          <div class="tracker-error-icon">&#9888;</div>
          <h2>Could not load hand tracking</h2>
          <p>The hand tracking model failed to download. Check your connection and try again.</p>
          <button class="btn tracker-error-retry" type="button">Retry</button>
        </div>
      `;
      await new Promise<void>((resolve) => {
        loadingContent.querySelector('.tracker-error-retry')!.addEventListener(
          'click',
          () => {
            loadingContent.innerHTML = loadingMarkup;
            resolve();
          },
          { once: true },
        );
      });
    }
  }
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
    } else if (activeMode === conductorMode) {
      // Space to play/pause
      if (e.key === ' ') {
        e.preventDefault();
        conductorControls.onPlayPause?.();
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
