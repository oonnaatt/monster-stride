// DEMO MODE: 100km threshold — production value: 10000km
export const HATCHING_THRESHOLD_KM = 100;

// DEMO MODE: 50km incubation window — production value: 1000km
export const INCUBATION_WINDOW_KM = 50;

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
