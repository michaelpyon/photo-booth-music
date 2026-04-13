import type { SongData } from './types.ts';

/**
 * Grieg - In the Hall of the Mountain King (from Peer Gynt)
 * Creeping pizzicato melody that accelerates and builds.
 * Starts slow, ends frantic. The tempo should accelerate during performance.
 * ~60 seconds
 */
export const mountainKing: SongData = {
  name: 'Hall of the Mountain King',
  composer: 'Grieg',
  defaultBpm: 80,
  groups: {
    strings: [
      // Main theme: creeping melody in A minor / B minor feel
      // Round 1: pianissimo, slow
      { time: 0.0, note: 'A3', duration: 0.35, velocity: 0.35 },
      { time: 0.5, note: 'B3', duration: 0.35, velocity: 0.35 },
      { time: 1.0, note: 'C4', duration: 0.35, velocity: 0.35 },
      { time: 1.5, note: 'D4', duration: 0.35, velocity: 0.35 },
      { time: 2.0, note: 'E4', duration: 0.35, velocity: 0.35 },
      { time: 2.5, note: 'C4', duration: 0.35, velocity: 0.35 },
      { time: 3.0, note: 'E4', duration: 0.7, velocity: 0.4 },

      { time: 4.0, note: 'Eb4', duration: 0.35, velocity: 0.35 },
      { time: 4.5, note: 'C4', duration: 0.35, velocity: 0.35 },
      { time: 5.0, note: 'Eb4', duration: 0.7, velocity: 0.4 },

      { time: 6.0, note: 'D4', duration: 0.35, velocity: 0.35 },
      { time: 6.5, note: 'B3', duration: 0.35, velocity: 0.35 },
      { time: 7.0, note: 'D4', duration: 0.7, velocity: 0.4 },

      // Round 2: slightly louder
      { time: 8.0, note: 'A3', duration: 0.35, velocity: 0.45 },
      { time: 8.5, note: 'B3', duration: 0.35, velocity: 0.45 },
      { time: 9.0, note: 'C4', duration: 0.35, velocity: 0.45 },
      { time: 9.5, note: 'D4', duration: 0.35, velocity: 0.45 },
      { time: 10.0, note: 'E4', duration: 0.35, velocity: 0.45 },
      { time: 10.5, note: 'C4', duration: 0.35, velocity: 0.45 },
      { time: 11.0, note: 'E4', duration: 0.7, velocity: 0.5 },

      { time: 12.0, note: 'Eb4', duration: 0.35, velocity: 0.45 },
      { time: 12.5, note: 'C4', duration: 0.35, velocity: 0.45 },
      { time: 13.0, note: 'Eb4', duration: 0.7, velocity: 0.5 },

      { time: 14.0, note: 'D4', duration: 0.35, velocity: 0.45 },
      { time: 14.5, note: 'B3', duration: 0.35, velocity: 0.45 },
      { time: 15.0, note: 'D4', duration: 0.7, velocity: 0.5 },

      // Round 3: louder, building
      { time: 16.0, note: 'A3', duration: 0.3, velocity: 0.6 },
      { time: 16.4, note: 'B3', duration: 0.3, velocity: 0.6 },
      { time: 16.8, note: 'C4', duration: 0.3, velocity: 0.6 },
      { time: 17.2, note: 'D4', duration: 0.3, velocity: 0.6 },
      { time: 17.6, note: 'E4', duration: 0.3, velocity: 0.6 },
      { time: 18.0, note: 'C4', duration: 0.3, velocity: 0.6 },
      { time: 18.4, note: 'E4', duration: 0.6, velocity: 0.65 },

      { time: 19.2, note: 'Eb4', duration: 0.3, velocity: 0.6 },
      { time: 19.6, note: 'C4', duration: 0.3, velocity: 0.6 },
      { time: 20.0, note: 'Eb4', duration: 0.6, velocity: 0.65 },

      { time: 20.8, note: 'D4', duration: 0.3, velocity: 0.6 },
      { time: 21.2, note: 'B3', duration: 0.3, velocity: 0.6 },
      { time: 21.6, note: 'D4', duration: 0.6, velocity: 0.65 },

      // Round 4: forte, faster
      { time: 23.0, note: 'A3', duration: 0.25, velocity: 0.75 },
      { time: 23.3, note: 'B3', duration: 0.25, velocity: 0.75 },
      { time: 23.6, note: 'C4', duration: 0.25, velocity: 0.75 },
      { time: 23.9, note: 'D4', duration: 0.25, velocity: 0.75 },
      { time: 24.2, note: 'E4', duration: 0.25, velocity: 0.75 },
      { time: 24.5, note: 'C4', duration: 0.25, velocity: 0.75 },
      { time: 24.8, note: 'E4', duration: 0.5, velocity: 0.8 },

      { time: 25.5, note: 'Eb4', duration: 0.25, velocity: 0.75 },
      { time: 25.8, note: 'C4', duration: 0.25, velocity: 0.75 },
      { time: 26.1, note: 'Eb4', duration: 0.5, velocity: 0.8 },

      { time: 26.8, note: 'D4', duration: 0.25, velocity: 0.75 },
      { time: 27.1, note: 'B3', duration: 0.25, velocity: 0.75 },
      { time: 27.4, note: 'D4', duration: 0.5, velocity: 0.8 },

      // Round 5: fortissimo, octave higher
      { time: 29.0, note: 'A4', duration: 0.2, velocity: 0.9 },
      { time: 29.25, note: 'B4', duration: 0.2, velocity: 0.9 },
      { time: 29.5, note: 'C5', duration: 0.2, velocity: 0.9 },
      { time: 29.75, note: 'D5', duration: 0.2, velocity: 0.9 },
      { time: 30.0, note: 'E5', duration: 0.2, velocity: 0.9 },
      { time: 30.25, note: 'C5', duration: 0.2, velocity: 0.9 },
      { time: 30.5, note: 'E5', duration: 0.4, velocity: 0.95 },

      { time: 31.1, note: 'Eb5', duration: 0.2, velocity: 0.9 },
      { time: 31.35, note: 'C5', duration: 0.2, velocity: 0.9 },
      { time: 31.6, note: 'Eb5', duration: 0.4, velocity: 0.95 },

      { time: 32.2, note: 'D5', duration: 0.2, velocity: 0.9 },
      { time: 32.45, note: 'B4', duration: 0.2, velocity: 0.9 },
      { time: 32.7, note: 'D5', duration: 0.4, velocity: 0.95 },

      // Frantic final round
      { time: 34.0, note: 'A4', duration: 0.15, velocity: 1.0 },
      { time: 34.2, note: 'B4', duration: 0.15, velocity: 1.0 },
      { time: 34.4, note: 'C5', duration: 0.15, velocity: 1.0 },
      { time: 34.6, note: 'D5', duration: 0.15, velocity: 1.0 },
      { time: 34.8, note: 'E5', duration: 0.15, velocity: 1.0 },
      { time: 35.0, note: 'C5', duration: 0.15, velocity: 1.0 },
      { time: 35.2, note: 'E5', duration: 0.3, velocity: 1.0 },

      { time: 35.7, note: 'Eb5', duration: 0.15, velocity: 1.0 },
      { time: 35.9, note: 'C5', duration: 0.15, velocity: 1.0 },
      { time: 36.1, note: 'Eb5', duration: 0.3, velocity: 1.0 },

      { time: 36.6, note: 'D5', duration: 0.15, velocity: 1.0 },
      { time: 36.8, note: 'B4', duration: 0.15, velocity: 1.0 },
      { time: 37.0, note: 'D5', duration: 0.3, velocity: 1.0 },

      // Crashing final chords
      { time: 38.0, note: 'A3', duration: 0.5, velocity: 1.0 },
      { time: 38.0, note: 'C4', duration: 0.5, velocity: 1.0 },
      { time: 38.0, note: 'E4', duration: 0.5, velocity: 1.0 },
      { time: 38.0, note: 'A4', duration: 0.5, velocity: 1.0 },

      { time: 39.0, note: 'A3', duration: 1.5, velocity: 1.0 },
      { time: 39.0, note: 'C4', duration: 1.5, velocity: 1.0 },
      { time: 39.0, note: 'E4', duration: 1.5, velocity: 1.0 },
      { time: 39.0, note: 'A4', duration: 1.5, velocity: 1.0 },
    ],
    bass: [
      // Stalking bass ostinato
      // Rounds 1-2: simple bass
      { time: 0.0, note: 'A2', duration: 0.4, velocity: 0.4 },
      { time: 2.0, note: 'A2', duration: 0.4, velocity: 0.4 },
      { time: 4.0, note: 'C3', duration: 0.4, velocity: 0.4 },
      { time: 6.0, note: 'B2', duration: 0.4, velocity: 0.4 },
      { time: 8.0, note: 'A2', duration: 0.4, velocity: 0.5 },
      { time: 10.0, note: 'A2', duration: 0.4, velocity: 0.5 },
      { time: 12.0, note: 'C3', duration: 0.4, velocity: 0.5 },
      { time: 14.0, note: 'B2', duration: 0.4, velocity: 0.5 },

      // Rounds 3-4: more frequent
      { time: 16.0, note: 'A2', duration: 0.3, velocity: 0.6 },
      { time: 17.0, note: 'A2', duration: 0.3, velocity: 0.6 },
      { time: 18.4, note: 'A2', duration: 0.3, velocity: 0.6 },
      { time: 19.2, note: 'C3', duration: 0.3, velocity: 0.6 },
      { time: 20.0, note: 'C3', duration: 0.3, velocity: 0.6 },
      { time: 20.8, note: 'B2', duration: 0.3, velocity: 0.6 },
      { time: 21.6, note: 'B2', duration: 0.3, velocity: 0.6 },

      { time: 23.0, note: 'A2', duration: 0.25, velocity: 0.75 },
      { time: 23.8, note: 'A2', duration: 0.25, velocity: 0.75 },
      { time: 24.8, note: 'A2', duration: 0.25, velocity: 0.75 },
      { time: 25.5, note: 'C3', duration: 0.25, velocity: 0.75 },
      { time: 26.1, note: 'C3', duration: 0.25, velocity: 0.75 },
      { time: 26.8, note: 'B2', duration: 0.25, velocity: 0.75 },
      { time: 27.4, note: 'B2', duration: 0.25, velocity: 0.75 },

      // Round 5+: pounding
      { time: 29.0, note: 'A2', duration: 0.2, velocity: 0.9 },
      { time: 29.5, note: 'A2', duration: 0.2, velocity: 0.9 },
      { time: 30.0, note: 'A2', duration: 0.2, velocity: 0.9 },
      { time: 30.5, note: 'A2', duration: 0.2, velocity: 0.9 },
      { time: 31.1, note: 'C3', duration: 0.2, velocity: 0.9 },
      { time: 31.6, note: 'C3', duration: 0.2, velocity: 0.9 },
      { time: 32.2, note: 'B2', duration: 0.2, velocity: 0.9 },
      { time: 32.7, note: 'B2', duration: 0.2, velocity: 0.9 },

      { time: 34.0, note: 'A2', duration: 0.15, velocity: 1.0 },
      { time: 34.4, note: 'A2', duration: 0.15, velocity: 1.0 },
      { time: 34.8, note: 'A2', duration: 0.15, velocity: 1.0 },
      { time: 35.2, note: 'A2', duration: 0.15, velocity: 1.0 },
      { time: 35.7, note: 'C3', duration: 0.15, velocity: 1.0 },
      { time: 36.1, note: 'C3', duration: 0.15, velocity: 1.0 },
      { time: 36.6, note: 'B2', duration: 0.15, velocity: 1.0 },
      { time: 37.0, note: 'B2', duration: 0.15, velocity: 1.0 },

      // Final
      { time: 38.0, note: 'A2', duration: 0.5, velocity: 1.0 },
      { time: 39.0, note: 'A1', duration: 1.5, velocity: 1.0 },
    ],
    woodwinds: [
      // Woodwinds join in round 3 with echo of melody
      { time: 16.4, note: 'A4', duration: 0.3, velocity: 0.4 },
      { time: 16.8, note: 'B4', duration: 0.3, velocity: 0.4 },
      { time: 17.2, note: 'C5', duration: 0.3, velocity: 0.4 },
      { time: 17.6, note: 'D5', duration: 0.3, velocity: 0.4 },
      { time: 18.0, note: 'E5', duration: 0.3, velocity: 0.45 },
      { time: 18.4, note: 'C5', duration: 0.3, velocity: 0.45 },

      // Round 4
      { time: 23.0, note: 'A4', duration: 0.25, velocity: 0.55 },
      { time: 23.6, note: 'C5', duration: 0.25, velocity: 0.55 },
      { time: 24.2, note: 'E5', duration: 0.25, velocity: 0.6 },
      { time: 24.8, note: 'E5', duration: 0.4, velocity: 0.6 },
    ],
    brass: [
      // Brass enters in the loud sections
      { time: 29.0, note: 'A3', duration: 0.4, velocity: 0.7 },
      { time: 30.5, note: 'A3', duration: 0.4, velocity: 0.7 },
      { time: 31.6, note: 'C4', duration: 0.4, velocity: 0.7 },
      { time: 32.7, note: 'B3', duration: 0.4, velocity: 0.7 },

      // Fortissimo
      { time: 34.0, note: 'A3', duration: 0.3, velocity: 0.85 },
      { time: 35.2, note: 'A3', duration: 0.3, velocity: 0.85 },
      { time: 36.1, note: 'C4', duration: 0.3, velocity: 0.85 },
      { time: 37.0, note: 'B3', duration: 0.3, velocity: 0.85 },

      // Final
      { time: 38.0, note: 'A3', duration: 0.5, velocity: 1.0 },
      { time: 39.0, note: 'A3', duration: 1.5, velocity: 1.0 },
    ],
    percussion: [
      // Timpani pulses, increasingly frequent
      // Sparse early
      { time: 4.0, note: 'A2', duration: 0.2, velocity: 0.3 },
      { time: 8.0, note: 'A2', duration: 0.2, velocity: 0.35 },
      { time: 12.0, note: 'A2', duration: 0.2, velocity: 0.4 },

      // More frequent
      { time: 16.0, note: 'A2', duration: 0.2, velocity: 0.5 },
      { time: 18.4, note: 'A2', duration: 0.2, velocity: 0.5 },
      { time: 20.8, note: 'A2', duration: 0.2, velocity: 0.5 },

      { time: 23.0, note: 'A2', duration: 0.2, velocity: 0.6 },
      { time: 24.8, note: 'A2', duration: 0.2, velocity: 0.65 },
      { time: 26.1, note: 'A2', duration: 0.2, velocity: 0.7 },
      { time: 27.4, note: 'A2', duration: 0.2, velocity: 0.7 },

      // Pounding
      { time: 29.0, note: 'A2', duration: 0.2, velocity: 0.8 },
      { time: 30.0, note: 'A2', duration: 0.2, velocity: 0.8 },
      { time: 31.1, note: 'A2', duration: 0.2, velocity: 0.85 },
      { time: 32.2, note: 'A2', duration: 0.2, velocity: 0.85 },

      { time: 34.0, note: 'A2', duration: 0.15, velocity: 0.95 },
      { time: 34.8, note: 'A2', duration: 0.15, velocity: 0.95 },
      { time: 35.7, note: 'A2', duration: 0.15, velocity: 0.95 },
      { time: 36.6, note: 'A2', duration: 0.15, velocity: 0.95 },

      // Final crashes
      { time: 38.0, note: 'A2', duration: 0.4, velocity: 1.0 },
      { time: 39.0, note: 'A2', duration: 0.5, velocity: 1.0 },
    ],
  },
};
