import type { AudioEngine } from './AudioEngine.ts';
import { normalizedToFrequency, snapToScale } from './utils.ts';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${note}${oct}`;
}

const BASE_FREQ = 130.81; // C3
const RANGE_OCTAVES = 1.5; // 1.5 octaves visible at a time (was 3)
const RAMP_TIME = 0.05;

export type YAxisMode = 'filter' | 'timbre' | 'vibrato' | 'octave';

export class ThereminSynth {
  private engine: AudioEngine;

  // Oscillators for timbre blend (sine + saw, crossfade via gains)
  private oscSine: OscillatorNode;
  private oscSaw: OscillatorNode;
  private gainSine: GainNode;
  private gainSaw: GainNode;

  // Filter for filter-cutoff mode
  private filter: BiquadFilterNode;

  // LFO for vibrato mode
  private lfo: OscillatorNode;
  private lfoGain: GainNode;

  // Output chain
  private outputGain: GainNode;

  private _audioOn = true;
  private _scaleSnap = false;
  private _rootNote = 'C';
  private _scaleName = 'Major';
  private _yMode: YAxisMode = 'filter';
  private _currentFreq = 440;
  private _currentYValue = 0.5; // normalized 0-1 (inverted: 0=top, 1=bottom)
  private _currentYLabel = '';

  // Octave mode: base range shifts
  private _octaveShift = 0;

  // Arrow-key range offset (in half-octave steps)
  private _rangeOffset = 0; // 0 = starting at C3

  constructor(engine: AudioEngine) {
    this.engine = engine;
    const ctx = engine.ctx;

    // === Sine oscillator ===
    this.oscSine = ctx.createOscillator();
    this.oscSine.type = 'sine';
    this.oscSine.frequency.value = 440;
    this.gainSine = ctx.createGain();
    this.gainSine.gain.value = 1; // default: full sine

    // === Sawtooth oscillator (for timbre blend) ===
    this.oscSaw = ctx.createOscillator();
    this.oscSaw.type = 'sawtooth';
    this.oscSaw.frequency.value = 440;
    this.gainSaw = ctx.createGain();
    this.gainSaw.gain.value = 0; // default: no saw

    // === Low-pass filter ===
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 8000; // wide open by default
    this.filter.Q.value = 2;

    // === Vibrato LFO ===
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 5.5; // ~5.5 Hz vibrato rate
    this.lfoGain = ctx.createGain();
    this.lfoGain.gain.value = 0; // no vibrato by default

    // === Output gain (master for this synth) ===
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = 0;

    // Wire: oscillators -> filter -> outputGain -> master
    this.oscSine.connect(this.gainSine);
    this.oscSaw.connect(this.gainSaw);
    this.gainSine.connect(this.filter);
    this.gainSaw.connect(this.filter);
    this.filter.connect(this.outputGain);
    this.outputGain.connect(engine.masterGain);

    // Wire LFO -> oscillator frequencies
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.oscSine.frequency);
    this.lfoGain.connect(this.oscSaw.frequency);

    // Start all oscillators
    this.oscSine.start();
    this.oscSaw.start();
    this.lfo.start();
  }

  /** x: normalized 0-1 (hand X position, already mirrored) */
  setFrequencyFromX(x: number): void {
    // Compute visible frequency range from rangeOffset + octave mode
    let totalOffset = this._rangeOffset;
    if (this._yMode === 'octave') {
      totalOffset += this._octaveShift;
    }
    const minF = BASE_FREQ * Math.pow(2, totalOffset);
    const maxF = BASE_FREQ * Math.pow(2, totalOffset + RANGE_OCTAVES);

    let freq = normalizedToFrequency(x, minF, maxF);
    if (this._scaleSnap) {
      freq = snapToScale(freq, this._rootNote, this._scaleName);
    }
    this._currentFreq = freq;
    const now = this.engine.currentTime;
    this.oscSine.frequency.exponentialRampToValueAtTime(Math.max(freq, 1), now + RAMP_TIME);
    this.oscSaw.frequency.exponentialRampToValueAtTime(Math.max(freq, 1), now + RAMP_TIME);
  }

  /** y: normalized 0-1 (hand Y position, 0=top, 1=bottom) */
  setYFromHand(y: number): void {
    if (!this._audioOn) {
      this.mute();
      return;
    }

    const invY = Math.max(0, Math.min(1, 1 - y)); // 0=bottom, 1=top
    this._currentYValue = invY;
    const now = this.engine.currentTime;

    // Always unmute when hand is present
    this.outputGain.gain.linearRampToValueAtTime(0.7, now + RAMP_TIME);

    switch (this._yMode) {
      case 'filter': {
        // Map Y to filter cutoff: 150 Hz (hand down) to 8000 Hz (hand up)
        const cutoff = 150 * Math.pow(8000 / 150, invY);
        this.filter.frequency.exponentialRampToValueAtTime(cutoff, now + RAMP_TIME);
        this._currentYLabel = `${Math.round(cutoff)} Hz`;
        // Reset other modes
        this.gainSine.gain.linearRampToValueAtTime(1, now + RAMP_TIME);
        this.gainSaw.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        this.lfoGain.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        break;
      }
      case 'timbre': {
        // Crossfade: hand up = pure sine, hand down = full sawtooth
        this.gainSine.gain.linearRampToValueAtTime(invY, now + RAMP_TIME);
        this.gainSaw.gain.linearRampToValueAtTime(1 - invY, now + RAMP_TIME);
        this.filter.frequency.exponentialRampToValueAtTime(8000, now + RAMP_TIME);
        this.lfoGain.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        const pct = Math.round((1 - invY) * 100);
        this._currentYLabel = `Saw ${pct}%`;
        break;
      }
      case 'vibrato': {
        // Map Y to vibrato depth: 0 (hand down) to ~40 semitones worth of wobble (hand up)
        const depth = invY * 25; // max ±25 Hz deviation
        this.lfoGain.gain.linearRampToValueAtTime(depth, now + RAMP_TIME);
        this.gainSine.gain.linearRampToValueAtTime(1, now + RAMP_TIME);
        this.gainSaw.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        this.filter.frequency.exponentialRampToValueAtTime(8000, now + RAMP_TIME);
        this._currentYLabel = `Depth ${Math.round(invY * 100)}%`;
        break;
      }
      case 'octave': {
        // Map Y to octave shift: -2 (hand down) to +2 (hand up)
        this._octaveShift = Math.round(invY * 4 - 2); // -2 to +2
        this.gainSine.gain.linearRampToValueAtTime(1, now + RAMP_TIME);
        this.gainSaw.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        this.filter.frequency.exponentialRampToValueAtTime(8000, now + RAMP_TIME);
        this.lfoGain.gain.linearRampToValueAtTime(0, now + RAMP_TIME);
        const oct = this._octaveShift >= 0 ? `+${this._octaveShift}` : `${this._octaveShift}`;
        this._currentYLabel = `Oct ${oct}`;
        break;
      }
    }
  }

  /** Mute when no hand is detected */
  mute(): void {
    const now = this.engine.currentTime;
    this.outputGain.gain.linearRampToValueAtTime(0, now + 0.1);
  }

  get audioOn(): boolean { return this._audioOn; }
  set audioOn(v: boolean) {
    this._audioOn = v;
    if (!v) this.mute();
  }

  get scaleSnap(): boolean { return this._scaleSnap; }
  set scaleSnap(v: boolean) { this._scaleSnap = v; }

  get rootNote(): string { return this._rootNote; }
  set rootNote(v: string) { this._rootNote = v; }

  get scaleName(): string { return this._scaleName; }
  set scaleName(v: string) { this._scaleName = v; }

  get yMode(): YAxisMode { return this._yMode; }
  set yMode(v: YAxisMode) { this._yMode = v; }

  get rangeOffset(): number { return this._rangeOffset; }
  set rangeOffset(v: number) { this._rangeOffset = Math.max(-2, Math.min(4, v)); }

  get rangeLabel(): string {
    const lowMidi = 48 + this._rangeOffset * 12; // C3 = MIDI 48
    const highMidi = lowMidi + RANGE_OCTAVES * 12;
    return `${midiToNoteName(Math.round(lowMidi))}–${midiToNoteName(Math.round(highMidi))}`;
  }

  get currentFreq(): number { return this._currentFreq; }
  get currentYValue(): number { return this._currentYValue; }
  get currentYLabel(): string { return this._currentYLabel; }
  get currentYMode(): YAxisMode { return this._yMode; }

  destroy(): void {
    this.oscSine.stop();
    this.oscSaw.stop();
    this.lfo.stop();
    this.oscSine.disconnect();
    this.oscSaw.disconnect();
    this.gainSine.disconnect();
    this.gainSaw.disconnect();
    this.filter.disconnect();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.outputGain.disconnect();
  }
}
