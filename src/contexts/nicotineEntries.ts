import { NicotineEntry } from '../types/nicotine';
import { createId } from './nicotineHelpers';

// Input shape for creating a new entry; timestamp is optional for backdating.
export interface AddEntryInput {
  productType: NicotineEntry['productType'];
  nicotinePerUnitMg: number;
  amount: number;
  pricePerUnitEur: number;
  timestamp?: string;
}

// Build a NicotineEntry with calculated totals.
export const buildEntry = (
  input: AddEntryInput,
): NicotineEntry => ({
  id: createId(),
  timestamp: input.timestamp ?? new Date().toISOString(),
  productType: input.productType,
  nicotinePerUnitMg: input.nicotinePerUnitMg,
  amount: input.amount,
  totalMg: input.nicotinePerUnitMg * input.amount,
  pricePerUnitEur: input.pricePerUnitEur,
  totalCostEur: input.pricePerUnitEur * input.amount,
});

// Recompute totals after edits to nicotine, amount, or price.
export const recalcEntryTotals = (entry: NicotineEntry): NicotineEntry => ({
  ...entry,
  totalMg: entry.nicotinePerUnitMg * entry.amount,
  totalCostEur: entry.pricePerUnitEur * entry.amount,
});
