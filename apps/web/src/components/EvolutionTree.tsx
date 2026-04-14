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
    <div className="flex items-center justify-between w-full min-w-0">
      {TIERS.map((tier, idx) => (
        <div key={tier.name} className="flex items-center min-w-0 shrink">
          <div
            className={`flex flex-col items-center px-1.5 py-1 rounded-lg transition-all shrink-0 ${
              idx === currentIdx
                ? 'bg-gradient-to-b from-violet-500 to-fuchsia-500 text-white scale-110'
                : idx < currentIdx
                ? 'text-violet-400 opacity-70'
                : 'text-slate-400 opacity-40'
            }`}
          >
            <span className="text-lg">{tier.emoji}</span>
            <span className="text-[10px] mt-0.5 font-medium leading-tight">{tier.name}</span>
          </div>
          {idx < TIERS.length - 1 && (
            <span className={`mx-0.5 text-xs shrink-0 ${idx < currentIdx ? 'text-violet-300' : 'text-slate-200'}`}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}
