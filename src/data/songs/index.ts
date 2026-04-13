export type { SongData, NoteEvent, InstrumentGroup } from './types.ts';
export { ALL_GROUPS } from './types.ts';

export { beethoven5 } from './beethoven5.ts';
export { newWorld } from './newWorld.ts';
export { mountainKing } from './mountainKing.ts';
export { clairDeLune } from './clairDeLune.ts';

import { beethoven5 } from './beethoven5.ts';
import { newWorld } from './newWorld.ts';
import { mountainKing } from './mountainKing.ts';
import { clairDeLune } from './clairDeLune.ts';
import type { SongData } from './types.ts';

export const ALL_SONGS: SongData[] = [beethoven5, newWorld, mountainKing, clairDeLune];
