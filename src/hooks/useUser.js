import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService.js';

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await databaseService.getCurrentUser();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
