import { CurrencyRates, NicotineEntry } from '../types/nicotine';
import { convertToBaseCurrency } from './currency';

export type RangeOption = number | 'all';

export interface DailyTotal {
  date: string;
  totalMg: number;
  totalCost: number;
}

export interface RangeSummary {
  totalMg: number;
  avgMg: number;
  totalCost: number;
  avgCost: number;
}

export const getDateKey = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const year = copy.getFullYear();
  const month = `${copy.getMonth() + 1}`.padStart(2, '0');
  const day = `${copy.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateKeyFromTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return getDateKey(date);
};

const createRangeKeys = (daysBack: number): string[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  for (let i = daysBack - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    keys.push(getDateKey(day));
  }
  return keys;
};

export const filterEntriesByRange = (
  entries: NicotineEntry[],
  range: RangeOption,
): NicotineEntry[] => {
  if (range === 'all') {
    return [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (range - 1));
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return entries
    .filter((entry) => {
      const time = new Date(entry.timestamp).getTime();
      return time >= start.getTime() && time <= end.getTime();
    })
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
};

export const buildDailyTotals = (
  entries: NicotineEntry[],
  range: RangeOption,
  baseCurrency: string,
  rates: CurrencyRates | null,
): DailyTotal[] => {
  const filtered = filterEntriesByRange(entries, range);
  const grouped = new Map<string, DailyTotal>();

  filtered.forEach((entry) => {
    const key = getDateKeyFromTimestamp(entry.timestamp);
    const existing = grouped.get(key) ?? { date: key, totalMg: 0, totalCost: 0 };
    const costInBase = convertToBaseCurrency(
      entry.totalCost,
      entry.currency,
      baseCurrency,
      rates,
    );
    grouped.set(key, {
      date: key,
      totalMg: existing.totalMg + entry.totalMg,
      totalCost: existing.totalCost + costInBase,
    });
  });

  if (range === 'all') {
    return Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  // fill missing days with zeros for the selected range
  const keys = createRangeKeys(range);
  return keys.map((key) => grouped.get(key) ?? { date: key, totalMg: 0, totalCost: 0 });
};

export const summarizeDailyTotals = (daily: DailyTotal[]): RangeSummary => {
  if (daily.length === 0) {
    return { totalMg: 0, avgMg: 0, totalCost: 0, avgCost: 0 };
  }
  const totalMg = daily.reduce((sum, day) => sum + day.totalMg, 0);
  const totalCost = daily.reduce((sum, day) => sum + day.totalCost, 0);
  const avgMg = totalMg / daily.length;
  const avgCost = totalCost / daily.length;

  return { totalMg, avgMg, totalCost, avgCost };
};
