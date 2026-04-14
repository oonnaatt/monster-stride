interface EggIncubatorProps {
  currentKm: number;
  targetKm: number;
  eligibleToHatch: boolean;
}

export function EggIncubator({ currentKm, targetKm, eligibleToHatch }: EggIncubatorProps) {
  const pct = Math.min((currentKm / targetKm) * 100, 100);
  const isReady = pct >= 100;
  const isAlmostReady = pct >= 80 && !isReady;

  return (
    <div className="bg-white rounded-2xl p-6 text-center border border-violet-100 shadow-sm">
      <div className={`text-8xl mb-4 inline-block ${isReady ? 'animate-egg-shake' : isAlmostReady ? 'animate-egg-shake' : 'animate-egg-pulse'}`}>
        🥚
      </div>
      {isAlmostReady && eligibleToHatch && (
        <p className="text-orange-500 font-bold text-lg mb-2 animate-pulse">
          Almost ready to hatch! 🔥
        </p>
      )}
      {isReady && !eligibleToHatch && (
        <p className="text-amber-600 font-bold text-lg mb-2">
          Egg is ready — evolve all remnons to Ascended to hatch! ✨
        </p>
      )}
      {isReady && eligibleToHatch && (
        <p className="text-emerald-600 font-bold text-lg mb-2 animate-pulse">
          Ready to hatch! Log your next run 🎉
        </p>
      )}
      <div className="mb-2 flex justify-between text-sm text-slate-400">
        <span>Egg Progress</span>
        <span>{currentKm.toFixed(1)} / {targetKm} km</span>
      </div>
      <div className="w-full bg-violet-100 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isReady && !eligibleToHatch
              ? 'bg-gradient-to-r from-amber-400 to-orange-500'
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!isReady && (
        <p className="mt-2 text-sm text-slate-400">
          {(targetKm - currentKm).toFixed(1)} km remaining
        </p>
      )}
    </div>
  );
}
