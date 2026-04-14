import { useState, useMemo } from 'react';
import { MISSIONS } from '@monster-stride/shared';
import type { MissionDef } from '@monster-stride/shared';
import { useMissions } from '../hooks/useMissions';

const DIFFICULTY_CONFIG = {
  easy:      { label: 'Easy',      badge: 'bg-emerald-100 text-emerald-700', row: 'border-emerald-200' },
  medium:    { label: 'Medium',    badge: 'bg-amber-100 text-amber-700',     row: 'border-amber-200' },
  hard:      { label: 'Hard',      badge: 'bg-rose-100 text-rose-700',       row: 'border-rose-200' },
  legendary: { label: 'Legendary', badge: 'bg-violet-100 text-violet-700',   row: 'border-violet-200' },
} as const;

const DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary'] as const;

export function Missions() {
  const { userMissions, remnons, loading, acceptMission, abandonMission } = useMissions();
  const [pickingMission, setPickingMission] = useState<MissionDef | null>(null);
  const [selectedRemnon, setSelectedRemnon] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Map mission_id → latest user mission record
  const statusMap = useMemo(() => {
    const m = new Map<string, { status: string; progress: number; id: string; remnonId: string | null }>();
    for (const um of userMissions) {
      const existing = m.get(um.mission_id);
      if (!existing || um.status === 'active') {
        m.set(um.mission_id, { status: um.status, progress: um.progress, id: um.id, remnonId: um.remnon_id });
      }
    }
    return m;
  }, [userMissions]);

  const activeMissions = userMissions.filter(um => um.status === 'active');

  const openAccept = (mission: MissionDef) => {
    setPickingMission(mission);
    setSelectedRemnon(remnons[0]?.id ?? '');
  };

  const handleAccept = async () => {
    if (!pickingMission) return;
    setActionLoading(true);
    await acceptMission(pickingMission.id, selectedRemnon || undefined);
    setActionLoading(false);
    setPickingMission(null);
    setSelectedRemnon('');
  };

  const handleAbandon = async (userMissionId: string) => {
    setActionLoading(true);
    await abandonMission(userMissionId);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading missions...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">🎯 Missions</h1>
        <p className="text-slate-400 text-sm">
          Complete missions to boost your Remnon's EXP and speed up evolution.
          Each accepted mission is tracked automatically when you log activities.
        </p>
      </div>

      {/* Active missions panel */}
      {activeMissions.length > 0 && (
        <div className="mb-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">
          <h2 className="text-slate-700 font-bold mb-3">⚡ Active Missions ({activeMissions.length})</h2>
          <div className="space-y-2">
            {activeMissions.map(um => {
              const def = MISSIONS.find(m => m.id === um.mission_id);
              if (!def) return null;
              const linked = remnons.find(r => r.id === um.remnon_id);
              const isNumericTarget = typeof def.targetValue === 'number';
              const progressPct = isNumericTarget
                ? Math.min((um.progress / (def.targetValue as number)) * 100, 100)
                : um.progress > 0 ? 100 : 0;
              return (
                <div key={um.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-violet-100 shadow-sm">
                  <span className="text-2xl flex-shrink-0">{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800 text-sm truncate">{def.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {linked && (
                          <span className="text-xs text-violet-500">
                            → {linked.name ?? 'Remnon'}
                          </span>
                        )}
                        <span className="text-violet-600 font-semibold text-xs">+{def.expReward}</span>
                      </div>
                    </div>
                    <div className="w-full bg-violet-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {isNumericTarget && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {um.progress} / {def.targetValue as number}
                        {def.type === 'weekly_km' || def.type === 'single_distance' ? ' km' : ''}
                        {def.type === 'streak' ? ' days' : ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAbandon(um.id)}
                    disabled={actionLoading}
                    className="text-slate-300 hover:text-rose-400 transition-colors text-sm flex-shrink-0"
                    title="Abandon mission"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mission list by difficulty */}
      {DIFFICULTIES.map(difficulty => {
        const cfg = DIFFICULTY_CONFIG[difficulty];
        const group = MISSIONS.filter(m => m.difficulty === difficulty);
        return (
          <div key={difficulty} className="mb-8">
            <h2 className="text-slate-700 font-bold text-lg mb-3 flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                {cfg.label}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.map(mission => {
                const us = statusMap.get(mission.id);
                const isActive = us?.status === 'active';
                const isCompleted = us?.status === 'completed';
                return (
                  <div
                    key={mission.id}
                    className={`bg-white rounded-2xl p-4 border transition-all ${
                      isCompleted
                        ? 'border-emerald-200 opacity-75'
                        : isActive
                        ? 'border-violet-300 shadow-sm'
                        : `border-slate-100 hover:border-violet-200 hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{mission.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-slate-800 text-sm">{mission.title}</span>
                          {isCompleted && <span className="text-emerald-500 text-xs">✅</span>}
                        </div>
                        <p className="text-slate-400 text-xs mb-2 leading-snug">{mission.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-600 font-semibold text-xs">+{mission.expReward} EXP</span>
                          {!isActive && !isCompleted && (
                            <button
                              onClick={() => openAccept(mission)}
                              className="text-xs bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-1 rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-sm"
                            >
                              Accept
                            </button>
                          )}
                          {isActive && (
                            <span className="text-xs text-violet-500 font-semibold animate-pulse">In Progress</span>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-emerald-500 font-semibold">Done!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Accept mission modal */}
      {pickingMission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-violet-200">
            <div className="text-4xl text-center mb-2">{pickingMission.icon}</div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
              {pickingMission.title}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-1">{pickingMission.description}</p>
            <p className="text-violet-600 font-bold text-center text-sm mb-5">
              +{pickingMission.expReward} EXP reward
            </p>

            <div className="mb-5">
              <label className="block text-slate-600 text-sm font-semibold mb-2">
                Which Remnon earns the EXP?
              </label>
              {remnons.length === 0 ? (
                <p className="text-slate-400 text-sm bg-slate-50 rounded-xl p-3 text-center">
                  No Remnons yet — hatch one first!
                </p>
              ) : (
                <select
                  value={selectedRemnon}
                  onChange={e => setSelectedRemnon(e.target.value)}
                  className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {remnons.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name ?? 'Unnamed Remnon'} — {r.primary_type} · {r.evolution_tier}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPickingMission(null)}
                className="flex-1 bg-slate-100 text-slate-500 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={actionLoading || remnons.length === 0}
                className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-2.5 rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 shadow-sm"
              >
                {actionLoading ? 'Starting…' : 'Accept Mission 🎯'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
