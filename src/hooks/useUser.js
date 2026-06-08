import { useState, useEffect, useCallback, useRef } from 'react';
import databaseService from '../services/databaseService.js';

const LOAD_TIMEOUT = 5000;

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timedOut = useRef(false);

  const refresh = useCallback(async () => {
    timedOut.current = false;
    setLoading(true);
    const timer = setTimeout(() => {
      timedOut.current = true;
      setLoading(false);
      setError('Loading timed out');
    }, LOAD_TIMEOUT);
    try {
      const data = await databaseService.getCurrentUser();
      if (!timedOut.current) {
        clearTimeout(timer);
        setUser(data);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (!timedOut.current) {
        clearTimeout(timer);
        setError(err.message);
        setLoading(false);
      }
    }
  }, []);

  const update = useCallback(async (updates) => {
    try {
      const updated = await databaseService.upsertUser(updates);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { user, loading, error, refresh, update };
}
