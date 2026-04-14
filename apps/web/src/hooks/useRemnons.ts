import { useState, useEffect, useCallback } from 'react';
import type { Remnon } from '../types';
import { api } from '../lib/api';

export function useRemnons() {
  const [remnons, setRemnons] = useState<Remnon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRemnons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ remnons: Remnon[] }>('/api/remnons');
      setRemnons(res.data.remnons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load remnons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemnons();
  }, [fetchRemnons]);

  return { remnons, loading, error, refetch: fetchRemnons };
}
