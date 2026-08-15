import { useCallback, useRef, useState } from 'react';

interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
}

export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  { delay = 300, minLength = 1 }: UseDebouncedSearchOptions = {},
) {
  const [results, setResults] = useState<T[]>([]);
  const [showResults, setShowResults] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (query: string) => {
      if (timer.current) clearTimeout(timer.current);
      if (query.trim().length < minLength) {
        setResults([]);
        return;
      }
      timer.current = setTimeout(async () => {
        try {
          setResults(await searchFn(query));
          setShowResults(true);
        } catch {
          setResults([]);
        }
      }, delay);
    },
    [searchFn, delay, minLength],
  );

  const reset = useCallback(() => {
    setResults([]);
    setShowResults(false);
  }, []);

  return { results, showResults, setShowResults, search, reset };
}
