import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChallengeResult, BattleRound } from '@monster-stride/shared';
import { SKILLS } from '@monster-stride/shared';
import { grantRandomSkill } from './skillService';

const WILD_NAMES: Record<string, string[]> = {
  Fire:      ['Embroth', 'Cindrak', 'Flarnex'],
  Water:     ['Tidalux', 'Splashen', 'Murkeel'],
  Earth:     ['Gorlum', 'Stoneax', 'Tremork'],
  Wind:      ['Galeesh', 'Zephrix', 'Blustex'],
  Electric:  ['Voltzik', 'Sparklen', 'Zappix'],
  Nature:    ['Vixvine', 'Thornox', 'Bloomex'],
  Ice:       ['Frostix', 'Glacern', 'Crystul'],
  Shadow:    ['Umbrox', 'Darken', 'Voidel'],
  Light:     ['Lumex', 'Radiren', 'Gleamox'],
  Mecha:     ['Gearox', 'Ironix', 'Boltrak'],
  Fog:       ['Mistrel', 'Hazelon', 'Vaprix'],
  Nocturnal: ['Lunark', 'Nighten', 'Moonax'],
  Void:      ['Abyssix', 'Nullorn', 'Vorthex'],
};

const BIOME_TYPE_MAP: Record<string, string> = {
  urban: 'Mecha', forest: 'Nature', mountain: 'Earth',
  coastal: 'Water', desert: 'Fire', suburban: 'Light',
};

const WEATHER_TYPE_OVERRIDE: Record<string, string> = {
  thunderstorm: 'Electric', storm: 'Electric',
  snow: 'Ice', fog: 'Fog',
};

// Simple wild-only skill attacks for the battle engine
const WILD_SKILLS: Record<string, Array<{ name: string; power: number }>> = {
  Fire:      [{ name: 'Ember', power: 25 }, { name: 'Flame Burst', power: 50 }],
  Water:     [{ name: 'Splash', power: 20 }, { name: 'Torrent', power: 48 }],
  Earth:     [{ name: 'Rock Toss', power: 28 }, { name: 'Slam', power: 52 }],
  Wind:      [{ name: 'Gust', power: 22 }, { name: 'Wind Slash', power: 45 }],
  Electric:  [{ name: 'Zap', power: 28 }, { name: 'Shock Wave', power: 54 }],
  Nature:    [{ name: 'Vine Whip', power: 24 }, { name: 'Thorn Burst', power: 46 }],
  Ice:       [{ name: 'Frost Bite', power: 22 }, { name: 'Ice Spike', power: 48 }],
  Shadow:    [{ name: 'Dark Claw', power: 26 }, { name: 'Shadow Burst', power: 50 }],
  Light:     [{ name: 'Flash', power: 20 }, { name: 'Light Beam', power: 44 }],
  Mecha:     [{ name: 'Metal Claw', power: 28 }, { name: 'Gear Slam', power: 52 }],
  Fog:       [{ name: 'Haze', power: 20 }, { name: 'Fog Blast', power: 42 }],
  Nocturnal: [{ name: 'Night Slash', power: 26 }, { name: 'Moon Strike', power: 50 }],
  Void:      [{ name: 'Void Touch', power: 32 }, { name: 'Nullify', power: 58 }],
};

interface ActivitySnapshot {
  distance_km: number;
  biome: string;
  weather: string;
}

interface RemnonForBattle {
  id: string;
  name: string | null;
  primary_type: string;
  secondary_type: string | null;
  evolution_tier: string;
  attack_power: number;
  defense_power: number;
  speed_power: number;
  skills: Array<{ skill_id: string; charges: number }>;
}

function pickWildType(activity: ActivitySnapshot): string {
  return WEATHER_TYPE_OVERRIDE[activity.weather] ?? BIOME_TYPE_MAP[activity.biome] ?? 'Earth';
}

function pickWildName(type: string): string {
  const pool = WILD_NAMES[type] ?? ['Wildex'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function runWildChallenge(
  userId: string,
  remnon: RemnonForBattle,
  activityId: string,
  activity: ActivitySnapshot,
  supabase: SupabaseClient,
  battleMode: 'damage' | 'hp' = 'damage'
): Promise<ChallengeResult> {
  const wildType  = pickWildType(activity);
  const wildName  = pickWildName(wildType);
  const wildLevel = Math.min(Math.floor(activity.distance_km * 2), 50);
  const wildHpMax = 30 + wildLevel * 3;
  const wildAtk   = 8  + wildLevel * 0.8;
  const wildDef   = 4  + wildLevel * 0.5;

  const wildSkillPool = WILD_SKILLS[wildType] ?? [{ name: 'Tackle', power: 20 }];

  // Player HP
  const playerHpMax = 50 + remnon.attack_power + remnon.defense_power + remnon.speed_power;

  // Build an ordered list of usable player skills (highest power first, must have charges)
  const playerSkillQueue = remnon.skills
    .map(rs => {
      const def = SKILLS.find(s => s.id === rs.skill_id);
      return def && rs.charges > 0 ? def : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.power - a!.power) as typeof SKILLS;

  const basicAttack = { id: 'basic', name: 'Basic Strike', icon: '👊', skillType: 'attack' as const, power: 12, maxCharges: 99, kmPerCharge: 0, rarity: 'common' as const, elementTypes: ['Universal'], description: '' };

  let playerHp = playerHpMax;
  let wildHp   = wildHpMax;
  const battleLog: BattleRound[] = [];

  // HP mode: fight until someone hits 0 (cap at 15 rounds to prevent infinite loops)
  // Damage mode: fixed 3 rounds
  const maxRounds = battleMode === 'hp' ? 15 : 3;

  for (let round = 0; round < maxRounds && playerHp > 0 && wildHp > 0; round++) {
    // Player picks
    const skill = playerSkillQueue[round % Math.max(1, playerSkillQueue.length)] ?? basicAttack;

    // Calculate player damage
    let playerDmg: number;
    switch (skill.skillType) {
      case 'attack':
        playerDmg = Math.max(5, Math.round(remnon.attack_power * skill.power / 100 - wildDef * 0.3));
        break;
      case 'defense':
        playerDmg = Math.max(2, Math.round(remnon.attack_power * skill.power / 200));
        break;
      case 'speed':
        playerDmg = Math.max(3, Math.round(remnon.attack_power * skill.power * 0.7 / 100));
        break;
      default: // special
        playerDmg = Math.max(8, Math.round(remnon.attack_power * skill.power * 1.2 / 100 - wildDef * 0.2));
    }
    wildHp -= playerDmg;

    // Wild picks
    const wildSkill = wildSkillPool[Math.floor(Math.random() * wildSkillPool.length)];
    let wildDmg = Math.max(3, Math.round(wildAtk * wildSkill.power / 100 - remnon.defense_power * 0.3));

    // Defense skill = halve incoming; speed skill = 50% dodge
    if (skill.skillType === 'defense') wildDmg = Math.floor(wildDmg * 0.5);
    if (skill.skillType === 'speed'  && Math.random() < 0.5) wildDmg = 0;
    playerHp -= wildDmg;

    battleLog.push({
      playerSkillName: skill.name,
      playerDamage: playerDmg,
      wildSkillName: wildSkill.name,
      wildDamage: wildDmg,
      playerHpAfter: Math.max(0, playerHp),
      wildHpAfter:   Math.max(0, wildHp),
    });
  }

  // Outcome: configurable by battleMode
  let outcome: 'win' | 'loss';
  if (battleMode === 'hp') {
    // Fight ran until someone hit 0 (or hit 15-round cap).
    // Win if wild HP is at/below 0, or your remnon has more HP% left (cap tiebreaker)
    const playerHpPct = Math.max(0, playerHp) / playerHpMax;
    const wildHpPct   = Math.max(0, wildHp)   / wildHpMax;
    outcome = wildHp <= 0 || playerHpPct > wildHpPct ? 'win' : 'loss';
  } else {
    // Win if your remnon dealt more total damage
    const totalPlayerDmg = battleLog.reduce((sum, r) => sum + r.playerDamage, 0);
    const totalWildDmg   = battleLog.reduce((sum, r) => sum + r.wildDamage,   0);
    outcome = totalPlayerDmg >= totalWildDmg ? 'win' : 'loss';
  }

  const expReward = outcome === 'win' ? Math.round(10 + wildLevel * 3) : 0;

  // Fetch remnon for EXP/loyalty mutation
  const { data: remnonRow } = await supabase
    .from('remnons')
    .select('current_exp, total_exp, loyalty')
    .eq('id', remnon.id)
    .single();

  let expLost = 0;
  let loyaltyLost = 0;

  if (remnonRow) {
    if (outcome === 'win') {
      // Award EXP on win
      await supabase
        .from('remnons')
        .update({
          current_exp: remnonRow.current_exp + expReward,
          total_exp:   remnonRow.total_exp   + expReward,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', remnon.id);
    } else {
      // Penalise on loss: drain 5% tier-progress EXP + 5 loyalty
      expLost     = Math.floor(remnonRow.current_exp * 0.05);
      loyaltyLost = 5;
      const newCurrentExp = Math.max(0, remnonRow.current_exp - expLost);
      const newLoyalty    = Math.max(0, (remnonRow.loyalty ?? 50) - loyaltyLost);
      await supabase
        .from('remnons')
        .update({
          current_exp: newCurrentExp,
          loyalty:     newLoyalty,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', remnon.id);
    }
  }

  // 20% chance to discover a new skill on win
  let newSkillName: string | null = null;
  if (outcome === 'win' && Math.random() < 0.20) {
    const result = await grantRandomSkill(remnon.id, remnon.primary_type, remnon.secondary_type, 'challenge', supabase);
    newSkillName = result?.skillName ?? null;
  }

  // Persist wild challenge record
  await supabase.from('wild_challenges').insert({
    user_id:     userId,
    remnon_id:   remnon.id,
    activity_id: activityId,
    wild_name:   wildName,
    wild_type:   wildType,
    wild_level:  wildLevel,
    outcome,
    exp_reward:  expReward,
    new_skill_id: outcome === 'win' && newSkillName ? newSkillName : null,
    battle_log:  battleLog,
  });

  return { wildName, wildType, wildLevel, outcome, expReward, expLost, loyaltyLost, newSkillName, battleLog, playerHpMax, wildHpMax, remnon: { name: remnon.name, primary_type: remnon.primary_type, evolution_tier: remnon.evolution_tier }, battle_mode: battleMode };
}
