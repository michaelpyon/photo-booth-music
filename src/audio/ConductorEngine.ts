import * as Tone from 'tone';
import type { SongData, InstrumentGroup, NoteEvent } from '../data/songs/types.ts';
import { ALL_GROUPS } from '../data/songs/types.ts';

type ToneSynth = Tone.PolySynth | Tone.MonoSynth | Tone.MembraneSynth;

export class ConductorEngine {
  private synths: Map<InstrumentGroup, ToneSynth> = new Map();
  private gains: Map<InstrumentGroup, Tone.Gain> = new Map();
  private masterGain: Tone.Gain;
  private scheduledIds: number[] = [];
  private _playing = false;
  private _currentSong: SongData | null = null;

  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.createSynths();
  }

  private createSynths(): void {
    // Strings: PolySynth for chords
    const stringsGain = new Tone.Gain(0.8).connect(this.masterGain);
    const strings = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 8,
      voice: Tone.Synth,
      options: {
        oscillator: { type: 'fatsawtooth', spread: 20, count: 3 },
        envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.0 },
        volume: -8,
      },
    }).connect(stringsGain);
    this.synths.set('strings', strings);
    this.gains.set('strings', stringsGain);

    // Woodwinds: MonoSynth (soft, breathy)
    const woodwindsGain = new Tone.Gain(0.7).connect(this.masterGain);
    const woodwinds = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      filter: { Q: 2, type: 'lowpass', rolloff: -12 },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.7, release: 0.8 },
      filterEnvelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8,
        baseFrequency: 300,
        octaves: 3,
      },
      volume: -6,
    }).connect(woodwindsGain);
    this.synths.set('woodwinds', woodwinds);
    this.gains.set('woodwinds', woodwindsGain);

    // Brass: MonoSynth (bright, punchy)
    const brassGain = new Tone.Gain(0.6).connect(this.masterGain);
    const brass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { Q: 1, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.5 },
      filterEnvelope: {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.4,
        release: 0.5,
        baseFrequency: 400,
        octaves: 2,
      },
      volume: -10,
    }).connect(brassGain);
    this.synths.set('brass', brass);
    this.gains.set('brass', brassGain);

    // Percussion: MembraneSynth
    const percGain = new Tone.Gain(0.5).connect(this.masterGain);
    const percussion = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 },
      volume: -8,
    }).connect(percGain);
    this.synths.set('percussion', percussion);
    this.gains.set('percussion', percGain);

    // Bass: MonoSynth (deep, warm)
    const bassGain = new Tone.Gain(0.7).connect(this.masterGain);
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { Q: 1, type: 'lowpass', rolloff: -12 },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.5 },
      filterEnvelope: {
        attack: 0.05,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5,
        baseFrequency: 100,
        octaves: 2,
      },
      volume: -6,
    }).connect(bassGain);
    this.synths.set('bass', bass);
    this.gains.set('bass', bassGain);
  }

  async play(song: SongData): Promise<void> {
    await Tone.start();
    this.stop();
    this._currentSong = song;

    Tone.getTransport().bpm.value = song.defaultBpm;

    // Schedule all note events per group
    for (const group of ALL_GROUPS) {
      const notes = song.groups[group];
      const synth = this.synths.get(group)!;
      for (const evt of notes) {
        const id = Tone.getTransport().schedule((time) => {
          this.triggerNote(synth, evt, time);
        }, evt.time);
        this.scheduledIds.push(id);
      }
    }

    Tone.getTransport().start();
    this._playing = true;
  }

  private triggerNote(synth: ToneSynth, evt: NoteEvent, time: number): void {
    if (synth instanceof Tone.PolySynth) {
      synth.triggerAttackRelease(evt.note, evt.duration, time, evt.velocity);
    } else if (synth instanceof Tone.MembraneSynth) {
      synth.triggerAttackRelease(evt.note, evt.duration, time, evt.velocity);
    } else {
      // MonoSynth
      (synth as Tone.MonoSynth).triggerAttackRelease(evt.note, evt.duration, time, evt.velocity);
    }
  }

  pause(): void {
    if (this._playing) {
      Tone.getTransport().pause();
      this._playing = false;
    }
  }

  resume(): void {
    if (!this._playing && this._currentSong) {
      Tone.getTransport().start();
      this._playing = true;
    }
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    this.scheduledIds = [];
    this._playing = false;
  }

  setTempo(bpm: number): void {
    const clamped = Math.max(40, Math.min(240, bpm));
    Tone.getTransport().bpm.value = clamped;
  }

  getTempo(): number {
    return Tone.getTransport().bpm.value;
  }

  setGroupVolume(group: InstrumentGroup, vol: number): void {
    const gain = this.gains.get(group);
    if (gain) {
      gain.gain.rampTo(Math.max(0, Math.min(1, vol)), 0.1);
    }
  }

  muteGroup(group: InstrumentGroup): void {
    this.setGroupVolume(group, 0);
  }

  unmuteGroup(group: InstrumentGroup): void {
    this.setGroupVolume(group, 0.7);
  }

  setMasterVolume(vol: number): void {
    this.masterGain.gain.rampTo(Math.max(0, Math.min(1, vol)), 0.05);
  }

  getPosition(): number {
    return Tone.getTransport().seconds;
  }

  get playing(): boolean {
    return this._playing;
  }

  get currentSong(): SongData | null {
    return this._currentSong;
  }

  /** Schedule a single note for generative mode (played at a specific Transport time) */
  scheduleNote(group: InstrumentGroup, evt: NoteEvent): void {
    const synth = this.synths.get(group)!;
    const id = Tone.getTransport().schedule((time) => {
      this.triggerNote(synth, evt, time);
    }, evt.time);
    this.scheduledIds.push(id);
  }

  /** Start transport without loading a song (for generative mode) */
  async startTransport(bpm: number): Promise<void> {
    await Tone.start();
    this.stop();
    Tone.getTransport().bpm.value = bpm;
    Tone.getTransport().start();
    this._playing = true;
  }

  destroy(): void {
    this.stop();
    for (const synth of this.synths.values()) {
      synth.dispose();
    }
    for (const gain of this.gains.values()) {
      gain.dispose();
    }
    this.masterGain.dispose();
    this.synths.clear();
    this.gains.clear();
  }
}
