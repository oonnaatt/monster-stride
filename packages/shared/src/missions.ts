export type MissionType =
  | 'single_distance'
  | 'single_pace'
  | 'single_elevation'
  | 'single_time_of_day'
  | 'single_biome'
  | 'single_weather'
  | 'streak'
  | 'weekly_km';

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: MissionType;
  targetValue: number | string;
  expReward: number;
  difficulty: MissionDifficulty;
}

export const MISSIONS: MissionDef[] = [
  // ── Distance ────────────────────────────────────────────────────────────
  { id: 'dist_1k',  title: 'First Steps',      description: 'Log a 1km activity in one session',  icon: '👟', type: 'single_distance', targetValue: 1,   expReward: 50,    difficulty: 'easy' },
  { id: 'dist_5k',  title: '5K Runner',         description: 'Log a 5km activity in one session',  icon: '🏃', type: 'single_distance', targetValue: 5,   expReward: 200,   difficulty: 'easy' },
  { id: 'dist_10k', title: '10K Warrior',       description: 'Log a 10km activity in one session', icon: '⚡', type: 'single_distance', targetValue: 10,  expReward: 500,   difficulty: 'medium' },
  { id: 'dist_21k', title: 'Half-Marathoner',   description: 'Log a 21km activity in one session', icon: '🔥', type: 'single_distance', targetValue: 21,  expReward: 1000,  difficulty: 'hard' },
  { id: 'dist_42k', title: 'Full Marathon',     description: 'Log a 42km activity in one session', icon: '🏆', type: 'single_distance', targetValue: 42,  expReward: 2500,  difficulty: 'legendary' },

  // ── Pace ─────────────────────────────────────────────────────────────────
  { id: 'pace_walk',   title: 'Easy Walker',   description: 'Log an activity at walk pace',   icon: '🚶', type: 'single_pace', targetValue: 'walk',   expReward: 50,  difficulty: 'easy' },
  { id: 'pace_jog',    title: 'Steady Jogger', description: 'Log an activity at jog pace',    icon: '🌿', type: 'single_pace', targetValue: 'jog',    expReward: 100, difficulty: 'easy' },
  { id: 'pace_run',    title: 'Full Runner',   description: 'Log an activity at run pace',    icon: '💨', type: 'single_pace', targetValue: 'run',    expReward: 200, difficulty: 'medium' },
  { id: 'pace_sprint', title: 'Speed Demon',   description: 'Log an activity at sprint pace', icon: '⚡', type: 'single_pace', targetValue: 'sprint', expReward: 350, difficulty: 'hard' },

  // ── Elevation ────────────────────────────────────────────────────────────
  { id: 'elev_100',  title: 'Hill Climber',   description: 'Gain 100m elevation in one activity',  icon: '⛰️', type: 'single_elevation', targetValue: 100,  expReward: 300,  difficulty: 'medium' },
  { id: 'elev_500',  title: 'Summit Seeker',  description: 'Gain 500m elevation in one activity',  icon: '🏔️', type: 'single_elevation', targetValue: 500,  expReward: 800,  difficulty: 'hard' },
  { id: 'elev_1000', title: 'Peak Conqueror', description: 'Gain 1000m elevation in one activity', icon: '🌋', type: 'single_elevation', targetValue: 1000, expReward: 2000, difficulty: 'legendary' },

  // ── Time of day ──────────────────────────────────────────────────────────
  { id: 'time_dawn',     title: 'Dawn Patrol',     description: 'Log an activity at dawn',     icon: '🌅', type: 'single_time_of_day', targetValue: 'dawn',     expReward: 200, difficulty: 'easy' },
  { id: 'time_noon',     title: 'Sun Chaser',       description: 'Log an activity at high noon', icon: '☀️', type: 'single_time_of_day', targetValue: 'noon',     expReward: 150, difficulty: 'easy' },
  { id: 'time_night',    title: 'Night Owl',        description: 'Log an activity at night',    icon: '🌙', type: 'single_time_of_day', targetValue: 'night',    expReward: 200, difficulty: 'medium' },
  { id: 'time_midnight', title: 'Midnight Runner',  description: 'Log an activity at midnight', icon: '🌑', type: 'single_time_of_day', targetValue: 'midnight', expReward: 300, difficulty: 'medium' },

  // ── Biome ────────────────────────────────────────────────────────────────
  { id: 'biome_urban',    title: 'City Strider',      description: 'Run in an urban biome',    icon: '🏙️', type: 'single_biome', targetValue: 'urban',    expReward: 100, difficulty: 'easy' },
  { id: 'biome_forest',   title: 'Forest Wanderer',   description: 'Run through a forest',     icon: '🌲', type: 'single_biome', targetValue: 'forest',   expReward: 200, difficulty: 'easy' },
  { id: 'biome_mountain', title: 'Mountain Explorer', description: 'Run in a mountain biome',  icon: '⛰️', type: 'single_biome', targetValue: 'mountain', expReward: 200, difficulty: 'easy' },
  { id: 'biome_coastal',  title: 'Wave Rider',        description: 'Run in a coastal biome',   icon: '🌊', type: 'single_biome', targetValue: 'coastal',  expReward: 200, difficulty: 'easy' },
  { id: 'biome_desert',   title: 'Desert Nomad',      description: 'Run through the desert',   icon: '🏜️', type: 'single_biome', targetValue: 'desert',   expReward: 250, difficulty: 'medium' },

  // ── Weather ──────────────────────────────────────────────────────────────
  { id: 'weather_fog',   title: 'Fog Walker',      description: 'Run through the fog',   icon: '🌫️', type: 'single_weather', targetValue: 'fog',   expReward: 200, difficulty: 'easy' },
  { id: 'weather_rain',  title: 'Rain Dancer',     description: 'Run in the rain',       icon: '🌧️', type: 'single_weather', targetValue: 'rain',  expReward: 200, difficulty: 'easy' },
  { id: 'weather_snow',  title: 'Blizzard Strider',description: 'Run in the snow',       icon: '❄️', type: 'single_weather', targetValue: 'snow',  expReward: 300, difficulty: 'medium' },
  { id: 'weather_storm', title: 'Storm Runner',    description: 'Run through a storm',   icon: '🌩️', type: 'single_weather', targetValue: 'storm', expReward: 350, difficulty: 'hard' },

  // ── Streak ───────────────────────────────────────────────────────────────
  { id: 'streak_3',  title: '3-Day Streak',   description: 'Run 3 days in a row',  icon: '🔥', type: 'streak', targetValue: 3,  expReward: 400,   difficulty: 'easy' },
  { id: 'streak_7',  title: 'Week Warrior',   description: 'Run 7 days in a row',  icon: '⭐', type: 'streak', targetValue: 7,  expReward: 1500,  difficulty: 'hard' },
  { id: 'streak_30', title: 'Monthly Legend', description: 'Run 30 days in a row', icon: '👑', type: 'streak', targetValue: 30, expReward: 10000, difficulty: 'legendary' },

  // ── Weekly km ────────────────────────────────────────────────────────────
  { id: 'weekly_20k',  title: 'Weekly Wanderer', description: 'Log 20km total this week',  icon: '📅', type: 'weekly_km', targetValue: 20,  expReward: 500,  difficulty: 'easy' },
  { id: 'weekly_50k',  title: 'Weekly Grinder',  description: 'Log 50km total this week',  icon: '💪', type: 'weekly_km', targetValue: 50,  expReward: 1500, difficulty: 'hard' },
  { id: 'weekly_100k', title: 'Weekly Legend',   description: 'Log 100km total this week', icon: '🏆', type: 'weekly_km', targetValue: 100, expReward: 5000, difficulty: 'legendary' },
];
