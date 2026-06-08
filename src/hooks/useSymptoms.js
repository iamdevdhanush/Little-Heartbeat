import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService.js';

export function useSymptoms(userId) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await databaseService.getSymptoms(userId);
      setSymptoms(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logSymptom = useCallback(async (symptom, severity = 1, notes = '') => {
    const result = await databaseService.logSymptom(userId, { symptom, severity, notes });
    if (result) await refresh();
    return result;
  }, [userId, refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  const recentSymptoms = symptoms.slice(0, 10);
  const symptomSummary = symptoms.reduce((acc, s) => {
    acc[s.symptom] = (acc[s.symptom] || 0) + 1;
    return acc;
  }, {});

  return { symptoms, recentSymptoms, symptomSummary, loading, error, refresh, logSymptom };
}
