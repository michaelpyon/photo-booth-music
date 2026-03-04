const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord templates as pitch class intervals from root
const CHORD_TEMPLATES: { name: string; intervals: number[] }[] = [
  { name: 'maj', intervals: [0, 4, 7] },
  { name: 'min', intervals: [0, 3, 7] },
  { name: '7', intervals: [0, 4, 7, 10] },
  { name: 'maj7', intervals: [0, 4, 7, 11] },
  { name: 'min7', intervals: [0, 3, 7, 10] },
  { name: 'dim', intervals: [0, 3, 6] },
  { name: 'aug', intervals: [0, 4, 8] },
  { name: 'sus4', intervals: [0, 5, 7] },
  { name: 'sus2', intervals: [0, 2, 7] },
];

export interface ChordResult {
  root: string;
  type: string;
  label: string; // e.g. "Cmaj", "Am7"
  confidence: number;
}

export function detectChord(chroma: Float32Array): ChordResult | null {
  let bestScore = -Infinity;
  let bestRoot = 0;
  let bestTemplate = CHORD_TEMPLATES[0];

  for (let root = 0; root < 12; root++) {
    for (const template of CHORD_TEMPLATES) {
      const score = matchTemplate(chroma, root, template.intervals);
      if (score > bestScore) {
        bestScore = score;
        bestRoot = root;
        bestTemplate = template;
      }
    }
  }

  // Minimum threshold — reject if no chord is strong enough
  if (bestScore < 0.3) return null;

  const rootName = NOTE_NAMES[bestRoot];
  const label =
    bestTemplate.name === 'maj'
      ? rootName
      : bestTemplate.name === 'min'
        ? `${rootName}m`
        : `${rootName}${bestTemplate.name}`;

  return {
    root: rootName,
    type: bestTemplate.name,
    label,
    confidence: Math.max(0, Math.min(1, bestScore)),
  };
}

function matchTemplate(chroma: Float32Array, root: number, intervals: number[]): number {
  // Sum chroma energy at chord tones vs non-chord tones
  let chordEnergy = 0;
  let totalEnergy = 0;
  const chordTones = new Set(intervals.map((i) => (root + i) % 12));

  for (let i = 0; i < 12; i++) {
    totalEnergy += chroma[i];
    if (chordTones.has(i)) {
      chordEnergy += chroma[i];
    }
  }

  if (totalEnergy === 0) return 0;

  // Ratio of energy in chord tones, weighted by how many notes
  const ratio = chordEnergy / totalEnergy;
  // Bonus for having energy in more chord tones
  let coverage = 0;
  for (const tone of chordTones) {
    if (chroma[tone] > 0.1) coverage++;
  }
  const coverageBonus = coverage / intervals.length;

  return ratio * 0.6 + coverageBonus * 0.4;
}
