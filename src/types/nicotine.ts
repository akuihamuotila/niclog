export type ProductType = 'snus' | 'pouch' | 'vape' | 'cigarette' | 'other';

export interface NicotineEntry {
  id: string;
  timestamp: string;
  productType: ProductType;
  nicotinePerUnitMg: number;
  amount: number;
  totalMg: number;
  pricePerUnit: number;
  totalCost: number;
  currency: string;
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string | null;
}

export interface NicotineSettings {
  dailyLimitMg: number | null;
  baseCurrency: string;
  dailyReminderEnabled: boolean;
  reminderHour: number;
  reminderHours?: number[];
  reminderTimes?: string[];
  currencyRates: CurrencyRates | null;
}

export interface NicotineState {
  entries: NicotineEntry[];
  settings: NicotineSettings;
}
