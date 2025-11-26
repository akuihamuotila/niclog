// Service layer for nicotine entry persistence.
import {
  deleteEntry as deleteDbEntry,
  insertEntry,
  loadAllEntries,
  updateEntry as updateDbEntry,
} from '../db/nicotineDb';
import { NicotineEntry } from '../types/nicotine';

export const nicotineService = {
  loadAll: (): Promise<NicotineEntry[]> => loadAllEntries(),
  add: (entry: NicotineEntry): Promise<void> => insertEntry(entry),
  update: (entry: NicotineEntry): Promise<void> => updateDbEntry(entry),
  deleteById: (id: string): Promise<void> => deleteDbEntry(id),
};
