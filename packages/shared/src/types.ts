export type Pace = 'walk' | 'jog' | 'run' | 'sprint';
export type Biome = 'urban' | 'forest' | 'mountain' | 'coastal' | 'desert' | 'suburban';
export type Weather = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'thunderstorm' | 'snow' | 'fog';
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type EvolutionTier = 'Hatchling' | 'Juvenile' | 'Adult' | 'Elder' | 'Ascended';

export interface Activity {
  id: string;
  user_id: string;
  distance_km: number;
  pace: Pace;
  biome: Biome;
  weather: Weather;
  time_of_day: TimeOfDay;
  season: Season;
  elevation_gain_m: number;
  logged_at: string;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  user_id: string;
  total_km: number;
  current_egg_km: number;
  streak_days: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Remnon {
  id: string;
  user_id: string;
  name: string | null;
  primary_type: string;
  secondary_type: string | null;
  tertiary_type: string | null;
  traits: string[];
  evolution_tier: EvolutionTier;
  current_exp: number;
  total_exp: number;
  birth_pace: Pace;
  birth_biome: Biome;
  birth_weather: Weather;
  birth_time_of_day: TimeOfDay;
  birth_season: Season;
  attack_power: number;
  defense_power: number;
  speed_power: number;
  loyalty: number;
  theme_song: { title: string; artist: string; vibe: string; searchQuery: string } | null;
  hatched_at: string;
  created_at: string;
  updated_at: string;
}

export interface LogActivityRequest {
  distance_km: number;
  pace: Pace;
  biome: Biome;
  weather: Weather;
  time_of_day: TimeOfDay;
  season: Season;
  elevation_gain_m?: number;
  battle_mode?: 'damage' | 'hp';
}

export interface RemnonSkill {
  id: string;
  remnon_id: string;
  skill_id: string;
  charges: number;
  max_charges: number;
  discovered_from: 'hatch' | 'evolution' | 'mission' | 'challenge';
  created_at: string;
}

export interface BattleRound {
  playerSkillName: string;
  playerDamage: number;
  wildSkillName: string;
  wildDamage: number;
  playerHpAfter: number;
  wildHpAfter: number;
}

export interface ChallengeResult {
  wildName: string;
  wildType: string;
  wildLevel: number;
  outcome: 'win' | 'loss';
  expReward: number;
  expLost: number;       // > 0 only on loss
  loyaltyLost: number;   // > 0 only on loss
  newSkillName: string | null;
  battleLog: BattleRound[];
  playerHpMax: number;
  wildHpMax: number;
  remnon: { name: string | null; primary_type: string; evolution_tier: string };
  battle_mode: 'damage' | 'hp';
}

export interface CompletedMission {
  missionTitle: string;
  expAwarded: number;
  remnonId: string;
}

export interface LogActivityResponse {
  activity: Activity;
  playerStats: PlayerStats;
  hatchedRemnon?: Remnon;
  expGained?: number;
  evolutionEvent?: string;
  evolvedRemnon?: { id: string; name: string | null; primary_type: string; evolution_tier: string };
  completedMissions?: CompletedMission[];
  challengeResult?: ChallengeResult;
  newSkills?: Array<{ remnonId: string; skillId: string; skillName: string; discoveredFrom: string }>;
}
