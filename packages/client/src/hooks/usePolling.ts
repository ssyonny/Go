import { useState, useEffect, useRef, useCallback } from 'react';

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    setLoading(true);

    const poll = async () => {
      try {
        const result = await fetcherRef.current();
        if (mounted) setData(result);
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    };

    poll();
    const id = window.setInterval(poll, intervalMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);

  return { data, loading, refresh };
}
