import { useState, useEffect, useCallback } from 'react';
import type { Monster } from '../types';
import { api } from '../lib/api';

export function useMonsters() {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonsters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ monsters: Monster[] }>('/api/monsters');
      setMonsters(res.data.monsters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monsters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonsters();
  }, [fetchMonsters]);

  return { monsters, loading, error, refetch: fetchMonsters };
}
