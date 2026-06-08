import { useState, useEffect, useCallback, useMemo } from 'react';
import databaseService from '../services/databaseService.js';

export function usePregnancy(userId) {
  const [pregnancy, setPregnancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await databaseService.getActivePregnancy(userId);
      setPregnancy(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const update = useCallback(async (data) => {
    try {
      const updated = await databaseService.upsertPregnancy(userId, data);
      setPregnancy(updated);
      return updated;
    } catch (err) {
      setError(err.message); return null;
    }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const week = useMemo(() => {
    if (!pregnancy?.due_date) return 1;
    const due = new Date(pregnancy.due_date);
    const conception = new Date(due);
    conception.setDate(conception.getDate() - 280);
    const diff = Date.now() - conception.getTime();
    return Math.max(1, Math.min(42, Math.floor(diff / 604800000) + 1));
  }, [pregnancy?.due_date]);

  const trimester = useMemo(() => week <= 13 ? 1 : week <= 27 ? 2 : 3, [week]);

  const [babyGrowth, setBabyGrowth] = useState(null);
  useEffect(() => {
    if (week) {
      databaseService.getBabyGrowth(week).then(setBabyGrowth);
    }
  }, [week]);

  const daysUntilDue = useMemo(() => {
    if (!pregnancy?.due_date) return null;
    const diff = new Date(pregnancy.due_date) - new Date();
    return Math.ceil(diff / 86400000);
  }, [pregnancy?.due_date]);

  return {
    pregnancy, loading, error, refresh, update,
    week, trimester, babyGrowth, daysUntilDue,
    dueDate: pregnancy?.due_date || null,
    babyName: pregnancy?.baby_name || '',
    fetalSex: pregnancy?.fetal_sex || '',
  };
}
