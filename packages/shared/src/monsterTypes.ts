export const PRIMARY_TYPES = [
  'Fire', 'Water', 'Earth', 'Wind', 'Electric', 'Nature',
  'Ice', 'Shadow', 'Light', 'Mecha', 'Fog', 'Nocturnal', 'Void'
] as const;

export type RemnonType = typeof PRIMARY_TYPES[number];

export const TYPE_BASE_STATS: Record<RemnonType, { attack: number; defense: number; speed: number }> = {
  Fire:      { attack: 15, defense: 10, speed: 13 },
  Water:     { attack: 10, defense: 10, speed: 10 },
  Earth:     { attack: 10, defense: 15, speed: 10 },
  Wind:      { attack: 10, defense: 10, speed: 15 },
  Electric:  { attack: 14, defense: 10, speed: 12 },
  Nature:    { attack: 10, defense: 12, speed: 10 },
  Ice:       { attack: 10, defense: 13, speed: 10 },
  Shadow:    { attack: 13, defense: 10, speed: 10 },
  Light:     { attack: 10, defense: 10, speed: 10 },
  Mecha:     { attack: 10, defense: 14, speed: 10 },
  Fog:       { attack: 10, defense: 10, speed: 10 },
  Nocturnal: { attack: 10, defense: 10, speed: 14 },
  Void:      { attack: 14, defense: 10, speed: 10 },
};

export const FANTASY_SUFFIXES = [
  'thorn', 'fang', 'blaze', 'mist', 'stone', 'gale', 'frost', 'shade',
  'ember', 'tide', 'claw', 'wing', 'spark', 'veil', 'drift', 'surge',
  'bolt', 'ash', 'gleam', 'hollow'
];
