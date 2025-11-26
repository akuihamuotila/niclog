import { NicotineEntry } from '../types/nicotine';
import { createId } from './nicotineHelpers';

export interface AddEntryInput {
  productType: NicotineEntry['productType'];
  nicotinePerUnitMg: number;
  amount: number;
  pricePerUnit: number;
  timestamp?: string;
}

export const buildEntry = (
  input: AddEntryInput,
  baseCurrency: string,
): NicotineEntry => ({
  id: createId(),
  timestamp: input.timestamp ?? new Date().toISOString(),
  productType: input.productType,
  nicotinePerUnitMg: input.nicotinePerUnitMg,
  amount: input.amount,
  totalMg: input.nicotinePerUnitMg * input.amount,
  pricePerUnit: input.pricePerUnit,
  totalCost: input.pricePerUnit * input.amount,
  currency: baseCurrency,
});

export const recalcEntryTotals = (entry: NicotineEntry): NicotineEntry => ({
  ...entry,
  totalMg: entry.nicotinePerUnitMg * entry.amount,
  totalCost: entry.pricePerUnit * entry.amount,
});
