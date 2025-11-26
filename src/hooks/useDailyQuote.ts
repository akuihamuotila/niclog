// Hook to fetch a single daily quote from the public API.
import { useEffect, useState, useCallback } from 'react';

import { fetchRandomQuote, Quote } from '../services/quoteService';

const FALLBACK_QUOTE: Quote = {
  content: 'Keep going—small consistent steps beat big plans.',
  author: 'NicLog',
};

export const useDailyQuote = () => {
  const [quote, setQuote] = useState<Quote>(FALLBACK_QUOTE);

  const refreshQuote = useCallback(async () => {
    const result = await fetchRandomQuote();
    if (result) setQuote(result);
  }, []);

  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  return { quote, refreshQuote };
};
