import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { initDb, insertEntry, loadAllEntries } from '../db/nicotineDb';
import {
  CurrencyRates,
  NicotineEntry,
  NicotineState,
  ProductType,
} from '../types/nicotine';
import {
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../utils/settingsStorage';

interface AddEntryInput {
  productType: ProductType;
  nicotinePerUnitMg: number;
  amount: number;
  pricePerUnit: number;
}

export interface NicotineContextValue {
  state: NicotineState;
  isLoading: boolean;
  addEntry(input: AddEntryInput): Promise<void>;
  setDailyLimit(limitMg: number | null): Promise<void>;
  setBaseCurrency(currency: string): Promise<void>;
  setDailyReminder(enabled: boolean): Promise<void>;
  setReminderHour(hour: number): Promise<void>;
  setCurrencyRates(rates: CurrencyRates): Promise<void>;
  getTodayTotalMg(): number;
  getTodayTotalCost(): number;
  getDailyTotals(
    daysBack: number,
  ): { date: string; totalMg: number; totalCost: number }[];
}

const NicotineContext = createContext<NicotineContextValue | undefined>(
  undefined,
);

const createId = () => {
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

const getDateKey = (date: Date) => date.toISOString().split('T')[0];

const getTotalsForDay = (
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
        acc.totalCost += entry.totalCost;
      }
      return acc;
    },
    { totalMg: 0, totalCost: 0 },
  );
};

export const NicotineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<NicotineState>({
    entries: [],
    settings: defaultSettings,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initDb();
        const [entries, storedSettings] = await Promise.all([
          loadAllEntries(),
          loadSettings(),
        ]);

        setState({
          entries,
          settings: storedSettings ?? defaultSettings,
        });
      } catch (error) {
        console.error('Failed to bootstrap nicotine data', error);
        setState({
          entries: [],
          settings: defaultSettings,
        });
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    saveSettings(state.settings).catch((error) => {
      console.error('Failed to persist nicotine settings', error);
    });
  }, [isLoading, state.settings]);

  const addEntry = useCallback(
    async (input: AddEntryInput) => {
      const entry: NicotineEntry = {
        id: createId(),
        timestamp: new Date().toISOString(),
        productType: input.productType,
        nicotinePerUnitMg: input.nicotinePerUnitMg,
        amount: input.amount,
        totalMg: input.nicotinePerUnitMg * input.amount,
        pricePerUnit: input.pricePerUnit,
        totalCost: input.pricePerUnit * input.amount,
        currency: state.settings.baseCurrency,
      };

      try {
        await insertEntry(entry);
        setState((prev) => ({
          ...prev,
          entries: [...prev.entries, entry],
        }));
      } catch (error) {
        console.error('Failed to add nicotine entry', error);
        throw error;
      }
    },
    [state.settings.baseCurrency],
  );

  const setDailyLimit = useCallback(
    async (limitMg: number | null) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, dailyLimitMg: limitMg },
      }));
    },
    [],
  );

  const setBaseCurrency = useCallback(async (currency: string) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, baseCurrency: currency },
    }));
  }, []);

  const setDailyReminder = useCallback(async (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, dailyReminderEnabled: enabled },
    }));
  }, []);

  const setReminderHour = useCallback(async (hour: number) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, reminderHour: hour },
    }));
  }, []);

  const setCurrencyRates = useCallback(async (rates: CurrencyRates) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, currencyRates: rates },
    }));
  }, []);

  const getTodayTotalMg = useCallback(() => {
    const totals = getTotalsForDay(new Date(), state.entries);
    return totals.totalMg;
  }, [state.entries]);

  const getTodayTotalCost = useCallback(() => {
    const totals = getTotalsForDay(new Date(), state.entries);
    return totals.totalCost;
  }, [state.entries]);

  const getDailyTotals = useCallback(
    (daysBack: number) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totals = [];
      for (let i = daysBack - 1; i >= 0; i -= 1) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const { totalMg, totalCost } = getTotalsForDay(day, state.entries);
        totals.push({
          date: getDateKey(day),
          totalMg,
          totalCost,
        });
      }

      return totals;
    },
    [state.entries],
  );

  const value = useMemo<NicotineContextValue>(
    () => ({
      state,
      isLoading,
      addEntry,
      setDailyLimit,
      setBaseCurrency,
      setDailyReminder,
      setReminderHour,
      setCurrencyRates,
      getTodayTotalMg,
      getTodayTotalCost,
      getDailyTotals,
    }),
    [
      state,
      isLoading,
      addEntry,
      setDailyLimit,
      setBaseCurrency,
      setDailyReminder,
      setReminderHour,
      setCurrencyRates,
      getTodayTotalMg,
      getTodayTotalCost,
      getDailyTotals,
    ],
  );

  return (
    <NicotineContext.Provider value={value}>
      {children}
    </NicotineContext.Provider>
  );
};

export const useNicotine = () => {
  const context = useContext(NicotineContext);
  if (!context) {
    throw new Error('useNicotine must be used within a NicotineProvider');
  }
  return context;
};
