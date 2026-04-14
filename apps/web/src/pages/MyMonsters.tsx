import { useMonsters } from '../hooks/useMonsters';
import { MonsterCard } from '../components/MonsterCard';
import type { Monster } from '../types';

export function MyMonsters() {
  const { monsters, loading, error, refetch } = useMonsters();

  const handleUpdate = (_updated: Monster) => {
    refetch();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-gray-400 text-center">Loading monsters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">👾 My Monsters</h1>
      {monsters.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🥚</div>
          <p className="text-gray-400 text-lg">No monsters yet! Walk 100km to hatch your first! 🥚</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {monsters.map(m => (
            <MonsterCard key={m.id} monster={m} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
