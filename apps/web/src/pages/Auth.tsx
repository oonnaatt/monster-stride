import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password);
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-violet-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥚</div>
          <h1 className="text-3xl font-extrabold text-slate-800">Remnon Stride</h1>
          <p className="text-slate-400 mt-2">Your journey shapes your remnon</p>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-6 bg-violet-50 p-1 gap-1">
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${isLogin ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${!isLogin ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
          {successMsg && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-2">{successMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
