import type { SongData } from './types.ts';

/**
 * Beethoven Symphony No. 5, Opening
 * The iconic da-da-da-DUM motif, simplified arrangement.
 * ~60 seconds
 */
export const beethoven5: SongData = {
  name: 'Symphony No. 5',
  composer: 'Beethoven',
  defaultBpm: 108,
  groups: {
    strings: [
      // Opening motif: G-G-G-Eb (repeated)
      // First statement
      { time: 0.0, note: 'G4', duration: 0.15, velocity: 0.9 },
      { time: 0.25, note: 'G4', duration: 0.15, velocity: 0.9 },
      { time: 0.5, note: 'G4', duration: 0.15, velocity: 0.9 },
      { time: 0.75, note: 'Eb4', duration: 1.5, velocity: 1.0 },

      // Second statement (down a step): F-F-F-D
      { time: 2.8, note: 'F4', duration: 0.15, velocity: 0.85 },
      { time: 3.05, note: 'F4', duration: 0.15, velocity: 0.85 },
      { time: 3.3, note: 'F4', duration: 0.15, velocity: 0.85 },
      { time: 3.55, note: 'D4', duration: 1.5, velocity: 1.0 },

      // Development: descending motif fragments
      { time: 6.0, note: 'G4', duration: 0.15, velocity: 0.8 },
      { time: 6.2, note: 'G4', duration: 0.15, velocity: 0.8 },
      { time: 6.4, note: 'G4', duration: 0.15, velocity: 0.8 },
      { time: 6.6, note: 'Eb4', duration: 0.8, velocity: 0.9 },

      { time: 7.8, note: 'F4', duration: 0.15, velocity: 0.8 },
      { time: 8.0, note: 'F4', duration: 0.15, velocity: 0.8 },
      { time: 8.2, note: 'F4', duration: 0.15, velocity: 0.8 },
      { time: 8.4, note: 'D4', duration: 0.8, velocity: 0.9 },

      // Rising tension
      { time: 10.0, note: 'Eb4', duration: 0.15, velocity: 0.7 },
      { time: 10.2, note: 'F4', duration: 0.15, velocity: 0.75 },
      { time: 10.4, note: 'G4', duration: 0.15, velocity: 0.8 },
      { time: 10.6, note: 'Ab4', duration: 0.8, velocity: 0.85 },

      { time: 11.8, note: 'G4', duration: 0.15, velocity: 0.7 },
      { time: 12.0, note: 'Ab4', duration: 0.15, velocity: 0.75 },
      { time: 12.2, note: 'Bb4', duration: 0.15, velocity: 0.8 },
      { time: 12.4, note: 'C5', duration: 1.0, velocity: 0.9 },

      // Restatement of main motif, fuller
      { time: 14.5, note: 'G4', duration: 0.15, velocity: 0.95 },
      { time: 14.75, note: 'G4', duration: 0.15, velocity: 0.95 },
      { time: 15.0, note: 'G4', duration: 0.15, velocity: 0.95 },
      { time: 15.25, note: 'Eb4', duration: 2.0, velocity: 1.0 },

      { time: 17.8, note: 'F4', duration: 0.15, velocity: 0.9 },
      { time: 18.05, note: 'F4', duration: 0.15, velocity: 0.9 },
      { time: 18.3, note: 'F4', duration: 0.15, velocity: 0.9 },
      { time: 18.55, note: 'D4', duration: 2.0, velocity: 1.0 },

      // Continued development with countermelody
      { time: 22.0, note: 'Eb4', duration: 0.3, velocity: 0.7 },
      { time: 22.5, note: 'F4', duration: 0.3, velocity: 0.7 },
      { time: 23.0, note: 'G4', duration: 0.3, velocity: 0.75 },
      { time: 23.5, note: 'Ab4', duration: 0.3, velocity: 0.8 },
      { time: 24.0, note: 'Bb4', duration: 0.3, velocity: 0.85 },
      { time: 24.5, note: 'C5', duration: 0.8, velocity: 0.9 },

      // Sustained dramatic chord
      { time: 26.0, note: 'Eb4', duration: 2.0, velocity: 0.9 },
      { time: 26.0, note: 'G4', duration: 2.0, velocity: 0.85 },
      { time: 26.0, note: 'Bb4', duration: 2.0, velocity: 0.85 },

      // Another motif cycle
      { time: 29.0, note: 'Bb3', duration: 0.15, velocity: 0.9 },
      { time: 29.25, note: 'Bb3', duration: 0.15, velocity: 0.9 },
      { time: 29.5, note: 'Bb3', duration: 0.15, velocity: 0.9 },
      { time: 29.75, note: 'G3', duration: 1.5, velocity: 1.0 },

      { time: 32.0, note: 'Ab3', duration: 0.15, velocity: 0.85 },
      { time: 32.25, note: 'Ab3', duration: 0.15, velocity: 0.85 },
      { time: 32.5, note: 'Ab3', duration: 0.15, velocity: 0.85 },
      { time: 32.75, note: 'F3', duration: 1.5, velocity: 1.0 },

      // Building to climax
      { time: 35.0, note: 'G4', duration: 0.2, velocity: 0.85 },
      { time: 35.4, note: 'G4', duration: 0.2, velocity: 0.87 },
      { time: 35.8, note: 'G4', duration: 0.2, velocity: 0.9 },
      { time: 36.2, note: 'Ab4', duration: 0.2, velocity: 0.92 },
      { time: 36.6, note: 'Bb4', duration: 0.2, velocity: 0.95 },
      { time: 37.0, note: 'C5', duration: 0.2, velocity: 0.97 },
      { time: 37.4, note: 'Eb5', duration: 1.5, velocity: 1.0 },

      // Dramatic chords
      { time: 39.5, note: 'Eb4', duration: 1.0, velocity: 1.0 },
      { time: 39.5, note: 'G4', duration: 1.0, velocity: 0.95 },
      { time: 39.5, note: 'Bb4', duration: 1.0, velocity: 0.95 },
      { time: 39.5, note: 'Eb5', duration: 1.0, velocity: 0.9 },

      // Motif fragmentation
      { time: 41.5, note: 'G4', duration: 0.1, velocity: 0.8 },
      { time: 41.7, note: 'Eb4', duration: 0.6, velocity: 0.85 },
      { time: 42.8, note: 'F4', duration: 0.1, velocity: 0.8 },
      { time: 43.0, note: 'D4', duration: 0.6, velocity: 0.85 },

      // Quiet moment
      { time: 44.5, note: 'Eb4', duration: 0.5, velocity: 0.4 },
      { time: 45.2, note: 'D4', duration: 0.5, velocity: 0.35 },
      { time: 45.9, note: 'C4', duration: 0.5, velocity: 0.3 },

      // Final build
      { time: 47.5, note: 'G3', duration: 0.15, velocity: 0.9 },
      { time: 47.75, note: 'G3', duration: 0.15, velocity: 0.9 },
      { time: 48.0, note: 'G3', duration: 0.15, velocity: 0.9 },
      { time: 48.25, note: 'Eb3', duration: 1.0, velocity: 1.0 },

      { time: 50.0, note: 'G4', duration: 0.15, velocity: 1.0 },
      { time: 50.25, note: 'G4', duration: 0.15, velocity: 1.0 },
      { time: 50.5, note: 'G4', duration: 0.15, velocity: 1.0 },
      { time: 50.75, note: 'Eb4', duration: 2.5, velocity: 1.0 },

      // Closing chords
      { time: 54.0, note: 'Eb4', duration: 1.5, velocity: 1.0 },
      { time: 54.0, note: 'G4', duration: 1.5, velocity: 0.95 },
      { time: 54.0, note: 'Bb4', duration: 1.5, velocity: 0.95 },
      { time: 56.0, note: 'Eb3', duration: 2.0, velocity: 1.0 },
      { time: 56.0, note: 'Eb4', duration: 2.0, velocity: 0.95 },
      { time: 56.0, note: 'G4', duration: 2.0, velocity: 0.9 },
      { time: 56.0, note: 'Bb4', duration: 2.0, velocity: 0.9 },
    ],
    brass: [
      // Brass reinforces the motif on key statements
      { time: 0.75, note: 'Eb3', duration: 1.5, velocity: 0.7 },
      { time: 3.55, note: 'D3', duration: 1.5, velocity: 0.7 },

      // Horn calls in development
      { time: 12.4, note: 'C4', duration: 1.0, velocity: 0.6 },

      // Forte restatement
      { time: 15.25, note: 'Eb3', duration: 2.0, velocity: 0.85 },
      { time: 18.55, note: 'D3', duration: 2.0, velocity: 0.85 },

      // Dramatic support
      { time: 26.0, note: 'Eb3', duration: 2.0, velocity: 0.7 },
      { time: 29.75, note: 'G3', duration: 1.5, velocity: 0.75 },
      { time: 32.75, note: 'F3', duration: 1.5, velocity: 0.75 },

      // Climax brass
      { time: 37.4, note: 'Eb4', duration: 1.5, velocity: 0.9 },
      { time: 39.5, note: 'Bb3', duration: 1.0, velocity: 0.9 },

      // Final chords
      { time: 50.75, note: 'Eb3', duration: 2.5, velocity: 0.85 },
      { time: 54.0, note: 'Eb3', duration: 1.5, velocity: 0.9 },
      { time: 56.0, note: 'Bb2', duration: 2.0, velocity: 0.9 },
    ],
    woodwinds: [
      // Woodwinds echo fragments in the development
      { time: 6.6, note: 'Eb5', duration: 0.8, velocity: 0.5 },
      { time: 8.4, note: 'D5', duration: 0.8, velocity: 0.5 },

      // Lyrical countermelody
      { time: 22.0, note: 'G5', duration: 0.4, velocity: 0.5 },
      { time: 22.5, note: 'Ab5', duration: 0.4, velocity: 0.5 },
      { time: 23.0, note: 'Bb5', duration: 0.4, velocity: 0.55 },
      { time: 23.5, note: 'C6', duration: 0.6, velocity: 0.6 },
      { time: 24.5, note: 'Bb5', duration: 0.8, velocity: 0.55 },

      // Quiet woodwind passage
      { time: 44.5, note: 'G5', duration: 0.5, velocity: 0.35 },
      { time: 45.2, note: 'F5', duration: 0.5, velocity: 0.3 },
      { time: 45.9, note: 'Eb5', duration: 0.5, velocity: 0.25 },
    ],
    percussion: [
      // Timpani on key downbeats
      { time: 0.75, note: 'Eb2', duration: 0.3, velocity: 0.7 },
      { time: 3.55, note: 'D2', duration: 0.3, velocity: 0.7 },
      { time: 15.25, note: 'Eb2', duration: 0.4, velocity: 0.9 },
      { time: 18.55, note: 'D2', duration: 0.4, velocity: 0.9 },
      { time: 26.0, note: 'Eb2', duration: 0.5, velocity: 0.8 },
      { time: 29.75, note: 'G2', duration: 0.4, velocity: 0.8 },
      { time: 32.75, note: 'F2', duration: 0.4, velocity: 0.8 },
      { time: 37.4, note: 'Eb2', duration: 0.5, velocity: 1.0 },
      { time: 39.5, note: 'Eb2', duration: 0.5, velocity: 1.0 },
      { time: 50.75, note: 'Eb2', duration: 0.5, velocity: 1.0 },
      { time: 54.0, note: 'Eb2', duration: 0.5, velocity: 1.0 },
      { time: 56.0, note: 'Eb2', duration: 0.5, velocity: 1.0 },
    ],
    bass: [
      // Bass grounds the harmony
      { time: 0.75, note: 'Eb2', duration: 1.5, velocity: 0.7 },
      { time: 3.55, note: 'Bb1', duration: 1.5, velocity: 0.7 },
      { time: 6.6, note: 'C2', duration: 0.8, velocity: 0.6 },
      { time: 8.4, note: 'Bb1', duration: 0.8, velocity: 0.6 },
      { time: 10.6, note: 'Ab2', duration: 0.8, velocity: 0.6 },
      { time: 12.4, note: 'C2', duration: 1.0, velocity: 0.65 },
      { time: 15.25, note: 'Eb2', duration: 2.0, velocity: 0.8 },
      { time: 18.55, note: 'Bb1', duration: 2.0, velocity: 0.8 },
      { time: 26.0, note: 'Eb2', duration: 2.0, velocity: 0.75 },
      { time: 29.75, note: 'Eb2', duration: 1.5, velocity: 0.75 },
      { time: 32.75, note: 'Bb1', duration: 1.5, velocity: 0.75 },
      { time: 37.4, note: 'Eb2', duration: 1.5, velocity: 0.9 },
      { time: 39.5, note: 'Eb2', duration: 1.0, velocity: 0.9 },
      { time: 48.25, note: 'Eb2', duration: 1.0, velocity: 0.85 },
      { time: 50.75, note: 'Eb2', duration: 2.5, velocity: 0.9 },
      { time: 54.0, note: 'Eb2', duration: 1.5, velocity: 0.9 },
      { time: 56.0, note: 'Eb1', duration: 2.0, velocity: 1.0 },
    ],
  },
};
