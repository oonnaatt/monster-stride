export const HATCHING_THRESHOLD_KM = 20;

export const INCUBATION_WINDOW_KM = 20;

export const EXP_THRESHOLDS = {
  Hatchling: 0,
  Juvenile: 1000,
  Adult: 5000,
  Elder: 15000,
  Ascended: 50000,
} as const;

export const EVOLUTION_TIERS = ['Hatchling', 'Juvenile', 'Adult', 'Elder', 'Ascended'] as const;

export const EVOLUTION_STAT_BOOSTS: Record<string, number> = {
  'Hatchling→Juvenile': 3,
  'Juvenile→Adult': 5,
  'Adult→Elder': 8,
  'Elder→Ascended': 15,
};

export const PACE_ORDER = ['walk', 'jog', 'run', 'sprint'] as const;

export const EXP_PACE_MULTIPLIERS = {
  exactMatch: 1.0,
  oneStepOff: 0.6,
  twoOrMoreOff: 0.25,
} as const;

export const EXP_BIOME_BONUS = 1.25;
export const EXP_WEATHER_BONUS = 1.10;
export const EXP_TIME_BONUS = 1.15;
export const EXP_STREAK_BONUS_PER_DAY = 0.05;
export const EXP_STREAK_BONUS_MAX = 0.50;
export const EXP_BASE_PER_KM = 10;

export const DEFAULT_STAT_VALUE = 10;

export const MIN_DISTANCE_KM = 0.1;
export const MAX_DISTANCE_KM = 500;

// Loyalty system
export const LOYALTY_INITIAL = 50;
export const LOYALTY_MAX = 100;
export const LOYALTY_MIN = 0;

// Gains per activity based on birth condition matches
export const LOYALTY_PACE_MATCH_GAIN = 8;
export const LOYALTY_BIOME_MATCH_GAIN = 4;
export const LOYALTY_WEATHER_MATCH_GAIN = 2;
export const LOYALTY_TIME_MATCH_GAIN = 2;

// Penalty when the player's streak resets
export const LOYALTY_STREAK_BREAK_PENALTY = 15;

// EXP multiplier applied based on loyalty tier
export const LOYALTY_TIERS = [
  { minLoyalty: 91, label: 'Legendary Bond', emoji: '💖', expMultiplier: 1.5 },
  { minLoyalty: 76, label: 'Devoted',         emoji: '❤️',  expMultiplier: 1.25 },
  { minLoyalty: 51, label: 'Fond',            emoji: '🧡', expMultiplier: 1.10 },
  { minLoyalty: 26, label: 'Neutral',         emoji: '🤍', expMultiplier: 1.0 },
  { minLoyalty: 0,  label: 'Defiant',         emoji: '🖤', expMultiplier: 0.75 },
] as const;
