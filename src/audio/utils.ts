const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4 = 440;
const A4_MIDI = 69;

// Scale definitions as semitone intervals from root
export const SCALES: Record<string, number[]> = {
  'Chromatic':   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'Major':       [0, 2, 4, 5, 7, 9, 11],
  'Minor':       [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic':  [0, 2, 4, 7, 9],
  'Min Penta':   [0, 3, 5, 7, 10],
  'Blues':        [0, 3, 5, 6, 7, 10],
  'Dorian':      [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian':  [0, 2, 4, 5, 7, 9, 10],
};

export const SCALE_NAMES = Object.keys(SCALES);

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToMidi(freq: number): number {
  return 12 * Math.log2(freq / A4) + A4_MIDI;
}

export function midiToFrequency(midi: number): number {
  return A4 * Math.pow(2, (midi - A4_MIDI) / 12);
}

export function snapToSemitone(freq: number): number {
  const midi = Math.round(frequencyToMidi(freq));
  return midiToFrequency(midi);
}

/** Snap frequency to the nearest note in a given key/scale */
export function snapToScale(freq: number, rootName: string, scaleName: string): number {
  const rootIndex = ROOT_NOTES.indexOf(rootName);
  if (rootIndex < 0) return snapToSemitone(freq);

  const scaleIntervals = SCALES[scaleName];
  if (!scaleIntervals) return snapToSemitone(freq);

  const midi = frequencyToMidi(freq);
  const octave = Math.floor(midi / 12);

  // Find the nearest scale degree across the current and adjacent octaves
  let bestMidi = Math.round(midi);
  let bestDist = Infinity;

  for (let oct = octave - 1; oct <= octave + 1; oct++) {
    for (const interval of scaleIntervals) {
      const candidate = oct * 12 + rootIndex + interval;
      const dist = Math.abs(midi - candidate);
      if (dist < bestDist) {
        bestDist = dist;
        bestMidi = candidate;
      }
    }
  }

  return midiToFrequency(bestMidi);
}

export function frequencyToNoteName(freq: number): string {
  const midi = Math.round(frequencyToMidi(freq));
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

/** Exponential mapping from normalized 0-1 to a frequency range */
export function normalizedToFrequency(x: number, minFreq: number, maxFreq: number): number {
  return minFreq * Math.pow(maxFreq / minFreq, Math.max(0, Math.min(1, x)));
}
