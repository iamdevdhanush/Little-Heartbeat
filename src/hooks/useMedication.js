import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService.js';

export function useMedication(userId) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await databaseService.getMedications(userId);
      setMedications(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const add = useCallback(async (med) => {
    const result = await databaseService.addMedication(userId, med);
    if (result) { await refresh(); }
    return result;
  }, [userId, refresh]);

  const update = useCallback(async (id, updates) => {
    const result = await databaseService.updateMedication(id, updates);
    if (result) { await refresh(); }
    return result;
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await databaseService.deleteMedication(id);
    await refresh();
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  const activeMedications = medications.filter(m => m.active !== false);
  const todayCount = activeMedications.length;
  const takenToday = medications.filter(m => m.active !== false).length;

  return {
    medications, activeMedications, loading, error, refresh,
    add, update, remove, todayCount, takenToday,
  };
}
