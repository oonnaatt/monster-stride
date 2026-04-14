import type { SupabaseClient } from '@supabase/supabase-js';
import type { Monster, Activity } from '../types/index';
import type { MonsterType } from '@monster-stride/shared';
import { FANTASY_SUFFIXES, TYPE_BASE_STATS } from '@monster-stride/shared';

// DEMO: 50km incubation window — production value: 1000km
const INCUBATION_WINDOW_KM = 50;

function getTypeScores(activities: Activity[]): Map<MonsterType, number> {
  const scores = new Map<MonsterType, number>();

  const addScore = (type: MonsterType, amount: number) => {
    scores.set(type, (scores.get(type) ?? 0) + amount);
  };

  for (const act of activities) {
    const w = act.distance_km;

    // Biome
    const biomeMap: Record<string, MonsterType> = {
      forest: 'Nature', urban: 'Mecha', coastal: 'Water',
      mountain: 'Earth', desert: 'Fire', suburban: 'Light',
    };
    if (biomeMap[act.biome]) addScore(biomeMap[act.biome], w);

    // Weather
    if (act.weather === 'rain') addScore('Water', w);
    if (act.weather === 'storm') addScore('Water', w);
    if (act.weather === 'thunderstorm') addScore('Electric', w);
    if (act.weather === 'sunny') addScore('Fire', w);
    if (act.weather === 'snow') addScore('Ice', w);
    if (act.weather === 'fog') addScore('Fog', w);
    if (act.weather === 'cloudy') addScore('Wind', w);

    // Time of day
    if (act.time_of_day === 'dawn') addScore('Fog', w);
    if (act.time_of_day === 'morning') addScore('Light', w);
    if (act.time_of_day === 'noon') addScore('Fire', w);
    if (act.time_of_day === 'afternoon') addScore('Fire', w);
    if (act.time_of_day === 'dusk') addScore('Shadow', w);
    if (act.time_of_day === 'night') addScore('Nocturnal', w);
    if (act.time_of_day === 'midnight') addScore('Shadow', w);

    // Pace
    if (act.pace === 'walk') addScore('Earth', w);
    if (act.pace === 'jog') addScore('Wind', w);
    if (act.pace === 'run') addScore('Fire', w);
    if (act.pace === 'sprint') addScore('Electric', w);

    // Season
    if (act.season === 'summer') addScore('Fire', w);
    if (act.season === 'winter') addScore('Ice', w);
    if (act.season === 'spring') addScore('Nature', w);
    if (act.season === 'autumn') addScore('Shadow', w);
  }

  return scores;
}

function determineTraits(activities: Activity[]): string[] {
  const traits: string[] = [];
  const total = activities.length;
  if (total === 0) return traits;

  // Storm-Touched: mostly rain/storm/thunderstorm weather
  const stormCount = activities.filter(a =>
    ['rain', 'storm', 'thunderstorm'].includes(a.weather)
  ).length;
  if (stormCount / total > 0.5) traits.push('Storm-Touched');

  // Lone Wolf: >50% night/midnight
  const nightCount = activities.filter(a =>
    ['night', 'midnight'].includes(a.time_of_day)
  ).length;
  if (nightCount / total > 0.5) traits.push('Lone Wolf');

  // Steadfast: all activities same pace
  const paces = new Set(activities.map(a => a.pace));
  if (paces.size === 1) traits.push('Steadfast');

  // Sprinter: any sprint activities
  if (activities.some(a => a.pace === 'sprint')) traits.push('Sprinter');

  // Early Riser: >50% morning/dawn
  const morningCount = activities.filter(a =>
    ['morning', 'dawn'].includes(a.time_of_day)
  ).length;
  if (morningCount / total > 0.5) traits.push('Early Riser');

  // Wanderer: activities in 3+ different biomes
  const biomes = new Set(activities.map(a => a.biome));
  if (biomes.size >= 3) traits.push('Wanderer');

  // Summit Seeker: elevation_gain_m > 500 total
  const totalElevation = activities.reduce((sum, a) => sum + (a.elevation_gain_m ?? 0), 0);
  if (totalElevation > 500) traits.push('Summit Seeker');

  // Relentless: >50% run pace
  const runCount = activities.filter(a => a.pace === 'run').length;
  if (runCount / total > 0.5) traits.push('Relentless');

  return traits;
}

function calculateStats(types: MonsterType[]): { attack: number; defense: number; speed: number } {
  if (types.length === 0) return { attack: 10, defense: 10, speed: 10 };

  const totals = types.reduce(
    (acc, type) => {
      const stats = TYPE_BASE_STATS[type];
      return {
        attack: acc.attack + stats.attack,
        defense: acc.defense + stats.defense,
        speed: acc.speed + stats.speed,
      };
    },
    { attack: 0, defense: 0, speed: 0 }
  );

  return {
    attack: Math.round(totals.attack / types.length),
    defense: Math.round(totals.defense / types.length),
    speed: Math.round(totals.speed / types.length),
  };
}

function generateMonsterName(primaryType: MonsterType): string {
  const suffix = FANTASY_SUFFIXES[Math.floor(Math.random() * FANTASY_SUFFIXES.length)];
  return `${primaryType}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
}

export async function hatchMonster(userId: string, supabase: SupabaseClient): Promise<Monster> {
  // Fetch activities for this user, enough to cover the incubation window
  const { data: allActivities, error: fetchError } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(500);

  if (fetchError) throw new Error(`Failed to fetch activities: ${fetchError.message}`);

  // Collect up to INCUBATION_WINDOW_KM of activities (most recent first)
  const incubationActivities: Activity[] = [];
  let accumulated = 0;
  for (const act of (allActivities ?? [])) {
    if (accumulated >= INCUBATION_WINDOW_KM) break;
    incubationActivities.push(act as Activity);
    accumulated += Number(act.distance_km);
  }

  // Calculate type scores
  const scores = getTypeScores(incubationActivities);
  const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);

  // Normalize and sort
  const sorted = Array.from(scores.entries())
    .map(([type, score]) => ({ type, score, pct: totalScore > 0 ? score / totalScore : 0 }))
    .filter(e => e.pct >= 0.10)
    .sort((a, b) => b.score - a.score);

  // Determine types
  let types: MonsterType[];
  if (sorted.length === 0) {
    types = ['Earth'];
  } else if (sorted[0].pct > 0.60) {
    types = [sorted[0].type];
  } else {
    types = sorted.slice(0, 3).map(e => e.type);
  }

  // Determine birth context from most recent activity
  const latest = incubationActivities[0] ?? {
    pace: 'walk', biome: 'urban', weather: 'sunny', time_of_day: 'morning', season: 'spring',
  };

  const traits = determineTraits(incubationActivities);
  const stats = calculateStats(types);
  const name = generateMonsterName(types[0]);

  const monsterData = {
    user_id: userId,
    name,
    primary_type: types[0],
    secondary_type: types[1] ?? null,
    tertiary_type: types[2] ?? null,
    traits,
    evolution_tier: 'Hatchling',
    current_exp: 0,
    total_exp: 0,
    birth_pace: latest.pace,
    birth_biome: latest.biome,
    birth_weather: latest.weather,
    birth_time_of_day: latest.time_of_day,
    birth_season: latest.season,
    attack_power: stats.attack,
    defense_power: stats.defense,
    speed_power: stats.speed,
    hatched_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('monsters')
    .insert(monsterData)
    .select()
    .single();

  if (error) throw new Error(`Failed to hatch monster: ${error.message}`);
  return data as Monster;
}
