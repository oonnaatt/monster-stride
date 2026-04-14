import { useState, useEffect } from 'react';
import type { Activity, LogActivityRequest, LogActivityResponse } from '../types';
import { api } from '../lib/api';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ activities: Activity[] }>('/api/activities');
        setActivities(res.data.activities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const logActivity = async (data: LogActivityRequest): Promise<LogActivityResponse> => {
    const res = await api.post<LogActivityResponse>('/api/activities', data);
    return res.data;
  };

  return { activities, loading, error, logActivity };
}
