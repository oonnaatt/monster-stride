interface EggIncubatorProps {
  currentKm: number;
  targetKm: number;
}

export function EggIncubator({ currentKm, targetKm }: EggIncubatorProps) {
  const pct = Math.min((currentKm / targetKm) * 100, 100);
  const isAlmostReady = pct >= 80;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 text-center border border-gray-700">
      <div className={`text-8xl mb-4 inline-block ${isAlmostReady ? 'animate-egg-shake' : 'animate-egg-pulse'}`}>
        🥚
      </div>
      {isAlmostReady && (
        <p className="text-orange-400 font-semibold text-lg mb-2 animate-pulse">
          Almost ready to hatch! 🔥
        </p>
      )}
      <div className="mb-2 flex justify-between text-sm text-gray-400">
        <span>DEMO MODE</span>
        <span>{currentKm.toFixed(1)} / {targetKm} km</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-400">
        {pct >= 100 ? '🎉 Ready to hatch!' : `${(targetKm - currentKm).toFixed(1)} km remaining`}
      </p>
    </div>
  );
}
