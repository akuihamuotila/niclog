// Product categories the user can log.
export type ProductType = 'snus' | 'pouch' | 'vape' | 'cigarette' | 'other';

// One nicotine usage entry with totals and pricing in EUR.
export interface NicotineEntry {
  id: string;
  timestamp: string;
  productType: ProductType;
  nicotinePerUnitMg: number;
  amount: number;
  totalMg: number;
  pricePerUnitEur: number;
  totalCostEur: number;
}

// User settings for nicotine tracking.
export interface NicotineSettings {
  dailyLimitMg: number | null;
  dailyReminderEnabled: boolean;
  reminderHour: number;
  reminderHours?: number[];
  reminderTimes?: string[];
}

// Root state holding all entries and settings.
export interface NicotineState {
  entries: NicotineEntry[];
  settings: NicotineSettings;
}
