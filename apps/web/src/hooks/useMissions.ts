import { useState, useEffect, useCallback } from 'react';
import type { Remnon, UserMission } from '../types';
import { api } from '../lib/api';

export function useMissions() {
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [remnons, setRemnons] = useState<Remnon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const missionsRes = await api.get<{ missions: unknown[]; userMissions: UserMission[] }>('/api/missions');
      setUserMissions(missionsRes.data.userMissions);
    } catch {
      // missions table may not exist yet — ignore
    }
    try {
      const remnonsRes = await api.get<{ remnons: Remnon[] }>('/api/remnons');
      setRemnons(remnonsRes.data.remnons);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const acceptMission = async (missionId: string, remnonId?: string) => {
    try {
      const res = await api.post<{ userMission: UserMission }>('/api/missions/accept', {
        mission_id: missionId,
        remnon_id: remnonId,
      });
      setUserMissions(prev => [...prev, res.data.userMission]);
    } catch {
      // ignore
    }
  };

  const abandonMission = async (userMissionId: string) => {
    try {
      await api.delete(`/api/missions/my/${userMissionId}`);
      setUserMissions(prev => prev.filter(um => um.id !== userMissionId));
    } catch {
      // ignore
    }
  };

  return { userMissions, remnons, loading, acceptMission, abandonMission };
}
