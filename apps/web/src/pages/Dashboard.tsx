import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRemnons } from '../hooks/useRemnons';
import { api } from '../lib/api';
import type { PlayerStats } from '../types';
import { EggIncubator } from '../components/EggIncubator';
import { RemnonCard } from '../components/RemnonCard';
import { getRemnonEmoji, getTypeBadgeClass, getPersonality } from '../lib/remnonVisuals';
import { HATCHING_THRESHOLD_KM, EXP_THRESHOLDS, EVOLUTION_TIERS, LOYALTY_TIERS } from '@monster-stride/shared';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { remnons, loading: remnonLoading, refetch } = useRemnons();
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

  const recentRemnons = remnons.slice(0, 3);

  // Pick featured remnon — most recently updated (first in list)
  const featured = remnons[0] ?? null;
  const featuredEmoji = featured ? getRemnonEmoji(featured.primary_type, featured.evolution_tier) : null;
  const featuredTypes = featured
    ? [featured.primary_type, featured.secondary_type, featured.tertiary_type].filter(Boolean) as string[]
    : [];
  const featuredPersonality = featured ? getPersonality(featured.primary_type) : null;
  const featuredLoyalty = featured ? (featured.loyalty ?? 50) : 0;
  const featuredLoyaltyTier = featured
    ? (LOYALTY_TIERS.find(t => featuredLoyalty >= t.minLoyalty) ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1])
    : null;
  const featuredTierIndex = featured ? EVOLUTION_TIERS.indexOf(featured.evolution_tier as typeof EVOLUTION_TIERS[number]) : -1;
  const featuredNextTier = featuredTierIndex >= 0 && featuredTierIndex < EVOLUTION_TIERS.length - 1
    ? EVOLUTION_TIERS[featuredTierIndex + 1] : null;
  const featuredCurrentThreshold = featured ? (EXP_THRESHOLDS[featured.evolution_tier as keyof typeof EXP_THRESHOLDS] ?? 0) : 0;
  const featuredNextThreshold = featuredNextTier ? EXP_THRESHOLDS[featuredNextTier as keyof typeof EXP_THRESHOLDS] : null;
  const featuredExpInTier = featured ? featured.total_exp - featuredCurrentThreshold : 0;
  const featuredExpNeeded = featuredNextThreshold ? featuredNextThreshold - featuredCurrentThreshold : 1;
  const featuredExpPct = featuredNextThreshold
    ? Math.min((featuredExpInTier / featuredExpNeeded) * 100, 100)
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Welcome back, <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">{user?.email?.split('@')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Your journey awaits.</p>
      </div>

      {/* Featured Remnon / Egg Incubator */}
      {!remnonLoading && featured ? (
        <div
          className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden cursor-pointer hover:border-violet-300 hover:shadow-md transition-all"
          onClick={() => navigate(`/remnons/${featured.id}`)}
        >
          {/* Header band */}
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 flex items-center justify-between">
            <span className="text-white text-xs font-bold tracking-wide uppercase">Your Companion</span>
            <span className="text-white/80 text-xs">Tap to view full profile →</span>
          </div>

          <div className="p-5 flex gap-5 items-center">
            {/* Big emoji */}
            <div className="text-7xl flex-shrink-0 select-none">{featuredEmoji}</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-800 truncate">
                  {featured.name ?? 'Unnamed Remnon'}
                </h2>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                  {featured.evolution_tier}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {featuredTypes.map(t => (
                  <span key={t} className={getTypeBadgeClass(t)}>{t}</span>
                ))}
              </div>

              {featuredPersonality && (
                <p className="text-slate-400 text-xs mb-3 leading-relaxed line-clamp-2">
                  {featuredPersonality.icon} {featuredPersonality.description}
                </p>
              )}

              {/* EXP bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>EXP</span>
                  <span>{featuredNextTier ? `${featuredExpInTier} / ${featuredExpNeeded}` : 'MAX TIER'}</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                    style={{ width: `${featuredExpPct}%` }}
                  />
                </div>
              </div>

              {/* Loyalty */}
              {featuredLoyaltyTier && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{featuredLoyaltyTier.emoji}</span>
                  <span>{featuredLoyaltyTier.label}</span>
                  <div className="flex-1 bg-pink-100 rounded-full h-1.5 overflow-hidden ml-1">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all"
                      style={{ width: `${featuredLoyalty}%` }}
                    />
                  </div>
                  <span className="text-fuchsia-500 font-semibold">{featuredLoyaltyTier.expMultiplier}×</span>
                </div>
              )}
            </div>
          </div>

          {/* Mini stats footer */}
          <div className="border-t border-violet-50 px-5 py-2.5 flex justify-around text-xs text-slate-400 bg-violet-50/50">
            <span>⚔️ {featured.attack_power}</span>
            <span>🛡️ {featured.defense_power}</span>
            <span>💨 {featured.speed_power}</span>
            {remnons.length > 1 && (
              <span
                className="text-violet-500 font-semibold"
                onClick={e => { e.stopPropagation(); navigate('/remnons'); }}
              >
                +{remnons.length - 1} more →
              </span>
            )}
          </div>
        </div>
      ) : (
        <EggIncubator
          currentKm={stats ? Number(stats.current_egg_km) : 0}
          targetKm={HATCHING_THRESHOLD_KM}
          eligibleToHatch={remnons.length === 0 || remnons.every(m => m.evolution_tier === 'Ascended')}
        />
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center border border-violet-100 shadow-sm">
          <div className="text-2xl">🏃</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {statsLoading ? '...' : (stats ? Number(stats.total_km).toFixed(1) : '0.0')}
          </div>
          <div className="text-slate-400 text-xs">Total km</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-orange-100 shadow-sm">
          <div className="text-2xl">🔥</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {statsLoading ? '...' : (stats?.streak_days ?? 0)}
          </div>
          <div className="text-slate-400 text-xs">Day streak</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-fuchsia-100 shadow-sm">
          <div className="text-2xl">👾</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {remnonLoading ? '...' : remnons.length}
          </div>
          <div className="text-slate-400 text-xs">Remnons</div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/log"
        className="block w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-center font-bold text-lg py-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
      >
        🏃 Log Activity
      </Link>

      {/* Recent Remnons */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Remnons</h2>
        {remnonLoading ? (
          <div className="text-slate-400">Loading...</div>
        ) : recentRemnons.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-violet-100 shadow-sm">
            <div className="text-4xl mb-3">🥚</div>
            <p className="text-slate-400">No remnons yet, start walking!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentRemnons.map(m => (
              <RemnonCard key={m.id} remnon={m} onUpdate={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
