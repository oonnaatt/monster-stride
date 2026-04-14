import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TAB_LINKS = [
  { to: '/',        emoji: '🏠', label: 'Home' },
  { to: '/remnons', emoji: '👾', label: 'Remnons' },
  { to: '/missions',emoji: '🎯', label: 'Missions' },
  { to: '/log',     emoji: '🏃', label: 'Log' },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            Remnon Stride 🥚
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            {TAB_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === to ? 'text-violet-600' : 'text-slate-500 hover:text-violet-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden lg:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Bottom tab bar — mobile only ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-violet-100 shadow-[0_-2px_12px_rgba(139,92,246,0.08)]">
        <div className="flex">
          {TAB_LINKS.map(({ to, emoji, label }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                  active ? 'text-violet-600' : 'text-slate-400'
                }`}
              >
                <span className="text-xl leading-none">{emoji}</span>
                <span>{label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 bg-violet-500 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
