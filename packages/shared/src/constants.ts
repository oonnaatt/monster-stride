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
