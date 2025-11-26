import { NicotineEntry } from '../types/nicotine';

// Generate a unique ID using crypto.randomUUID when available or a timestamp fallback.
export const createId = () => {
  const randomUuid =
    typeof globalThis !== 'undefined'
      ? (globalThis as typeof globalThis & {
          crypto?: { randomUUID?: () => string };
        }).crypto?.randomUUID
      : undefined;

  if (randomUuid) {
    return randomUuid.call(
      (globalThis as typeof globalThis & { crypto?: unknown }).crypto,
    );
  }
  return `nic-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

// Convert a Date to YYYY-MM-DD without mutating the original object.
export const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Sum nicotine mg and spending for a single local day in EUR.
export const getTotalsForDay = (
  targetDate: Date,
  entries: NicotineEntry[],
): { totalMg: number; totalCost: number } => {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return entries.reduce(
    (acc, entry) => {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= start && entryDate < end) {
        acc.totalMg += entry.totalMg;
        acc.totalCost += entry.totalCostEur;
      }
      return acc;
    },
    { totalMg: 0, totalCost: 0 },
  );
};

// Clamp reminder HH:MM strings to valid ranges and keep all entries.
export const sanitizeReminderTimes = (
  times: string[],
  fallback: string[] | undefined,
) => {
  const sanitized = times.map((t) => {
    const [h, m = '0'] = t.split(':');
    const hour = Math.max(0, Math.min(23, Number.parseInt(h, 10) || 0));
    const minute = Math.max(0, Math.min(59, Number.parseInt(m, 10) || 0));
    return `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  });

  return sanitized.length > 0 ? sanitized : fallback ?? [];
};
