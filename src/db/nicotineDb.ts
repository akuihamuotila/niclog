import * as SQLite from 'expo-sqlite';

import { NicotineEntry } from '../types/nicotine';

const DB_NAME = 'niclog.db';
const TABLE_NAME = 'nicotine_entries';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Lazily open a shared SQLite database instance for nicotine entries.
const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
};

export const initDb = async (): Promise<void> => {
  try {
    const db = await getDb();
    // Create the entries table if it does not exist to store logs.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp TEXT,
        productType TEXT,
        nicotinePerUnitMg REAL,
        amount REAL,
        totalMg REAL,
        pricePerUnit REAL,
        totalCost REAL
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
    // Read every entry ordered by timestamp ascending for consistent display.
    const rows = await db.getAllAsync<NicotineEntry>(
      `SELECT 
        id, 
        timestamp, 
        productType, 
        nicotinePerUnitMg, 
        amount, 
        totalMg, 
        pricePerUnit AS pricePerUnitEur, 
        totalCost AS totalCostEur 
       FROM ${TABLE_NAME} 
       ORDER BY datetime(timestamp) ASC`,
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
    // Insert a full nicotine entry row with totals.
    await db.runAsync(
      `INSERT INTO ${TABLE_NAME} (id, timestamp, productType, nicotinePerUnitMg, amount, totalMg, pricePerUnit, totalCost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.id,
      entry.timestamp,
      entry.productType,
      entry.nicotinePerUnitMg,
      entry.amount,
      entry.totalMg,
      entry.pricePerUnitEur,
      entry.totalCostEur,
    );
  } catch (error) {
    console.error('Failed to insert nicotine entry', error);
    throw error;
  }
};

export const updateEntry = async (entry: NicotineEntry): Promise<void> => {
  try {
    const db = await getDb();
    // Update all editable fields for an existing entry by ID.
    await db.runAsync(
      `UPDATE ${TABLE_NAME}
       SET timestamp = ?, productType = ?, nicotinePerUnitMg = ?, amount = ?, totalMg = ?, pricePerUnit = ?, totalCost = ?
       WHERE id = ?`,
      entry.timestamp,
      entry.productType,
      entry.nicotinePerUnitMg,
      entry.amount,
      entry.totalMg,
      entry.pricePerUnitEur,
      entry.totalCostEur,
      entry.id,
    );
  } catch (error) {
    console.error('Failed to update nicotine entry', error);
    throw error;
  }
};

export const clearAllEntries = async (): Promise<void> => {
  try {
    const db = await getDb();
    // Remove every row to reset the log.
    await db.execAsync(`DELETE FROM ${TABLE_NAME}`);
  } catch (error) {
    console.error('Failed to clear nicotine entries', error);
    throw error;
  }
};

export const deleteEntry = async (id: string): Promise<void> => {
  try {
    const db = await getDb();
    // Delete a single entry by primary key.
    await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
  } catch (error) {
    console.error('Failed to delete nicotine entry', error);
    throw error;
  }
};
