import { useRemnons } from '../hooks/useRemnons';
import { RemnonCard } from '../components/RemnonCard';
import type { Remnon } from '../types';

export function MyRemnons() {
  const { remnons, loading, error, refetch } = useRemnons();

  const handleUpdate = (_updated: Remnon) => {
    refetch();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-slate-400 text-center">Loading remnons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">👾 My Remnons</h1>
      {remnons.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🥚</div>
          <p className="text-slate-500 text-lg">No remnons yet! Walk 20km to hatch your first! 🥚</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {remnons.map(m => (
            <RemnonCard key={m.id} remnon={m} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
