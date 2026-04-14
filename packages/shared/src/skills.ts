export type SkillType = 'attack' | 'defense' | 'speed' | 'special';
export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillType: SkillType;
  power: number;        // 10–100, interpreted by battle engine
  maxCharges: number;   // 1–3
  kmPerCharge: number;  // km to regenerate 1 charge
  rarity: SkillRarity;
  elementTypes: string[]; // 'Universal' or specific remnon types
}

export const SKILLS: SkillDef[] = [
  // ── Fire ──────────────────────────────────────────────────────────────────
  { id: 'fire_ember',     name: 'Ember',           icon: '🔥', skillType: 'attack',  power: 25,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Fire'],            description: 'A small burst of flame scorches the target.' },
  { id: 'fire_flare',     name: 'Flare Strike',    icon: '💥', skillType: 'attack',  power: 62,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Fire'],            description: 'An intense flash of blazing heat detonates on contact.' },
  { id: 'fire_inferno',   name: 'Inferno',         icon: '🌋', skillType: 'special', power: 95,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Fire', 'Electric'], description: 'Unleashes a catastrophic firestorm.' },

  // ── Water ─────────────────────────────────────────────────────────────────
  { id: 'water_splash',   name: 'Splash',          icon: '💧', skillType: 'attack',  power: 20,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Water'],           description: 'A refreshing burst of water stings the foe.' },
  { id: 'water_veil',     name: 'Water Veil',      icon: '🛡️', skillType: 'defense', power: 55,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Water', 'Ice'],    description: 'Envelops in a protective water shield, absorbing blows.' },
  { id: 'water_tsunami',  name: 'Tsunami',         icon: '🌊', skillType: 'special', power: 95,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Water'],           description: 'A colossal wave obliterates everything in its path.' },

  // ── Earth ─────────────────────────────────────────────────────────────────
  { id: 'earth_toss',     name: 'Rock Toss',       icon: '🪨', skillType: 'attack',  power: 28,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Earth'],           description: 'Hurls a jagged boulder with brute force.' },
  { id: 'earth_tremor',   name: 'Tremor',          icon: '⛰️', skillType: 'attack',  power: 60,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Earth'],           description: 'Cracks the ground with seismic force.' },
  { id: 'earth_quake',    name: 'Earthquake',      icon: '🌍', skillType: 'special', power: 90,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Earth', 'Nature'], description: 'The earth itself tears apart beneath the foe.' },

  // ── Wind ──────────────────────────────────────────────────────────────────
  { id: 'wind_gust',      name: 'Gust',            icon: '🌬️', skillType: 'speed',   power: 25,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Wind'],            description: 'A sharp burst of wind catches the foe off guard.' },
  { id: 'wind_cyclone',   name: 'Cyclone',         icon: '🌪️', skillType: 'attack',  power: 60,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Wind'],            description: 'A spinning vortex tears through the enemy.' },
  { id: 'wind_hurricane', name: 'Hurricane',       icon: '🌀', skillType: 'special', power: 92,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Wind', 'Electric'], description: 'A devastating storm levels everything in its path.' },

  // ── Electric ──────────────────────────────────────────────────────────────
  { id: 'elec_zap',       name: 'Zap',             icon: '⚡', skillType: 'attack',  power: 28,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Electric'],        description: 'A quick electric shock jolts the target.' },
  { id: 'elec_bolt',      name: 'Thunderbolt',     icon: '🌩️', skillType: 'attack',  power: 65,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Electric'],        description: 'A crackling lightning strike hits dead-on.' },
  { id: 'elec_storm',     name: 'Lightning Storm', icon: '🌟', skillType: 'special', power: 98,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Electric', 'Fire'], description: 'A tempest of pure electricity descends from the sky.' },

  // ── Nature ────────────────────────────────────────────────────────────────
  { id: 'nat_vine',       name: 'Vine Whip',       icon: '🌿', skillType: 'attack',  power: 25,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Nature'],          description: 'Lashes out with thorny vines.' },
  { id: 'nat_overgrow',   name: 'Overgrowth',      icon: '🌳', skillType: 'defense', power: 55,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Nature'],          description: 'Dense foliage absorbs the next blow.' },
  { id: 'nat_wrath',      name: "Nature's Wrath",  icon: '🌱', skillType: 'special', power: 88,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Nature', 'Earth'], description: 'The wild itself rises up in pure fury.' },

  // ── Ice ───────────────────────────────────────────────────────────────────
  { id: 'ice_bite',       name: 'Frost Bite',      icon: '❄️', skillType: 'attack',  power: 25,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Ice'],             description: 'A nipping cold saps the foe\'s strength.' },
  { id: 'ice_shard',      name: 'Ice Shard',       icon: '🧊', skillType: 'attack',  power: 60,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Ice'],             description: 'Sharp shards of ice pierce the enemy.' },
  { id: 'ice_blizzard',   name: 'Blizzard',        icon: '🌨️', skillType: 'special', power: 92,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Ice', 'Wind'],     description: 'A whiteout storm buries everything in its path.' },

  // ── Shadow ────────────────────────────────────────────────────────────────
  { id: 'shad_slash',     name: 'Shadow Slash',    icon: '🌑', skillType: 'attack',  power: 28,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Shadow'],          description: 'A claw of darkness rakes across the target.' },
  { id: 'shad_pulse',     name: 'Dark Pulse',      icon: '👁️', skillType: 'special', power: 65,  maxCharges: 2, kmPerCharge: 5,  rarity: 'epic',      elementTypes: ['Shadow', 'Void'],  description: 'A pulse of dark energy disrupts the foe\'s form.' },
  { id: 'shad_rift',      name: 'Void Rift',       icon: '🕳️', skillType: 'special', power: 98,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Shadow', 'Nocturnal'], description: 'Tears open a rift in reality, obliterating the enemy.' },

  // ── Light ─────────────────────────────────────────────────────────────────
  { id: 'light_flash',    name: 'Flash',           icon: '✨', skillType: 'speed',   power: 22,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Light'],           description: 'A dazzling burst blinds and confuses the foe.' },
  { id: 'light_radiance', name: 'Radiance',        icon: '☀️', skillType: 'defense', power: 55,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Light'],           description: 'A brilliant aura deflects incoming strikes.' },
  { id: 'light_beam',     name: 'Divine Beam',     icon: '💫', skillType: 'special', power: 92,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Light', 'Fire'],   description: 'A focused beam of pure holy light obliterates the foe.' },

  // ── Mecha ─────────────────────────────────────────────────────────────────
  { id: 'mech_claw',      name: 'Metal Claw',      icon: '🤖', skillType: 'attack',  power: 30,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Mecha'],           description: 'Steel claws rake across the target with precision.' },
  { id: 'mech_gear',      name: 'Gear Strike',     icon: '⚙️', skillType: 'attack',  power: 65,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Mecha'],           description: 'A spinning gear cuts through armor and flesh.' },
  { id: 'mech_overload',  name: 'System Overload', icon: '🚀', skillType: 'special', power: 98,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Mecha', 'Electric'], description: 'An all-systems critical strike that can\'t be stopped.' },

  // ── Fog ───────────────────────────────────────────────────────────────────
  { id: 'fog_haze',       name: 'Haze',            icon: '🌫️', skillType: 'speed',   power: 22,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Fog'],             description: 'A disorienting haze makes the foe miss.' },
  { id: 'fog_veil',       name: 'Mist Veil',       icon: '💨', skillType: 'defense', power: 55,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Fog', 'Water'],    description: 'A thick mist shroud absorbs attacks.' },
  { id: 'fog_phantom',    name: 'Phantom Shroud',  icon: '👻', skillType: 'special', power: 85,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Fog', 'Shadow'],   description: 'Becomes one with the mist, striking from everywhere at once.' },

  // ── Nocturnal ─────────────────────────────────────────────────────────────
  { id: 'noct_slash',     name: 'Night Slash',     icon: '🌙', skillType: 'attack',  power: 28,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Nocturnal'],       description: 'A swift claw strike under the cover of night.' },
  { id: 'noct_lunar',     name: 'Lunar Smash',     icon: '🌕', skillType: 'attack',  power: 65,  maxCharges: 2, kmPerCharge: 5,  rarity: 'rare',      elementTypes: ['Nocturnal', 'Light'], description: 'Channels the full moon\'s power into a crushing blow.' },
  { id: 'noct_eclipse',   name: 'Eclipse',         icon: '🌒', skillType: 'special', power: 95,  maxCharges: 1, kmPerCharge: 10, rarity: 'legendary', elementTypes: ['Nocturnal', 'Shadow'], description: 'Blocks out the sun itself to crush the enemy.' },

  // ── Void ──────────────────────────────────────────────────────────────────
  { id: 'void_rip',       name: 'Dimensional Rip', icon: '🌀', skillType: 'attack',  power: 48,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Void'],            description: 'Tears a hole in space to strike from within.' },
  { id: 'void_entropy',   name: 'Entropy',         icon: '⬛', skillType: 'special', power: 75,  maxCharges: 2, kmPerCharge: 6,  rarity: 'epic',      elementTypes: ['Void', 'Shadow'],  description: 'Dissolves the foe\'s form with pure nothingness.' },
  { id: 'void_oblivion',  name: 'Oblivion',        icon: '💀', skillType: 'special', power: 100, maxCharges: 1, kmPerCharge: 12, rarity: 'legendary', elementTypes: ['Void'],            description: 'The ultimate void skill — erases the target from existence.' },

  // ── Universal (any type can learn) ────────────────────────────────────────
  { id: 'uni_strike',     name: 'Quick Strike',    icon: '👊', skillType: 'attack',  power: 15,  maxCharges: 3, kmPerCharge: 1,  rarity: 'common',    elementTypes: ['Universal'],       description: 'A fast, basic strike. Reliable and always ready.' },
  { id: 'uni_guard',      name: 'Iron Guard',      icon: '🛡️', skillType: 'defense', power: 35,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Universal'],       description: 'Braces for impact, significantly reducing damage.' },
  { id: 'uni_dash',       name: 'Swift Dash',      icon: '💨', skillType: 'speed',   power: 30,  maxCharges: 3, kmPerCharge: 2,  rarity: 'common',    elementTypes: ['Universal'],       description: 'Dashes forward with incredible speed.' },
  { id: 'uni_cry',        name: 'Battle Cry',      icon: '📣', skillType: 'special', power: 50,  maxCharges: 2, kmPerCharge: 4,  rarity: 'rare',      elementTypes: ['Universal'],       description: 'A rallying cry that boosts fighting spirit for a powerful hit.' },
  { id: 'uni_endure',     name: 'Endure',          icon: '💪', skillType: 'defense', power: 70,  maxCharges: 1, kmPerCharge: 6,  rarity: 'epic',      elementTypes: ['Universal'],       description: 'Pushes through any amount of damage with sheer willpower.' },
];

export const SKILL_RARITY_WEIGHT: Record<SkillRarity, number> = {
  common:    50,
  rare:      30,
  epic:      15,
  legendary: 5,
};

export function getSkillsForType(primaryType: string, secondaryType?: string | null): SkillDef[] {
  return SKILLS.filter(s =>
    s.elementTypes.includes('Universal') ||
    s.elementTypes.includes(primaryType) ||
    (secondaryType != null && s.elementTypes.includes(secondaryType))
  );
}
