import type { AudioEngine } from '../audio/AudioEngine.ts';
import { ThereminSynth } from '../audio/ThereminSynth.ts';
import type { YAxisMode } from '../audio/ThereminSynth.ts';
import type { CanvasRenderer } from '../rendering/CanvasRenderer.ts';
import { drawThereminOverlay } from '../rendering/ThereminOverlay.ts';
import { drawWaveform } from '../rendering/WaveformVisualizer.ts';
import type { TrackingResult } from '../tracking/HandTracker.ts';

export class ThereminMode {
  name = 'Theremin';
  private synth: ThereminSynth | null = null;
  private engine: AudioEngine;
  private handX: number | null = null;
  private handY: number | null = null;
  private normX = 0.5;
  private normY = 0.5;

  /** Set by main.ts when key detector is active */
  listening = false;
  currentChord = '';

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  activate(): void {
    this.synth = new ThereminSynth(this.engine);
  }

  deactivate(): void {
    this.synth?.destroy();
    this.synth = null;
    this.handX = null;
    this.handY = null;
  }

  onTrackingResult(result: TrackingResult, renderer: CanvasRenderer): void {
    if (!this.synth) return;

    if (result.hands.length > 0) {
      const hand = result.hands[0];
      const tip = hand.landmarks[8];

      this.normX = 1 - tip.x;
      this.normY = tip.y;
      this.handX = renderer.landmarkX(tip.x);
      this.handY = renderer.landmarkY(tip.y);

      this.synth.setFrequencyFromX(this.normX);
      this.synth.setYFromHand(this.normY);
    } else {
      this.handX = null;
      this.handY = null;
      this.synth.mute();
    }
  }

  render(renderer: CanvasRenderer): void {
    if (!this.synth) return;

    drawThereminOverlay(
      renderer,
      this.handX,
      this.handY,
      this.synth.currentFreq,
      this.synth.currentYValue,
      this.synth.currentYLabel,
      this.synth.currentYMode,
      this.synth.scaleSnap,
      this.synth.scaleSnap ? `${this.synth.rootNote} ${this.synth.scaleName}` : '',
      this.listening,
      this.currentChord,
      this.synth.rangeLabel
    );

    drawWaveform(renderer.ctx, this.engine.analyser, renderer.width, renderer.height);
  }

  // === Proxied properties ===
  get audioOn(): boolean { return this.synth?.audioOn ?? true; }
  set audioOn(v: boolean) { if (this.synth) this.synth.audioOn = v; }

  get scaleSnap(): boolean { return this.synth?.scaleSnap ?? false; }
  set scaleSnap(v: boolean) { if (this.synth) this.synth.scaleSnap = v; }

  get rootNote(): string { return this.synth?.rootNote ?? 'C'; }
  set rootNote(v: string) { if (this.synth) this.synth.rootNote = v; }

  get scaleName(): string { return this.synth?.scaleName ?? 'Major'; }
  set scaleName(v: string) { if (this.synth) this.synth.scaleName = v; }

  get yMode(): YAxisMode { return this.synth?.yMode ?? 'filter'; }
  set yMode(v: YAxisMode) { if (this.synth) this.synth.yMode = v; }

  get rangeOffset(): number { return this.synth?.rangeOffset ?? 0; }
  set rangeOffset(v: number) { if (this.synth) this.synth.rangeOffset = v; }

  get rangeLabel(): string { return this.synth?.rangeLabel ?? 'C3–F#4'; }
}
