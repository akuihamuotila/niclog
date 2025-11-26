import { useEffect } from 'react';

import { initDb } from '../db/nicotineDb';
import { nicotineService } from '../services/nicotineService';
import { NicotineState } from '../types/nicotine';
import { loadSettings } from '../utils/settingsStorage';
import { mergeSettings } from './mergeSettings';

interface Params {
  setState: React.Dispatch<React.SetStateAction<NicotineState>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useNicotineBootstrap = ({ setState, setIsLoading }: Params) => {
  useEffect(() => {
    // Initialize the DB and load entries/settings once when the app mounts.
    const bootstrap = async () => {
      try {
        await initDb();
        const [entries, storedSettings] = await Promise.all([
          nicotineService.loadAll(),
          loadSettings(),
        ]);

        setState({
          entries,
          settings: mergeSettings(storedSettings),
        });
      } catch (error) {
        console.error('Failed to bootstrap nicotine data', error);
        setState((prev) => ({ ...prev, entries: [] }));
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [setIsLoading, setState]);
};
