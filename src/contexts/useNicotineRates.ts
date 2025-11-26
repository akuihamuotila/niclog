import { useEffect } from 'react';

import { NicotineState } from '../types/nicotine';
import { fetchLatestRates, isRatesStale } from '../utils/currency';

interface Params {
  state: NicotineState;
  isLoading: boolean;
  setState: React.Dispatch<React.SetStateAction<NicotineState>>;
}

export const useNicotineRates = ({ state, isLoading, setState }: Params) => {
  useEffect(() => {
    if (isLoading) return;

    const maybeUpdateRates = async () => {
      const { baseCurrency, currencyRates } = state.settings;
      if (!baseCurrency) return;
      if (isRatesStale(currencyRates, baseCurrency)) {
        const latest = await fetchLatestRates(baseCurrency);
        if (latest) {
          setState((prev) => ({
            ...prev,
            settings: { ...prev.settings, currencyRates: latest },
          }));
        }
      }
    };

    maybeUpdateRates();
  }, [isLoading, setState, state.settings]);
};
