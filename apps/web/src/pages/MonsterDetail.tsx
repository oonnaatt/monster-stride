import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Monster } from '../types';
import { MonsterProfile } from '../components/MonsterProfile';
import { api } from '../lib/api';

export function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchMonster = async () => {
      try {
        const res = await api.get<{ monster: Monster }>(`/api/monsters/${id}`);
        setMonster(res.data.monster);
        setNameInput(res.data.monster.name ?? '');
      } catch {
        setError('Monster not found');
      } finally {
        setLoading(false);
      }
    };
    fetchMonster();
  }, [id]);

  const handleNameSave = async () => {
    if (!monster) return;
    try {
      const res = await api.patch<{ monster: Monster }>(`/api/monsters/${monster.id}/name`, { name: nameInput });
      setMonster(res.data.monster);
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-400">Loading...</div>;
  if (error || !monster) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-red-400">{error ?? 'Monster not found'}</p>
      <button onClick={() => navigate('/monsters')} className="mt-4 text-indigo-400 hover:text-indigo-300">
        ← Back to My Monsters
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/monsters')}
        className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-1"
      >
        ← Back to My Monsters
      </button>

      {/* Monster Name */}
      <div className="text-center mb-6">
        {editing ? (
          <div className="flex gap-2 justify-center">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="bg-gray-800 border border-indigo-500 rounded-lg px-3 py-2 text-white text-xl font-bold focus:outline-none"
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={handleNameSave} className="bg-indigo-600 text-white px-3 py-2 rounded-lg">✓</button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 justify-center"
          >
            <h1 className="text-3xl font-bold text-white">{monster.name ?? 'Unnamed Monster'}</h1>
            <span className="text-gray-500 group-hover:text-gray-300 transition-colors">✏️</span>
          </button>
        )}
      </div>

      <MonsterProfile monster={monster} />
    </div>
  );
}
