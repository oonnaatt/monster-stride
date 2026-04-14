import type { Remnon, RemnonSkill } from '../types';
import { getRemnonEmoji, getTypeBadgeClass, getPersonality, getLikes } from '../lib/remnonVisuals';
import { getYouTubeSearchUrl } from '../lib/remnonSongs';
import { EvolutionTree } from './EvolutionTree';
import { EXP_THRESHOLDS, EVOLUTION_TIERS, LOYALTY_TIERS, SKILLS } from '@monster-stride/shared';

const RARITY_BADGE: Record<string, string> = {
  common:    'bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded font-semibold',
  rare:      'bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-semibold',
  epic:      'bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded font-semibold',
  legendary: 'bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded font-semibold',
};

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  'Storm-Touched': 'Forged in rain and storm',
  'Lone Wolf': 'Walks under the night sky',
  'Steadfast': 'Unwavering in every stride',
  'Sprinter': 'Born to push limits',
  'Early Riser': 'Greets the dawn',
  'Wanderer': 'Explorer of many lands',
  'Summit Seeker': 'Climbs every peak',
  'Relentless': 'Never slows down',
};

interface RemnonProfileProps {
  remnon: Remnon;
  skills?: RemnonSkill[];
}

export function RemnonProfile({ remnon, skills = [] }: RemnonProfileProps) {
  const emoji = getRemnonEmoji(remnon.primary_type, remnon.evolution_tier);
  const types = [remnon.primary_type, remnon.secondary_type, remnon.tertiary_type].filter(Boolean) as string[];

  const tierIndex = EVOLUTION_TIERS.indexOf(remnon.evolution_tier as typeof EVOLUTION_TIERS[number]);
  const currentThreshold = EXP_THRESHOLDS[remnon.evolution_tier as keyof typeof EXP_THRESHOLDS] ?? 0;
  const nextTier = tierIndex >= 0 && tierIndex < EVOLUTION_TIERS.length - 1 ? EVOLUTION_TIERS[tierIndex + 1] : null;
  const nextThreshold = nextTier ? EXP_THRESHOLDS[nextTier as keyof typeof EXP_THRESHOLDS] : null;
  const expInTier = remnon.total_exp - currentThreshold;
  const expNeeded = nextThreshold ? nextThreshold - currentThreshold : 1;
  const expPct = nextThreshold ? Math.min((expInTier / expNeeded) * 100, 100) : 100;

  const loyalty = remnon.loyalty ?? 50;
  const loyaltyTier = LOYALTY_TIERS.find(t => loyalty >= t.minLoyalty) ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1];
  const song = remnon.theme_song;
  const songUrl = song ? getYouTubeSearchUrl(song) : null;

  const maxStat = 100;

  const personality = getPersonality(remnon.primary_type);
  const likes = getLikes(remnon);

  const hatchedDate = remnon.hatched_at
    ? new Date(remnon.hatched_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="text-center">
        <div className="text-8xl mb-3">{emoji}</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {types.map(t => (
            <span key={t} className={getTypeBadgeClass(t)}>{t}</span>
          ))}
        </div>
        {hatchedDate && (
          <p className="text-slate-400 text-xs mt-2">🥚 Hatched on {hatchedDate}</p>
        )}
      </div>

      {/* Personality */}
      <div className="bg-gradient-to-r from-fuchsia-50 to-violet-50 border border-violet-100 rounded-xl p-4">
        <h3 className="text-slate-700 font-semibold mb-2">💫 Personality</h3>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{personality.icon}</span>
          <p className="text-slate-600 text-sm leading-relaxed">{personality.description}</p>
        </div>
      </div>

      {/* Likes */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
        <h3 className="text-slate-700 font-semibold mb-3">💝 Likes</h3>
        <div className="flex flex-wrap gap-2">
          {likes.map(like => (
            <span key={like} className="bg-white border border-rose-200 rounded-lg px-3 py-1 text-slate-600 text-xs font-medium shadow-sm">
              {like}
            </span>
          ))}
        </div>
      </div>

      {/* Vibe Song */}
      <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border border-fuchsia-100 rounded-xl p-4">
        <h3 className="text-slate-700 font-semibold mb-3">🎵 Vibe Song</h3>
        {song ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">🎧</div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-semibold truncate">{song.title}</p>
                <p className="text-slate-500 text-sm">{song.artist}</p>
              </div>
              {songUrl && (
                <a
                  href={songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  ▶ Listen
                </a>
              )}
            </div>
            <p className="text-slate-400 text-xs italic">{song.vibe}</p>
          </>
        ) : (
          <p className="text-slate-400 text-sm italic">Song will be assigned when this remnon is hatched.</p>
        )}
      </div>

      {/* Birth Story */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
        <h3 className="text-slate-700 font-semibold mb-2">📖 Birth Story</h3>
        <p className="text-slate-500 text-sm">
          Born from the journey of a{' '}
          <span className="text-violet-600 font-medium">{remnon.birth_pace}</span> through{' '}
          <span className="text-violet-600 font-medium">{remnon.birth_biome}</span> terrain,
          in <span className="text-violet-600 font-medium">{remnon.birth_weather}</span> weather
          during the <span className="text-violet-600 font-medium">{remnon.birth_time_of_day}</span>,
          in <span className="text-violet-600 font-medium">{remnon.birth_season}</span>.
        </p>
      </div>

      {/* Loyalty */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
        <h3 className="text-slate-700 font-semibold mb-3">💗 Loyalty</h3>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{loyaltyTier.emoji}</span>
          <div>
            <span className="text-slate-800 font-semibold">{loyaltyTier.label}</span>
            <span className="text-slate-400 text-xs ml-2">{loyalty} / 100</span>
          </div>
          <span className="ml-auto text-xs text-fuchsia-600 font-semibold">{loyaltyTier.expMultiplier}× EXP</span>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-pink-400 to-rose-400"
            style={{ width: `${loyalty}%` }}
          />
        </div>
        <p className="text-slate-400 text-xs mt-2">
          Run in matching pace, biome, weather &amp; time to grow loyalty. Breaking your streak reduces it.
        </p>
      </div>

      {/* Traits */}
      {remnon.traits && remnon.traits.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h3 className="text-slate-700 font-semibold mb-3">✨ Traits</h3>
          <div className="flex flex-wrap gap-2">
            {remnon.traits.map(trait => (
              <div key={trait} className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-slate-800 text-sm font-medium">{trait}</span>
                {TRAIT_DESCRIPTIONS[trait] && (
                  <p className="text-slate-400 text-xs mt-0.5">{TRAIT_DESCRIPTIONS[trait]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3">📊 Stats</h3>
        <div className="space-y-3">
          {[
            { label: '⚔️ Attack', value: remnon.attack_power },
            { label: '🛡️ Defense', value: remnon.defense_power },
            { label: '💨 Speed', value: remnon.speed_power },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{label}</span>
                <span className="text-slate-500">{value}</span>
              </div>
              <div className="w-full bg-violet-100 rounded-full h-3">
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all"
                  style={{ width: `${Math.min((value / maxStat) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3">
          ⚔️ Skills{' '}
          <span className="text-xs text-slate-400 font-normal">({skills.length}/5)</span>
        </h3>
        <div className="space-y-2">
          {skills.map(sk => {
            const def = SKILLS.find(s => s.id === sk.skill_id);
            if (!def) return null;
            return (
              <div key={sk.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-2xl">{def.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-semibold text-slate-800 text-sm">{def.name}</span>
                    <span className={RARITY_BADGE[def.rarity]}>{def.rarity}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{def.description}</p>
                </div>
                {/* Charge dots */}
                <div className="flex gap-1 flex-shrink-0">
                  {Array.from({ length: sk.max_charges }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${i < sk.charges ? 'bg-violet-500 border-violet-500' : 'bg-white border-violet-200'}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {skills.length < 5 && Array.from({ length: 5 - skills.length }).map((_, i) => (
            <div key={`locked-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <span className="text-2xl opacity-25">❓</span>
              <span className="text-slate-300 text-xs">Locked — discover through battles, evolution &amp; missions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution Tree */}
      <div className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-3">🧬 Evolution Journey</h3>
        <EvolutionTree currentTier={remnon.evolution_tier} />
      </div>

      {/* EXP Progress */}
      <div className="bg-white border border-violet-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-slate-700 font-semibold mb-2">⭐ EXP Progress</h3>
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>{remnon.evolution_tier}</span>
          <span>{nextTier ? `${expInTier} / ${expNeeded} EXP` : 'MAX TIER'}</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
            style={{ width: `${expPct}%` }}
          />
        </div>
        {nextTier && <p className="text-xs text-slate-400 mt-1">Next: {nextTier}</p>}
      </div>
    </div>
  );
}
