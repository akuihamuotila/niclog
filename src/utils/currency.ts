import { CurrencyRates } from '../types/nicotine';

const RATES_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export const isRatesStale = (
  rates: CurrencyRates | null,
  baseCurrency: string,
): boolean => {
  if (!rates) return true;
  if (rates.base !== baseCurrency) return true;
  if (!rates.lastUpdated) return true;
  const last = new Date(rates.lastUpdated).getTime();
  return Number.isNaN(last) || Date.now() - last > RATES_TTL_MS;
};

export const fetchLatestRates = async (
  baseCurrency: string,
): Promise<CurrencyRates | null> => {
  try {
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=${baseCurrency}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }
    const data = await response.json();
    if (!data?.rates) {
      return null;
    }

    return {
      base: baseCurrency,
      rates: data.rates as Record<string, number>,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch currency rates', error);
    return null;
  }
};

export const convertToBaseCurrency = (
  amount: number,
  fromCurrency: string,
  baseCurrency: string,
  rates: CurrencyRates | null,
): number => {
  if (fromCurrency === baseCurrency) {
    return amount;
  }

  if (!rates || !rates.rates) {
    return amount;
  }

  // If rates are based on the desired baseCurrency, convert back by dividing.
  if (rates.base === baseCurrency) {
    const rate = rates.rates[fromCurrency];
    if (!rate || rate === 0) return amount;
    return amount / rate;
  }

  // If base differs, attempt cross conversion via rates.base
  const fromRate = rates.rates[fromCurrency];
  const baseRate = rates.rates[baseCurrency];
  if (fromRate && baseRate) {
    // Convert from "fromCurrency" to rates.base, then to baseCurrency.
    const amountInRatesBase = amount / fromRate;
    return amountInRatesBase * baseRate;
  }

  return amount;
};
