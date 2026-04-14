export function getRemnonEmoji(primaryType: string, evolutionTier: string): string {
  const emojiMap: Record<string, Record<string, string>> = {
    Fire:      { Hatchling: '🐣🔥', Juvenile: '🦎🔥', Adult: '🐉🔥', Elder: '👹🔥', Ascended: '🌋' },
    Water:     { Hatchling: '🐣💧', Juvenile: '🐟💧', Adult: '🐬💧', Elder: '🐋💧', Ascended: '🌊' },
    Earth:     { Hatchling: '🐣🪨', Juvenile: '🐢🪨', Adult: '🦏🪨', Elder: '🗿🪨', Ascended: '⛰️' },
    Wind:      { Hatchling: '🐣🌬️', Juvenile: '🐦🌬️', Adult: '🦅🌬️', Elder: '🌪️', Ascended: '⚡🌪️' },
    Electric:  { Hatchling: '🐣⚡', Juvenile: '🐭⚡', Adult: '🦁⚡', Elder: '🐯⚡', Ascended: '⚡👾' },
    Nature:    { Hatchling: '🐣🌿', Juvenile: '🐛🌿', Adult: '🦋🌿', Elder: '🌳🌿', Ascended: '🌲✨' },
    Ice:       { Hatchling: '🐣❄️', Juvenile: '🐧❄️', Adult: '🦊❄️', Elder: '🐻‍❄️', Ascended: '🌨️✨' },
    Shadow:    { Hatchling: '🐣🌑', Juvenile: '🐈‍⬛🌑', Adult: '🦇🌑', Elder: '👁️🌑', Ascended: '🌑✨' },
    Light:     { Hatchling: '🐣✨', Juvenile: '🐇✨', Adult: '🦄✨', Elder: '👼✨', Ascended: '☀️✨' },
    Mecha:     { Hatchling: '🐣🤖', Juvenile: '🤖', Adult: '🦾🤖', Elder: '🛡️🤖', Ascended: '🚀🤖' },
    Fog:       { Hatchling: '🐣🌫️', Juvenile: '🦢🌫️', Adult: '🐘🌫️', Elder: '🌫️👁️', Ascended: '🌫️✨' },
    Nocturnal: { Hatchling: '🐣🌙', Juvenile: '🦉🌙', Adult: '🐺🌙', Elder: '🌙👁️', Ascended: '🌙✨' },
    Void:      { Hatchling: '🐣🌀', Juvenile: '🐙🌀', Adult: '🦑🌀', Elder: '👾🌀', Ascended: '🌀✨' },
  };
  return emojiMap[primaryType]?.[evolutionTier] ?? '🐣';
}

export function getTypeColor(type: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    Fire:      { bg: 'bg-orange-500', text: 'text-white' },
    Water:     { bg: 'bg-blue-500', text: 'text-white' },
    Earth:     { bg: 'bg-yellow-700', text: 'text-white' },
    Wind:      { bg: 'bg-sky-400', text: 'text-white' },
    Electric:  { bg: 'bg-yellow-400', text: 'text-black' },
    Nature:    { bg: 'bg-green-600', text: 'text-white' },
    Ice:       { bg: 'bg-cyan-300', text: 'text-black' },
    Shadow:    { bg: 'bg-purple-900', text: 'text-white' },
    Light:     { bg: 'bg-yellow-200', text: 'text-black' },
    Mecha:     { bg: 'bg-gray-600', text: 'text-white' },
    Fog:       { bg: 'bg-gray-400', text: 'text-black' },
    Nocturnal: { bg: 'bg-indigo-900', text: 'text-white' },
    Void:      { bg: 'bg-violet-950', text: 'text-white' },
  };
  return colorMap[type] ?? { bg: 'bg-gray-600', text: 'text-white' };
}

export function getTypeBadgeClass(type: string): string {
  const { bg, text } = getTypeColor(type);
  return `${bg} ${text} px-2 py-0.5 rounded-full text-xs font-semibold`;
}

export function getPersonality(primaryType: string): { description: string; icon: string } {
  const map: Record<string, { description: string; icon: string }> = {
    Fire:      { description: 'Bold and fierce — charges ahead without a second thought',           icon: '🔥' },
    Water:     { description: 'Calm and fluid — adapts to any course with effortless grace',        icon: '💧' },
    Earth:     { description: 'Steadfast and grounded — never gives up, mile after mile',           icon: '🪨' },
    Wind:      { description: 'Free-spirited and swift — always chasing the next horizon',          icon: '🌬️' },
    Electric:  { description: 'Bursting with energy — can\'t sit still for even a second',         icon: '⚡' },
    Nature:    { description: 'Peaceful and thriving — feels most alive deep in the wild',          icon: '🌿' },
    Ice:       { description: 'Cool and collected — with a fierce intensity hidden beneath',        icon: '❄️' },
    Shadow:    { description: 'Mysterious and solitary — prefers quiet nights over busy days',      icon: '🌑' },
    Light:     { description: 'Warm and radiant — inspires every runner around them',               icon: '✨' },
    Mecha:     { description: 'Calculated and precise — optimizes every single stride',             icon: '🤖' },
    Fog:       { description: 'Elusive and dreamy — thrives where others lose their way',           icon: '🌫️' },
    Nocturnal: { description: 'Introspective and sharp — truly comes alive after dark',             icon: '🌙' },
    Void:      { description: 'Boundless and enigmatic — drawn to what lies beyond the path',       icon: '🌀' },
  };
  return map[primaryType] ?? { description: 'Mysterious and full of surprises', icon: '❓' };
}

interface RemnонBirth {
  birth_pace: string;
  birth_biome: string;
  birth_weather: string;
  birth_time_of_day: string;
  birth_season: string;
}

export function getLikes(remnon: RemnонBirth): string[] {
  const biomeEmoji:   Record<string, string> = { urban: '🏙️', forest: '🌲', mountain: '⛰️', coastal: '🌊', desert: '🏜️', suburban: '🏘️' };
  const weatherEmoji: Record<string, string> = { sunny: '☀️', cloudy: '☁️', rain: '🌧️', storm: '🌩️', thunderstorm: '⛈️', snow: '❄️', fog: '🌫️' };
  const timeEmoji:    Record<string, string> = { dawn: '🌅', morning: '🌄', noon: '☀️', afternoon: '🌤️', dusk: '🌆', night: '🌙', midnight: '🌑' };
  const paceEmoji:    Record<string, string> = { walk: '🚶', jog: '🏃', run: '💨', sprint: '⚡' };
  const seasonEmoji:  Record<string, string> = { spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️' };

  return [
    `${biomeEmoji[remnon.birth_biome] ?? ''} ${remnon.birth_biome} terrain`,
    `${weatherEmoji[remnon.birth_weather] ?? ''} ${remnon.birth_weather} weather`,
    `${timeEmoji[remnon.birth_time_of_day] ?? ''} ${remnon.birth_time_of_day} sessions`,
    `${paceEmoji[remnon.birth_pace] ?? ''} ${remnon.birth_pace} pace`,
    `${seasonEmoji[remnon.birth_season] ?? ''} ${remnon.birth_season} adventures`,
  ];
}
