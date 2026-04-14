export function getMonsterEmoji(primaryType: string, evolutionTier: string): string {
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
