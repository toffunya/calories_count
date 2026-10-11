import type { Table } from 'dexie';
import type { CustomFood, Entry, Profile, WalkRecord, WaterRecord, WeightRecord } from './types';
import Dexie from 'dexie';
import { renameGrams } from './legacy';

export type AppDatabase = Dexie & {
  entries: Table<Entry, string>;
  customFoods: Table<CustomFood, string>;
  profile: Table<Profile, string>;
  weightLog: Table<WeightRecord, number>;
  waterLog: Table<WaterRecord, string>;
  walks: Table<WalkRecord, string>;
};

export const db = new Dexie('calories-count') as AppDatabase;

db.version(1).stores({
  entries: 'id, date, foodId',
  profile: 'id',
  weightLog: '++id, &date',
});

db.version(2).stores({
  customFoods: 'id, createdAt',
});

db.version(3).upgrade(async (tx) => {
  await tx.table('entries').toCollection().modify(renameGrams);
  await tx.table('customFoods').toCollection().modify(renameGrams);
});

db.version(4).stores({
  waterLog: 'date',
  walks: 'id, date, startedAt',
});

export const PROFILE_ID = 'me';
