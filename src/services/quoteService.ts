// Fetch a random quote/tip from the public quotable API with local fallback.
export interface Quote {
  content: string;
  author: string;
}

const FALLBACK_QUOTES: Quote[] = [
  { content: 'Keep going—small consistent steps beat big plans.', author: 'NicLog' },
  { content: 'Measure, don’t guess. What you track, you change.', author: 'NicLog' },
  { content: 'Tiny improvements add up when you repeat them daily.', author: 'NicLog' },
];

const getFallbackQuote = (): Quote => {
  const index = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[index];
};

export const fetchRandomQuote = async (): Promise<Quote | null> => {
  try {
    const response = await fetch('https://api.quotable.io/random');
    if (!response.ok) return null;
    const data = (await response.json()) as { content?: string; author?: string };
    if (!data?.content) return null;
    return { content: data.content, author: data.author ?? 'Unknown' };
  } catch (error) {
    // Fall back to a local quote when offline or network fails.
    return getFallbackQuote();
  }
};
