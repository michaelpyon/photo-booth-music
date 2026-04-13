import type { SongData } from './types.ts';

/**
 * Dvorak - Symphony No. 9 "From the New World", 2nd Movement (Largo)
 * The "Going Home" melody. Gentle, lyrical woodwind line over sustained strings.
 * ~60 seconds
 */
export const newWorld: SongData = {
  name: 'New World Symphony (Largo)',
  composer: 'Dvorak',
  defaultBpm: 52,
  groups: {
    woodwinds: [
      // Main "Going Home" melody (English horn)
      // Phrase 1
      { time: 2.0, note: 'E4', duration: 1.2, velocity: 0.6 },
      { time: 3.5, note: 'G4', duration: 0.8, velocity: 0.55 },
      { time: 4.5, note: 'A4', duration: 0.8, velocity: 0.6 },
      { time: 5.5, note: 'G4', duration: 1.5, velocity: 0.55 },
      { time: 7.5, note: 'E4', duration: 1.2, velocity: 0.5 },
      { time: 9.0, note: 'D4', duration: 1.5, velocity: 0.5 },
      { time: 11.0, note: 'E4', duration: 2.0, velocity: 0.55 },

      // Phrase 2 (repeat with variation)
      { time: 14.0, note: 'E4', duration: 1.2, velocity: 0.6 },
      { time: 15.5, note: 'G4', duration: 0.8, velocity: 0.55 },
      { time: 16.5, note: 'A4', duration: 0.8, velocity: 0.6 },
      { time: 17.5, note: 'G4', duration: 1.5, velocity: 0.55 },
      { time: 19.5, note: 'E4', duration: 1.2, velocity: 0.5 },
      { time: 21.0, note: 'D4', duration: 0.8, velocity: 0.5 },
      { time: 22.0, note: 'C4', duration: 2.0, velocity: 0.5 },

      // B section: rising melody
      { time: 25.0, note: 'D4', duration: 1.0, velocity: 0.55 },
      { time: 26.5, note: 'E4', duration: 1.0, velocity: 0.6 },
      { time: 28.0, note: 'G4', duration: 1.0, velocity: 0.65 },
      { time: 29.5, note: 'A4', duration: 1.5, velocity: 0.7 },
      { time: 31.5, note: 'B4', duration: 1.5, velocity: 0.7 },
      { time: 33.5, note: 'A4', duration: 2.0, velocity: 0.65 },

      // Return of main theme
      { time: 37.0, note: 'E4', duration: 1.2, velocity: 0.6 },
      { time: 38.5, note: 'G4', duration: 0.8, velocity: 0.55 },
      { time: 39.5, note: 'A4', duration: 0.8, velocity: 0.6 },
      { time: 40.5, note: 'G4', duration: 1.5, velocity: 0.55 },
      { time: 42.5, note: 'E4', duration: 1.2, velocity: 0.5 },
      { time: 44.0, note: 'D4', duration: 1.5, velocity: 0.5 },
      { time: 46.0, note: 'C4', duration: 2.5, velocity: 0.5 },

      // Gentle coda
      { time: 50.0, note: 'E4', duration: 1.5, velocity: 0.4 },
      { time: 52.0, note: 'D4', duration: 1.5, velocity: 0.35 },
      { time: 54.0, note: 'C4', duration: 3.0, velocity: 0.3 },
    ],
    strings: [
      // Sustained harmonic backdrop
      // Db major chord bed
      { time: 0.0, note: 'C3', duration: 4.0, velocity: 0.3 },
      { time: 0.0, note: 'E3', duration: 4.0, velocity: 0.25 },
      { time: 0.0, note: 'G3', duration: 4.0, velocity: 0.25 },

      // Under phrase 1
      { time: 4.5, note: 'A3', duration: 3.0, velocity: 0.3 },
      { time: 4.5, note: 'C4', duration: 3.0, velocity: 0.25 },
      { time: 7.5, note: 'E3', duration: 3.5, velocity: 0.3 },
      { time: 7.5, note: 'G3', duration: 3.5, velocity: 0.25 },
      { time: 11.0, note: 'C3', duration: 3.0, velocity: 0.3 },
      { time: 11.0, note: 'E3', duration: 3.0, velocity: 0.25 },

      // Under phrase 2
      { time: 14.0, note: 'C3', duration: 3.5, velocity: 0.3 },
      { time: 14.0, note: 'E3', duration: 3.5, velocity: 0.25 },
      { time: 17.5, note: 'C3', duration: 4.0, velocity: 0.3 },
      { time: 17.5, note: 'G3', duration: 4.0, velocity: 0.25 },
      { time: 22.0, note: 'C3', duration: 3.0, velocity: 0.3 },
      { time: 22.0, note: 'E3', duration: 3.0, velocity: 0.25 },

      // B section: fuller strings
      { time: 25.0, note: 'G3', duration: 3.0, velocity: 0.35 },
      { time: 25.0, note: 'B3', duration: 3.0, velocity: 0.3 },
      { time: 25.0, note: 'D4', duration: 3.0, velocity: 0.3 },
      { time: 28.0, note: 'C3', duration: 3.0, velocity: 0.35 },
      { time: 28.0, note: 'E3', duration: 3.0, velocity: 0.3 },
      { time: 28.0, note: 'G3', duration: 3.0, velocity: 0.3 },
      { time: 31.5, note: 'E3', duration: 4.0, velocity: 0.35 },
      { time: 31.5, note: 'G3', duration: 4.0, velocity: 0.3 },
      { time: 31.5, note: 'B3', duration: 4.0, velocity: 0.3 },

      // Return of main theme
      { time: 37.0, note: 'C3', duration: 3.5, velocity: 0.3 },
      { time: 37.0, note: 'E3', duration: 3.5, velocity: 0.25 },
      { time: 40.5, note: 'C3', duration: 4.0, velocity: 0.3 },
      { time: 40.5, note: 'G3', duration: 4.0, velocity: 0.25 },
      { time: 44.0, note: 'G3', duration: 2.0, velocity: 0.3 },
      { time: 44.0, note: 'B3', duration: 2.0, velocity: 0.25 },
      { time: 46.0, note: 'C3', duration: 4.0, velocity: 0.3 },
      { time: 46.0, note: 'E3', duration: 4.0, velocity: 0.25 },

      // Coda: fading chords
      { time: 50.0, note: 'C3', duration: 3.0, velocity: 0.25 },
      { time: 50.0, note: 'E3', duration: 3.0, velocity: 0.2 },
      { time: 54.0, note: 'C3', duration: 4.0, velocity: 0.2 },
      { time: 54.0, note: 'E3', duration: 4.0, velocity: 0.15 },
      { time: 54.0, note: 'G3', duration: 4.0, velocity: 0.15 },
    ],
    brass: [
      // Sparse horn calls
      { time: 0.0, note: 'C3', duration: 2.0, velocity: 0.25 },
      { time: 25.0, note: 'G3', duration: 2.0, velocity: 0.35 },
      { time: 28.0, note: 'C3', duration: 2.0, velocity: 0.35 },
      { time: 33.5, note: 'E3', duration: 2.5, velocity: 0.3 },
      { time: 54.0, note: 'C3', duration: 4.0, velocity: 0.2 },
    ],
    percussion: [
      // Very sparse timpani, just a few accent points
      { time: 0.0, note: 'C2', duration: 0.5, velocity: 0.25 },
      { time: 25.0, note: 'G2', duration: 0.5, velocity: 0.3 },
      { time: 37.0, note: 'C2', duration: 0.5, velocity: 0.25 },
      { time: 54.0, note: 'C2', duration: 0.5, velocity: 0.2 },
    ],
    bass: [
      // Slow-moving bass line
      { time: 0.0, note: 'C2', duration: 4.0, velocity: 0.35 },
      { time: 4.5, note: 'A2', duration: 3.0, velocity: 0.3 },
      { time: 7.5, note: 'E2', duration: 3.5, velocity: 0.3 },
      { time: 11.0, note: 'C2', duration: 3.0, velocity: 0.3 },
      { time: 14.0, note: 'C2', duration: 3.5, velocity: 0.3 },
      { time: 17.5, note: 'C2', duration: 4.0, velocity: 0.3 },
      { time: 22.0, note: 'C2', duration: 3.0, velocity: 0.3 },
      { time: 25.0, note: 'G2', duration: 3.0, velocity: 0.35 },
      { time: 28.0, note: 'C2', duration: 3.0, velocity: 0.35 },
      { time: 31.5, note: 'E2', duration: 4.0, velocity: 0.35 },
      { time: 37.0, note: 'C2', duration: 3.5, velocity: 0.3 },
      { time: 40.5, note: 'C2', duration: 3.5, velocity: 0.3 },
      { time: 44.0, note: 'G2', duration: 2.0, velocity: 0.3 },
      { time: 46.0, note: 'C2', duration: 4.0, velocity: 0.3 },
      { time: 50.0, note: 'C2', duration: 3.0, velocity: 0.25 },
      { time: 54.0, note: 'C2', duration: 4.0, velocity: 0.2 },
    ],
  },
};
