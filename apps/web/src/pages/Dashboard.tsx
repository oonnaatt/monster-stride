import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMonsters } from '../hooks/useMonsters';
import { api } from '../lib/api';
import type { PlayerStats } from '../types';
import { EggIncubator } from '../components/EggIncubator';
import { MonsterCard } from '../components/MonsterCard';

// DEMO MODE: 100km target — production value: 10000km
const TARGET_KM = 100;

export function Dashboard() {
  const { user } = useAuth();
  const { monsters, loading: monstersLoading, refetch } = useMonsters();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<{ stats: PlayerStats }>('/api/player-stats');
        setStats(res.data.stats);
      } catch {
        // No stats yet
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const recentMonsters = monsters.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-indigo-400">{user?.email?.split('@')[0]}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Your journey awaits.</p>
      </div>

      {/* Egg Incubator */}
      <EggIncubator
        currentKm={stats ? Number(stats.current_egg_km) : 0}
        targetKm={TARGET_KM}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
          <div className="text-2xl">🏃</div>
          <div className="text-xl font-bold text-white mt-1">
            {statsLoading ? '...' : (stats ? Number(stats.total_km).toFixed(1) : '0.0')}
          </div>
          <div className="text-gray-400 text-xs">Total km</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
          <div className="text-2xl">🔥</div>
          <div className="text-xl font-bold text-white mt-1">
            {statsLoading ? '...' : (stats?.streak_days ?? 0)}
          </div>
          <div className="text-gray-400 text-xs">Day streak</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
          <div className="text-2xl">👾</div>
          <div className="text-xl font-bold text-white mt-1">
            {monstersLoading ? '...' : monsters.length}
          </div>
          <div className="text-gray-400 text-xs">Monsters</div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/log"
        className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center font-bold text-lg py-4 rounded-xl transition-colors"
      >
        🏃 Log Activity
      </Link>

      {/* Recent Monsters */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Monsters</h2>
        {monstersLoading ? (
          <div className="text-gray-400">Loading...</div>
        ) : recentMonsters.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
            <div className="text-4xl mb-3">🥚</div>
            <p className="text-gray-400">No monsters yet, start walking!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentMonsters.map(m => (
              <MonsterCard key={m.id} monster={m} onUpdate={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
