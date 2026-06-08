import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService.js';

export function useAppointments(userId) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await databaseService.getAppointments(userId);
      setAppointments(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const add = useCallback(async (appt) => {
    const result = await databaseService.addAppointment(userId, appt);
    if (result) await refresh();
    return result;
  }, [userId, refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return { appointments, nextAppointment, loading, error, refresh, add };
}
