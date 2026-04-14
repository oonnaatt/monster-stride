interface EvolutionTreeProps {
  currentTier: string;
}

const TIERS = [
  { name: 'Hatchling', emoji: '🐣' },
  { name: 'Juvenile', emoji: '🌱' },
  { name: 'Adult', emoji: '🦎' },
  { name: 'Elder', emoji: '👑' },
  { name: 'Ascended', emoji: '✨' },
];

export function EvolutionTree({ currentTier }: EvolutionTreeProps) {
  const currentIdx = TIERS.findIndex(t => t.name === currentTier);

  return (
    <div className="flex items-center justify-between overflow-x-auto gap-1">
      {TIERS.map((tier, idx) => (
        <div key={tier.name} className="flex items-center">
          <div
            className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all ${
              idx === currentIdx
                ? 'bg-gradient-to-b from-violet-500 to-fuchsia-500 text-white scale-110'
                : idx < currentIdx
                ? 'text-violet-400 opacity-70'
                : 'text-slate-400 opacity-40'
            }`}
          >
            <span className="text-xl">{tier.emoji}</span>
            <span className="text-xs mt-1 font-medium">{tier.name}</span>
          </div>
          {idx < TIERS.length - 1 && (
            <span className={`mx-1 text-slate-300 ${idx < currentIdx ? 'text-violet-400' : ''}`}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}
