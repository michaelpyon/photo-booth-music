export interface NoteEvent {
  /** Time in seconds from start of piece */
  time: number;
  /** Note name, e.g. "C4", "Eb3" */
  note: string;
  /** Duration in seconds */
  duration: number;
  /** Velocity 0-1 */
  velocity: number;
}

export type InstrumentGroup = 'strings' | 'woodwinds' | 'brass' | 'percussion' | 'bass';

export const ALL_GROUPS: InstrumentGroup[] = ['strings', 'woodwinds', 'brass', 'percussion', 'bass'];

export interface SongData {
  name: string;
  composer: string;
  defaultBpm: number;
  groups: Record<InstrumentGroup, NoteEvent[]>;
}
