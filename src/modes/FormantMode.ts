import type { AudioEngine } from '../audio/AudioEngine.ts';
import { FormantSynth } from '../audio/FormantSynth.ts';
import type { CanvasRenderer } from '../rendering/CanvasRenderer.ts';
import { drawFormantOverlay } from '../rendering/FormantOverlay.ts';
import { drawWaveform, drawSpectrum } from '../rendering/WaveformVisualizer.ts';
import type { TrackingResult } from '../tracking/HandTracker.ts';
import { frequencyToNoteName } from '../audio/utils.ts';

export interface VowelHandVis {
  kind: 'vowel';
  x: number;
  y: number;
  f1: number;
  f2: number;
  color: string;
}

export interface PitchHandVis {
  kind: 'pitch';
  x: number;
  y: number;
  pitch: number;
  brightness: number;
  noteName: string;
  color: string;
}

export type HandVis = VowelHandVis | PitchHandVis;

const VOWEL_COLOR = '#ff3366';
const PITCH_COLOR = '#00ffcc';

export class FormantMode {
  name = 'Formant';
  private synth: FormantSynth | null = null;
  private engine: AudioEngine;
  handVisuals: HandVis[] = [];
  guideVisible = true;

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  activate(): void {
    this.synth = new FormantSynth(this.engine);
  }

  deactivate(): void {
    this.synth?.destroy();
    this.synth = null;
    this.handVisuals = [];
  }

  onTrackingResult(result: TrackingResult, renderer: CanvasRenderer): void {
    if (!this.synth) return;

    this.handVisuals = [];

    // Hand 0 → vowel formant shaping
    if (result.hands.length > 0) {
      const hand = result.hands[0];
      const tip = hand.landmarks[8]; // index fingertip
      const nx = 1 - tip.x;
      const ny = tip.y;

      this.synth.setVowelFromHand(nx, ny);

      this.handVisuals.push({
        kind: 'vowel',
        x: renderer.landmarkX(tip.x),
        y: renderer.landmarkY(tip.y),
        f1: this.synth.f1,
        f2: this.synth.f2,
        color: VOWEL_COLOR,
      });
    } else {
      this.synth.muteVowel();
    }

    // Hand 1 → pitch + brightness + vibrato
    if (result.hands.length > 1) {
      const hand = result.hands[1];
      const tip = hand.landmarks[8]; // index fingertip
      const nx = 1 - tip.x;
      const ny = tip.y;

      this.synth.setPitchAndBrightness(nx, ny);

      // Vibrato from finger spread (thumb tip → pinky tip distance)
      const thumb = hand.landmarks[4];
      const pinky = hand.landmarks[20];
      const dx = thumb.x - pinky.x;
      const dy = thumb.y - pinky.y;
      const spread = Math.sqrt(dx * dx + dy * dy);
      // Closed fist ≈ 0.05, fully spread ≈ 0.25
      const normalizedSpread = Math.max(0, Math.min(1, (spread - 0.05) / 0.2));
      this.synth.setVibrato(normalizedSpread);

      this.handVisuals.push({
        kind: 'pitch',
        x: renderer.landmarkX(tip.x),
        y: renderer.landmarkY(tip.y),
        pitch: this.synth.pitch,
        brightness: this.synth.brightness,
        noteName: frequencyToNoteName(this.synth.pitch),
        color: PITCH_COLOR,
      });
    } else {
      this.synth.mutePitch();
    }
  }

  render(renderer: CanvasRenderer): void {
    drawSpectrum(renderer.ctx, this.engine.analyser, renderer.width, renderer.height);
    drawWaveform(renderer.ctx, this.engine.analyser, renderer.width, renderer.height);
    drawFormantOverlay(renderer, this.handVisuals, this.guideVisible);
  }
}
