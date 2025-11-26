import { useEffect } from 'react';

import { initDb, loadAllEntries } from '../db/nicotineDb';
import { NicotineState } from '../types/nicotine';
import { loadSettings } from '../utils/settingsStorage';
import { mergeSettings } from './mergeSettings';

interface Params {
  setState: React.Dispatch<React.SetStateAction<NicotineState>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useNicotineBootstrap = ({ setState, setIsLoading }: Params) => {
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
