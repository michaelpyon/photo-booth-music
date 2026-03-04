import type { AudioEngine } from './AudioEngine.ts';
import { snapToScale } from './utils.ts';

const RAMP_TIME = 0.03;

// ── Pitch range (Hand 2 X-axis) ─────────────────────────────────────
const DEFAULT_PITCH = 130.81;   // C3
const PITCH_MIN = 130.81;       // C3
const PITCH_MAX = 523.25;       // C5 — 2 octaves

// ── Brightness range (Hand 2 Y-axis: lowpass cutoff) ────────────────
const BRIGHTNESS_MIN = 300;     // Hz — dark/muffled
const BRIGHTNESS_MAX = 8000;    // Hz — bright/open

// ── Vibrato (finger spread) ─────────────────────────────────────────
const LFO_RATE = 5.5;           // Hz
const LFO_DEPTH_MAX = 15;       // Hz deviation at max spread

// ── Single synth channel ────────────────────────────────────────────
interface SynthChannel {
  source: OscillatorNode;
  waveshaper: WaveShaperNode;
  filterF1: BiquadFilterNode;
  filterF2: BiquadFilterNode;
  filterF3: BiquadFilterNode;
  gainF1: GainNode;
  gainF2: GainNode;
  gainF3: GainNode;
  brightnessFilter: BiquadFilterNode;  // lowpass after formant sum
  channelGain: GainNode;
  lfo: OscillatorNode;                 // vibrato LFO
  lfoGain: GainNode;                   // vibrato depth
}

/** Build a soft-clip saturation curve */
function makeSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 256;
  const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

export class FormantSynth {
  private engine: AudioEngine;
  private channel: SynthChannel | null = null;

  // Vowel state (Hand 1) — default: EH vowel ("yeah")
  private _f1 = 530;
  private _f2 = 1840;

  // Pitch + expression state (Hand 2)
  private _pitch = DEFAULT_PITCH;
  private _brightness = BRIGHTNESS_MAX;
  private _vibratoDepth = 0;

  // Scale snap (optional, off by default)
  private _scaleSnap = false;
  private _rootNote = 'C';
  private _scaleName = 'Major';

  constructor(engine: AudioEngine) {
    this.engine = engine;
    this.channel = this.createChannel();
  }

  // ── Build the audio graph ─────────────────────────────────────────
  private createChannel(): SynthChannel {
    const ctx = this.engine.ctx;

    // Source: sawtooth with variable pitch
    const source = ctx.createOscillator();
    source.type = 'sawtooth';
    source.frequency.value = DEFAULT_PITCH;

    // Saturation for fatter talk box tone
    const waveshaper = ctx.createWaveShaper();
    waveshaper.curve = makeSaturationCurve(3);
    waveshaper.oversample = '2x';

    // Three parallel formant bandpass filters (Hand 1 controls F1/F2)
    // Default position: EH vowel ("yeah" territory) — F1≈530, F2≈1840
    const filterF1 = ctx.createBiquadFilter();
    filterF1.type = 'bandpass';
    filterF1.frequency.value = 530;
    filterF1.Q.value = 14;

    const filterF2 = ctx.createBiquadFilter();
    filterF2.type = 'bandpass';
    filterF2.frequency.value = 1840;
    filterF2.Q.value = 12;

    const filterF3 = ctx.createBiquadFilter();
    filterF3.type = 'bandpass';
    filterF3.frequency.value = 2640;  // F2 + 800
    filterF3.Q.value = 10;

    const gainF1 = ctx.createGain();
    gainF1.gain.value = 2.0;
    const gainF2 = ctx.createGain();
    gainF2.gain.value = 1.4;
    const gainF3 = ctx.createGain();
    gainF3.gain.value = 0.7;

    // Brightness lowpass (Hand 2 Y-axis controls cutoff)
    const brightnessFilter = ctx.createBiquadFilter();
    brightnessFilter.type = 'lowpass';
    brightnessFilter.frequency.value = BRIGHTNESS_MAX;
    brightnessFilter.Q.value = 1;

    const channelGain = ctx.createGain();
    channelGain.gain.value = 0;

    // Vibrato LFO → oscillator frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = LFO_RATE;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0; // no vibrato by default

    // ── Wire the graph ──────────────────────────────────────────────
    // Source → saturation → parallel formants → brightness filter → output
    source.connect(waveshaper);
    waveshaper.connect(filterF1);
    waveshaper.connect(filterF2);
    waveshaper.connect(filterF3);
    filterF1.connect(gainF1);
    filterF2.connect(gainF2);
    filterF3.connect(gainF3);
    gainF1.connect(brightnessFilter);
    gainF2.connect(brightnessFilter);
    gainF3.connect(brightnessFilter);
    brightnessFilter.connect(channelGain);
    channelGain.connect(this.engine.masterGain);

    // LFO → pitch modulation
    lfo.connect(lfoGain);
    lfoGain.connect(source.frequency);

    source.start();
    lfo.start();

    return {
      source, waveshaper,
      filterF1, filterF2, filterF3,
      gainF1, gainF2, gainF3,
      brightnessFilter, channelGain,
      lfo, lfoGain,
    };
  }

  // ── Hand 1: Vowel formant control ─────────────────────────────────
  setVowelFromHand(x: number, y: number): void {
    if (!this.channel) return;
    const ch = this.channel;
    const now = this.engine.currentTime;

    // Y-axis → F1 (openness: 250–900 Hz)
    const f1 = 250 + (1 - y) * 650;
    ch.filterF1.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), now + RAMP_TIME);
    this._f1 = f1;

    // X-axis → F2 (vowel quality: 800–2400 Hz)
    const f2 = 800 + x * 1600;
    ch.filterF2.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), now + RAMP_TIME);
    this._f2 = f2;

    // F3 follows F2 automatically
    const f3 = f2 + 800;
    ch.filterF3.frequency.exponentialRampToValueAtTime(Math.max(f3, 1), now + RAMP_TIME);

    // Unmute
    ch.channelGain.gain.linearRampToValueAtTime(1.2, now + RAMP_TIME);
  }

  muteVowel(): void {
    if (!this.channel) return;
    const now = this.engine.currentTime;
    this.channel.channelGain.gain.linearRampToValueAtTime(0, now + 0.1);
  }

  // ── Hand 2: Pitch + brightness control ────────────────────────────
  setPitchAndBrightness(x: number, y: number): void {
    if (!this.channel) return;
    const ch = this.channel;
    const now = this.engine.currentTime;

    // X-axis → Pitch (exponential over 2 octaves: C3–C5)
    let freq = PITCH_MIN * Math.pow(PITCH_MAX / PITCH_MIN, x);

    // Optional scale snapping
    if (this._scaleSnap) {
      freq = snapToScale(freq, this._rootNote, this._scaleName);
    }

    ch.source.frequency.exponentialRampToValueAtTime(Math.max(freq, 1), now + RAMP_TIME);
    this._pitch = freq;

    // Y-axis → Brightness (lowpass cutoff, inverted: up = bright, down = dark)
    const invY = 1 - y;
    const cutoff = BRIGHTNESS_MIN * Math.pow(BRIGHTNESS_MAX / BRIGHTNESS_MIN, invY);
    ch.brightnessFilter.frequency.exponentialRampToValueAtTime(cutoff, now + RAMP_TIME);
    this._brightness = cutoff;
  }

  /** Set vibrato depth from finger spread (0 = no vibrato, 1 = max) */
  setVibrato(depth: number): void {
    if (!this.channel) return;
    const now = this.engine.currentTime;
    const lfoDepth = depth * LFO_DEPTH_MAX;
    this.channel.lfoGain.gain.linearRampToValueAtTime(lfoDepth, now + RAMP_TIME);
    this._vibratoDepth = depth;
  }

  /** When Hand 2 leaves: reset brightness to open, zero vibrato, keep pitch */
  mutePitch(): void {
    if (!this.channel) return;
    const now = this.engine.currentTime;
    this.channel.brightnessFilter.frequency.exponentialRampToValueAtTime(
      BRIGHTNESS_MAX, now + 0.1
    );
    this.channel.lfoGain.gain.linearRampToValueAtTime(0, now + 0.1);
    this._brightness = BRIGHTNESS_MAX;
    this._vibratoDepth = 0;
  }

  muteAll(): void {
    this.muteVowel();
    this.mutePitch();
  }

  // ── Getters ───────────────────────────────────────────────────────
  get f1(): number { return this._f1; }
  get f2(): number { return this._f2; }
  get pitch(): number { return this._pitch; }
  get brightness(): number { return this._brightness; }
  get vibratoDepth(): number { return this._vibratoDepth; }

  get scaleSnap(): boolean { return this._scaleSnap; }
  set scaleSnap(v: boolean) { this._scaleSnap = v; }
  get rootNote(): string { return this._rootNote; }
  set rootNote(v: string) { this._rootNote = v; }
  get scaleName(): string { return this._scaleName; }
  set scaleName(v: string) { this._scaleName = v; }

  // ── Cleanup ───────────────────────────────────────────────────────
  destroy(): void {
    if (this.channel) {
      this.channel.source.stop();
      this.channel.source.disconnect();
      this.channel.lfo.stop();
      this.channel.lfo.disconnect();
      this.channel.lfoGain.disconnect();
      this.channel.waveshaper.disconnect();
      this.channel.filterF1.disconnect();
      this.channel.filterF2.disconnect();
      this.channel.filterF3.disconnect();
      this.channel.gainF1.disconnect();
      this.channel.gainF2.disconnect();
      this.channel.gainF3.disconnect();
      this.channel.brightnessFilter.disconnect();
      this.channel.channelGain.disconnect();
    }
    this.channel = null;
  }
}
