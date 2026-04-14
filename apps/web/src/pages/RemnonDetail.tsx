import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Remnon, RemnonSkill } from '../types';
import { RemnonProfile } from '../components/RemnonProfile';
import { api } from '../lib/api';

export function RemnonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [remnon, setRemnon] = useState<Remnon | null>(null);
  const [skills, setSkills] = useState<RemnonSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchRemnon = async () => {
      try {
        const res = await api.get<{ remnon: Remnon; skills: RemnonSkill[] }>(`/api/remnons/${id}`);
        setRemnon(res.data.remnon);
        setSkills(res.data.skills ?? []);
        setNameInput(res.data.remnon.name ?? '');
      } catch {
        setError('Remnon not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRemnon();
  }, [id]);

  const handleNameSave = async () => {
    if (!remnon) return;
    try {
      const res = await api.patch<{ remnon: Remnon }>(`/api/remnons/${remnon.id}/name`, { name: nameInput });
      setRemnon(res.data.remnon);
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-slate-400">Loading...</div>;
  if (error || !remnon) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-red-500">{error ?? 'Remnon not found'}</p>
      <button onClick={() => navigate('/remnons')} className="mt-4 text-violet-500 hover:text-violet-600">
        ← Back to My Remnons
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/remnons')}
        className="text-slate-400 hover:text-violet-600 transition-colors mb-6 flex items-center gap-1"
      >
        ← Back to My Remnons
      </button>

      {/* Remnon Name */}
      <div className="text-center mb-6">
        {editing ? (
          <div className="flex gap-2 justify-center">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="bg-white border border-violet-400 rounded-lg px-3 py-2 text-slate-800 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-violet-300"
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={handleNameSave} className="bg-violet-500 text-white px-3 py-2 rounded-lg">✓</button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 justify-center"
          >
            <h1 className="text-3xl font-bold text-slate-800">{remnon.name ?? 'Unnamed Remnon'}</h1>
            <span className="text-slate-400 group-hover:text-violet-500 transition-colors">✏️</span>
          </button>
        )}
      </div>

      <RemnonProfile remnon={remnon} skills={skills} />
    </div>
  );
}
