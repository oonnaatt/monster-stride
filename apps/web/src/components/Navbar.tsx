import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
          Monster Stride 🥚
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
            Dashboard
          </Link>
          <Link to="/monsters" className="text-gray-300 hover:text-white transition-colors text-sm">
            My Monsters
          </Link>
          <Link to="/log" className="text-gray-300 hover:text-white transition-colors text-sm">
            Log Activity
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden md:block">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
