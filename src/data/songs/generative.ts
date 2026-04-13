import * as Tone from 'tone';
import type { ConductorEngine } from '../../audio/ConductorEngine.ts';
import type { InstrumentGroup } from './types.ts';

/**
 * Generative mode: I-V-vi-IV chord progression in C major.
 * Each group plays patterns derived from the current chord.
 * Patterns vary every 4 bars.
 */

interface Chord {
  root: string;
  notes: string[];
  bass: string;
}

const PROGRESSION: Chord[] = [
  { root: 'C', notes: ['C4', 'E4', 'G4'], bass: 'C2' },   // I
  { root: 'G', notes: ['G3', 'B3', 'D4'], bass: 'G2' },   // V
  { root: 'A', notes: ['A3', 'C4', 'E4'], bass: 'A2' },   // vi
  { root: 'F', notes: ['F3', 'A3', 'C4'], bass: 'F2' },    // IV
];

const BEATS_PER_CHORD = 4;
const CHORDS_PER_CYCLE = 4;
const BARS_PER_VARIATION = 4;

export class GenerativeEngine {
  private engine: ConductorEngine;
  private running = false;
  private scheduledBars = 0;
  private variationSeed = 0;
  private bpm = 120;
  private scheduleInterval: ReturnType<typeof setInterval> | null = null;

  constructor(engine: ConductorEngine) {
    this.engine = engine;
  }

  async start(bpm = 120): Promise<void> {
    this.bpm = bpm;
    this.running = true;
    this.scheduledBars = 0;
    this.variationSeed = 0;

    await this.engine.startTransport(bpm);

    // Schedule initial bars
    this.scheduleAhead();

    // Keep scheduling ahead
    this.scheduleInterval = setInterval(() => {
      if (this.running) this.scheduleAhead();
    }, 2000);
  }

  stop(): void {
    this.running = false;
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
    this.engine.stop();
    this.scheduledBars = 0;
  }

  private scheduleAhead(): void {
    const beatDuration = 60 / this.bpm;
    const lookaheadBars = 8;
    const targetBar = Math.floor(Tone.getTransport().seconds / (beatDuration * BEATS_PER_CHORD * CHORDS_PER_CYCLE)) + lookaheadBars;

    while (this.scheduledBars < targetBar) {
      this.scheduleBar(this.scheduledBars);
      this.scheduledBars++;
    }
  }

  private scheduleBar(barIndex: number): void {
    const beatDuration = 60 / this.bpm;
    const barDuration = beatDuration * BEATS_PER_CHORD * CHORDS_PER_CYCLE;
    const barStart = barIndex * barDuration;

    // Vary patterns every BARS_PER_VARIATION bars
    if (barIndex % BARS_PER_VARIATION === 0) {
      this.variationSeed = Math.floor(Math.random() * 100);
    }

    for (let chordIdx = 0; chordIdx < CHORDS_PER_CYCLE; chordIdx++) {
      const chord = PROGRESSION[chordIdx];
      const chordStart = barStart + chordIdx * BEATS_PER_CHORD * beatDuration;

      this.scheduleStrings(chord, chordStart, beatDuration);
      this.scheduleWoodwinds(chord, chordStart, beatDuration);
      this.scheduleBrass(chord, chordStart, beatDuration);
      this.schedulePercussion(chordStart, beatDuration);
      this.scheduleBass(chord, chordStart, beatDuration);
    }
  }

  private scheduleStrings(chord: Chord, start: number, beatDur: number): void {
    const pattern = this.variationSeed % 3;

    if (pattern === 0) {
      // Arpeggiated
      for (let beat = 0; beat < BEATS_PER_CHORD; beat++) {
        const noteIdx = beat % chord.notes.length;
        this.engine.scheduleNote('strings', {
          time: start + beat * beatDur,
          note: chord.notes[noteIdx],
          duration: beatDur * 0.8,
          velocity: 0.5 + (beat === 0 ? 0.15 : 0),
        });
      }
    } else if (pattern === 1) {
      // Sustained chord
      for (const note of chord.notes) {
        this.engine.scheduleNote('strings', {
          time: start,
          note,
          duration: BEATS_PER_CHORD * beatDur * 0.9,
          velocity: 0.45,
        });
      }
    } else {
      // Rhythmic pulses
      for (let beat = 0; beat < BEATS_PER_CHORD; beat++) {
        for (const note of chord.notes) {
          this.engine.scheduleNote('strings', {
            time: start + beat * beatDur,
            note,
            duration: beatDur * 0.3,
            velocity: beat % 2 === 0 ? 0.5 : 0.3,
          });
        }
      }
    }
  }

  private scheduleWoodwinds(chord: Chord, start: number, beatDur: number): void {
    const pattern = (this.variationSeed + 1) % 3;

    if (pattern === 0) {
      // Melody line from chord tones, octave up
      const melody = chord.notes.map((n) => {
        const match = n.match(/^([A-G]#?b?)(\d)$/);
        if (!match) return n;
        return `${match[1]}${parseInt(match[2]) + 1}`;
      });
      this.engine.scheduleNote('woodwinds', {
        time: start,
        note: melody[0],
        duration: beatDur * 2,
        velocity: 0.4,
      });
      this.engine.scheduleNote('woodwinds', {
        time: start + beatDur * 2,
        note: melody[melody.length - 1],
        duration: beatDur * 1.5,
        velocity: 0.35,
      });
    } else if (pattern === 1) {
      // Descending line
      const reversed = [...chord.notes].reverse();
      reversed.forEach((note, i) => {
        const oct = note.match(/^([A-G]#?b?)(\d)$/);
        if (!oct) return;
        this.engine.scheduleNote('woodwinds', {
          time: start + i * beatDur,
          note: `${oct[1]}${parseInt(oct[2]) + 1}`,
          duration: beatDur * 0.7,
          velocity: 0.35,
        });
      });
    } else {
      // Rest (silence for this chord)
    }
  }

  private scheduleBrass(chord: Chord, start: number, beatDur: number): void {
    const pattern = (this.variationSeed + 2) % 4;

    if (pattern === 0) {
      // Whole note on root
      this.engine.scheduleNote('brass', {
        time: start,
        note: chord.notes[0],
        duration: BEATS_PER_CHORD * beatDur * 0.8,
        velocity: 0.35,
      });
    } else if (pattern === 1) {
      // Hit on beat 1 and 3
      this.engine.scheduleNote('brass', {
        time: start,
        note: chord.notes[0],
        duration: beatDur * 0.5,
        velocity: 0.4,
      });
      this.engine.scheduleNote('brass', {
        time: start + 2 * beatDur,
        note: chord.notes[2 % chord.notes.length],
        duration: beatDur * 0.5,
        velocity: 0.35,
      });
    } else {
      // Rest
    }
  }

  private schedulePercussion(start: number, beatDur: number): void {
    const pattern = (this.variationSeed + 3) % 3;

    if (pattern === 0) {
      // Four on the floor
      for (let beat = 0; beat < BEATS_PER_CHORD; beat++) {
        this.engine.scheduleNote('percussion', {
          time: start + beat * beatDur,
          note: 'C2',
          duration: 0.1,
          velocity: beat === 0 ? 0.6 : 0.35,
        });
      }
    } else if (pattern === 1) {
      // Beats 1 and 3
      this.engine.scheduleNote('percussion', {
        time: start,
        note: 'C2',
        duration: 0.1,
        velocity: 0.5,
      });
      this.engine.scheduleNote('percussion', {
        time: start + 2 * beatDur,
        note: 'C2',
        duration: 0.1,
        velocity: 0.4,
      });
    } else {
      // Beat 1 only
      this.engine.scheduleNote('percussion', {
        time: start,
        note: 'C2',
        duration: 0.15,
        velocity: 0.45,
      });
    }
  }

  private scheduleBass(chord: Chord, start: number, beatDur: number): void {
    const pattern = (this.variationSeed + 4) % 3;

    if (pattern === 0) {
      // Whole note
      this.engine.scheduleNote('bass', {
        time: start,
        note: chord.bass,
        duration: BEATS_PER_CHORD * beatDur * 0.9,
        velocity: 0.5,
      });
    } else if (pattern === 1) {
      // Walking: root, fifth, root, fifth
      const rootMatch = chord.bass.match(/^([A-G]#?b?)(\d)$/);
      if (rootMatch) {
        const oct = parseInt(rootMatch[2]);
        this.engine.scheduleNote('bass', {
          time: start,
          note: chord.bass,
          duration: beatDur * 0.8,
          velocity: 0.5,
        });
        this.engine.scheduleNote('bass', {
          time: start + beatDur,
          note: `${rootMatch[1]}${oct + 1}`,
          duration: beatDur * 0.8,
          velocity: 0.4,
        });
        this.engine.scheduleNote('bass', {
          time: start + 2 * beatDur,
          note: chord.bass,
          duration: beatDur * 0.8,
          velocity: 0.45,
        });
        this.engine.scheduleNote('bass', {
          time: start + 3 * beatDur,
          note: `${rootMatch[1]}${oct + 1}`,
          duration: beatDur * 0.8,
          velocity: 0.35,
        });
      }
    } else {
      // Half notes
      this.engine.scheduleNote('bass', {
        time: start,
        note: chord.bass,
        duration: beatDur * 1.8,
        velocity: 0.5,
      });
      this.engine.scheduleNote('bass', {
        time: start + 2 * beatDur,
        note: chord.bass,
        duration: beatDur * 1.8,
        velocity: 0.4,
      });
    }
  }

  get isRunning(): boolean {
    return this.running;
  }
}
