import { useEffect } from 'react';

import { NicotineState } from '../types/nicotine';
import { saveSettings } from '../utils/settingsStorage';

interface Params {
  state: NicotineState;
  isLoading: boolean;
}

export const usePersistSettings = ({ state, isLoading }: Params) => {
  useEffect(() => {
    if (isLoading) return;
    saveSettings(state.settings).catch((error) => {
      console.error('Failed to persist nicotine settings', error);
    });
  }, [isLoading, state.settings]);
};
