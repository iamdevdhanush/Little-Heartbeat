import { useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService.js';

export function useTimeline(userId, pregnancyId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await databaseService.getTimelineEvents(userId, pregnancyId);
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, pregnancyId]);

  const addEvent = useCallback(async (event) => {
    const result = await databaseService.addTimelineEvent(userId, event);
    if (result) await refresh();
    return result;
  }, [userId, refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  const eventsByWeek = events.reduce((acc, e) => {
    if (!acc[e.week]) acc[e.week] = [];
    acc[e.week].push(e);
    return acc;
  }, {});

  const weeksWithEvents = Object.keys(eventsByWeek).map(Number).sort((a, b) => a - b);

  return { events, eventsByWeek, weeksWithEvents, loading, error, refresh, addEvent };
}
