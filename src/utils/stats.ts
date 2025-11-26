// Stats helpers: range filtering, daily totals, summaries, and date key creation.
import { NicotineEntry } from '../types/nicotine';

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

// Turn a Date into YYYY-MM-DD in local time by zeroing the time portion.
export const getDateKey = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const year = copy.getFullYear();
  const month = `${copy.getMonth() + 1}`.padStart(2, '0');
  const day = `${copy.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert an ISO timestamp string into a normalized date key.
const getDateKeyFromTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return getDateKey(date);
};

// Create a list of date keys covering N days back including today.
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

// Filter entries to a date range (all or N days) and return them oldest-first.
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

// Group entries by day and sum nicotine mg and cost (as entered), filling missing days with zeroes for fixed ranges.
export const buildDailyTotals = (
  entries: NicotineEntry[],
  range: RangeOption,
): DailyTotal[] => {
  const filtered = filterEntriesByRange(entries, range);
  const grouped = new Map<string, DailyTotal>();

  filtered.forEach((entry) => {
    const key = getDateKeyFromTimestamp(entry.timestamp);
    const existing = grouped.get(key) ?? { date: key, totalMg: 0, totalCost: 0 };
    grouped.set(key, {
      date: key,
      totalMg: existing.totalMg + entry.totalMg,
      totalCost: existing.totalCost + entry.totalCostEur,
    });
  });

  if (range === 'all') {
    return Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  const keys = createRangeKeys(range);
  return keys.map((key) => grouped.get(key) ?? { date: key, totalMg: 0, totalCost: 0 });
};

// Summarize totals and daily averages from an array of daily aggregates; empty input returns zeros.
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
