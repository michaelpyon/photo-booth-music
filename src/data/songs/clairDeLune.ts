import type { SongData } from './types.ts';

/**
 * Debussy - Clair de Lune
 * Gentle arpeggio patterns, dreamlike and flowing.
 * ~60 seconds
 */
export const clairDeLune: SongData = {
  name: 'Clair de Lune',
  composer: 'Debussy',
  defaultBpm: 66,
  groups: {
    strings: [
      // Gentle arpeggiated chords, piano-like
      // Opening Db major arpeggios
      { time: 0.0, note: 'Db4', duration: 1.0, velocity: 0.3 },
      { time: 0.5, note: 'F4', duration: 1.0, velocity: 0.25 },
      { time: 1.0, note: 'Ab4', duration: 1.0, velocity: 0.25 },
      { time: 1.5, note: 'Db5', duration: 1.5, velocity: 0.3 },

      { time: 3.5, note: 'Db4', duration: 1.0, velocity: 0.3 },
      { time: 4.0, note: 'F4', duration: 1.0, velocity: 0.25 },
      { time: 4.5, note: 'Ab4', duration: 1.0, velocity: 0.25 },
      { time: 5.0, note: 'F5', duration: 1.5, velocity: 0.3 },

      // Bbm arpeggio
      { time: 7.0, note: 'Bb3', duration: 1.0, velocity: 0.3 },
      { time: 7.5, note: 'Db4', duration: 1.0, velocity: 0.25 },
      { time: 8.0, note: 'F4', duration: 1.0, velocity: 0.25 },
      { time: 8.5, note: 'Bb4', duration: 1.5, velocity: 0.3 },

      // Ebm arpeggio
      { time: 10.5, note: 'Eb4', duration: 1.0, velocity: 0.3 },
      { time: 11.0, note: 'Gb4', duration: 1.0, velocity: 0.25 },
      { time: 11.5, note: 'Bb4', duration: 1.0, velocity: 0.25 },
      { time: 12.0, note: 'Eb5', duration: 1.5, velocity: 0.35 },

      // Ab7 arpeggio (dominant)
      { time: 14.0, note: 'Ab3', duration: 1.0, velocity: 0.3 },
      { time: 14.5, note: 'C4', duration: 1.0, velocity: 0.25 },
      { time: 15.0, note: 'Eb4', duration: 1.0, velocity: 0.25 },
      { time: 15.5, note: 'Gb4', duration: 1.5, velocity: 0.3 },

      // Return to Db major
      { time: 17.5, note: 'Db4', duration: 1.0, velocity: 0.35 },
      { time: 18.0, note: 'F4', duration: 1.0, velocity: 0.3 },
      { time: 18.5, note: 'Ab4', duration: 1.0, velocity: 0.3 },
      { time: 19.0, note: 'Db5', duration: 2.0, velocity: 0.35 },

      // Middle section: slightly fuller
      { time: 22.0, note: 'F4', duration: 0.8, velocity: 0.4 },
      { time: 22.6, note: 'Ab4', duration: 0.8, velocity: 0.35 },
      { time: 23.2, note: 'Db5', duration: 0.8, velocity: 0.35 },
      { time: 23.8, note: 'F5', duration: 1.5, velocity: 0.45 },

      { time: 25.8, note: 'Eb4', duration: 0.8, velocity: 0.4 },
      { time: 26.4, note: 'Gb4', duration: 0.8, velocity: 0.35 },
      { time: 27.0, note: 'Bb4', duration: 0.8, velocity: 0.35 },
      { time: 27.6, note: 'Eb5', duration: 1.5, velocity: 0.45 },

      // Climax arpeggio
      { time: 30.0, note: 'Db4', duration: 0.6, velocity: 0.5 },
      { time: 30.4, note: 'F4', duration: 0.6, velocity: 0.45 },
      { time: 30.8, note: 'Ab4', duration: 0.6, velocity: 0.45 },
      { time: 31.2, note: 'Db5', duration: 0.6, velocity: 0.5 },
      { time: 31.6, note: 'F5', duration: 0.6, velocity: 0.5 },
      { time: 32.0, note: 'Ab5', duration: 2.0, velocity: 0.55 },

      // Descending
      { time: 34.5, note: 'Gb5', duration: 0.8, velocity: 0.45 },
      { time: 35.3, note: 'F5', duration: 0.8, velocity: 0.4 },
      { time: 36.1, note: 'Eb5', duration: 0.8, velocity: 0.4 },
      { time: 36.9, note: 'Db5', duration: 1.5, velocity: 0.4 },

      // Recapitulation: gentle arpeggios again
      { time: 39.0, note: 'Db4', duration: 1.0, velocity: 0.3 },
      { time: 39.5, note: 'F4', duration: 1.0, velocity: 0.25 },
      { time: 40.0, note: 'Ab4', duration: 1.0, velocity: 0.25 },
      { time: 40.5, note: 'Db5', duration: 1.5, velocity: 0.3 },

      { time: 42.5, note: 'Bb3', duration: 1.0, velocity: 0.3 },
      { time: 43.0, note: 'Db4', duration: 1.0, velocity: 0.25 },
      { time: 43.5, note: 'F4', duration: 1.0, velocity: 0.25 },
      { time: 44.0, note: 'Bb4', duration: 1.5, velocity: 0.3 },

      // Coda: fading arpeggios
      { time: 46.5, note: 'Db4', duration: 1.2, velocity: 0.25 },
      { time: 47.2, note: 'F4', duration: 1.2, velocity: 0.2 },
      { time: 47.9, note: 'Ab4', duration: 1.5, velocity: 0.2 },

      { time: 50.0, note: 'Db4', duration: 1.5, velocity: 0.2 },
      { time: 50.7, note: 'F4', duration: 1.5, velocity: 0.18 },
      { time: 51.4, note: 'Ab4', duration: 2.0, velocity: 0.18 },

      { time: 54.0, note: 'Db4', duration: 2.0, velocity: 0.15 },
      { time: 54.5, note: 'F4', duration: 2.0, velocity: 0.12 },
      { time: 55.0, note: 'Ab4', duration: 2.5, velocity: 0.12 },
      { time: 55.5, note: 'Db5', duration: 3.0, velocity: 0.1 },
    ],
    woodwinds: [
      // Floating melody over the arpeggios
      { time: 3.5, note: 'Ab4', duration: 1.5, velocity: 0.3 },
      { time: 5.5, note: 'Bb4', duration: 1.0, velocity: 0.3 },
      { time: 7.0, note: 'Ab4', duration: 1.2, velocity: 0.3 },
      { time: 8.5, note: 'F4', duration: 1.5, velocity: 0.3 },

      { time: 10.5, note: 'Gb4', duration: 1.0, velocity: 0.3 },
      { time: 12.0, note: 'F4', duration: 1.5, velocity: 0.3 },
      { time: 14.0, note: 'Eb4', duration: 2.0, velocity: 0.3 },

      // Middle melody
      { time: 22.0, note: 'Db5', duration: 1.5, velocity: 0.4 },
      { time: 24.0, note: 'Eb5', duration: 1.0, velocity: 0.4 },
      { time: 25.8, note: 'Db5', duration: 1.5, velocity: 0.4 },
      { time: 27.6, note: 'Bb4', duration: 1.5, velocity: 0.4 },

      // High point
      { time: 30.0, note: 'F5', duration: 2.0, velocity: 0.45 },
      { time: 32.5, note: 'Eb5', duration: 1.5, velocity: 0.4 },
      { time: 34.5, note: 'Db5', duration: 2.0, velocity: 0.35 },

      // Quiet return
      { time: 39.0, note: 'Ab4', duration: 1.5, velocity: 0.25 },
      { time: 42.5, note: 'F4', duration: 1.5, velocity: 0.25 },

      // Final note
      { time: 50.0, note: 'Ab4', duration: 3.0, velocity: 0.15 },
    ],
    brass: [],
    percussion: [],
    bass: [
      // Very gentle bass notes on chord changes
      { time: 0.0, note: 'Db2', duration: 3.0, velocity: 0.2 },
      { time: 3.5, note: 'Db2', duration: 3.0, velocity: 0.2 },
      { time: 7.0, note: 'Bb1', duration: 3.0, velocity: 0.2 },
      { time: 10.5, note: 'Eb2', duration: 3.0, velocity: 0.2 },
      { time: 14.0, note: 'Ab1', duration: 3.0, velocity: 0.2 },
      { time: 17.5, note: 'Db2', duration: 4.0, velocity: 0.2 },
      { time: 22.0, note: 'Db2', duration: 3.5, velocity: 0.25 },
      { time: 25.8, note: 'Eb2', duration: 3.5, velocity: 0.25 },
      { time: 30.0, note: 'Db2', duration: 4.0, velocity: 0.3 },
      { time: 34.5, note: 'Gb2', duration: 2.0, velocity: 0.25 },
      { time: 36.9, note: 'Ab2', duration: 2.0, velocity: 0.25 },
      { time: 39.0, note: 'Db2', duration: 3.0, velocity: 0.2 },
      { time: 42.5, note: 'Bb1', duration: 3.0, velocity: 0.2 },
      { time: 46.5, note: 'Db2', duration: 3.0, velocity: 0.15 },
      { time: 50.0, note: 'Db2', duration: 3.5, velocity: 0.12 },
      { time: 54.0, note: 'Db2', duration: 4.0, velocity: 0.1 },
    ],
  },
};
