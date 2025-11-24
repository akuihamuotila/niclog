import * as SQLite from 'expo-sqlite';

import { NicotineEntry } from '../types/nicotine';

const DB_NAME = 'niclog.db';
const TABLE_NAME = 'nicotine_entries';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
};

export const initDb = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp TEXT,
        productType TEXT,
        nicotinePerUnitMg REAL,
        amount REAL,
        totalMg REAL,
        pricePerUnit REAL,
        totalCost REAL,
        currency TEXT
      );
    `);
  } catch (error) {
    console.error('Failed to initialize nicotine database', error);
    throw error;
  }
};

export const loadAllEntries = async (): Promise<NicotineEntry[]> => {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<NicotineEntry>(
      `SELECT * FROM ${TABLE_NAME} ORDER BY datetime(timestamp) ASC`,
    );
    return rows ?? [];
  } catch (error) {
    console.error('Failed to load nicotine entries', error);
    return [];
  }
};

export const insertEntry = async (entry: NicotineEntry): Promise<void> => {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO ${TABLE_NAME} (id, timestamp, productType, nicotinePerUnitMg, amount, totalMg, pricePerUnit, totalCost, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.id,
      entry.timestamp,
      entry.productType,
      entry.nicotinePerUnitMg,
      entry.amount,
      entry.totalMg,
      entry.pricePerUnit,
      entry.totalCost,
      entry.currency,
    );
  } catch (error) {
    console.error('Failed to insert nicotine entry', error);
    throw error;
  }
};

export const clearAllEntries = async (): Promise<void> => {
  try {
    const db = await getDb();
    await db.execAsync(`DELETE FROM ${TABLE_NAME}`);
  } catch (error) {
    console.error('Failed to clear nicotine entries', error);
    throw error;
  }
};
