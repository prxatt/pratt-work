'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Update, staticUpdates, mergeUpdates, socialProfiles } from '@/config/updates';

interface UseSocialFeedReturn {
  updates: Update[];
  socialProfiles: typeof socialProfiles;
  isLoading: boolean;
  error: Error | null;
  isRealtime: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL = 60000; // 60 seconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSocialFeed(): UseSocialFeedReturn {
  const [updates, setUpdates] = useState<Update[]>(staticUpdates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const cacheRef = useRef<{ data: Update[]; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUpdates = useCallback(async (force = false): Promise<void> => {
    // Check cache first
    if (!force && cacheRef.current) {
      const age = Date.now() - cacheRef.current.timestamp;
      if (age < CACHE_DURATION) {
        setUpdates(cacheRef.current.data);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/social-feed', {
        signal: abortControllerRef.current.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.updates && Array.isArray(data.updates)) {
        const merged = mergeUpdates(staticUpdates, data.updates);
        setUpdates(merged);
        setIsRealtime(data.isRealtime ?? false);
        setLastUpdated(new Date());
        
        // Update cache
        cacheRef.current = {
          data: merged,
          timestamp: Date.now(),
        };
      }
    } catch (err) {
      // Don't set error if it's an abort error
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      // Silent fallback to static updates
      setError(err instanceof Error ? err : new Error('Failed to fetch updates'));
      setUpdates(staticUpdates);
      setIsRealtime(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Polling interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUpdates();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUpdates]);

  // Visibility change - refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUpdates]);

  const refresh = useCallback(async () => {
    await fetchUpdates(true);
  }, [fetchUpdates]);

  return {
    updates,
    socialProfiles,
    isLoading,
    error,
    isRealtime,
    lastUpdated,
    refresh,
  };
}
