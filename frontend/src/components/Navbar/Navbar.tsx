import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { appConfig } from '@/config/appConfig';

const publicLinks = [
  ['Demo', '/demo'],
  ['Bot', '/demo/bot'],
  ['Local', '/demo/local'],
  ['History', '/demo/history'],
  ['Profile', '/demo/profile'],
  ['About', '/about'],
  ['Tech', '/tech-stack'],
];

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700',
  ].join(' ');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold hover:opacity-90">
          Tic-Tac-Toe Arena
        </Link>

        {appConfig.isDemoMode ? (
          <div className="flex flex-wrap items-center gap-1">
            {publicLinks.map(([label, to]) => (
              <NavLink key={to} to={to} className={navClass}>
                {label}
              </NavLink>
            ))}
          </div>
        ) : user ? (
          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/lobby"
              className={navClass}
            >
              Lobby
            </NavLink>
            <NavLink
              to="/history"
              className={navClass}
            >
              History
            </NavLink>
            <NavLink
              to="/profile"
              className={navClass}
            >
              {user.username}
            </NavLink>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            <NavLink
              to="/demo"
              className={navClass}
            >
              Demo
            </NavLink>
            <NavLink
              to="/about"
              className={navClass}
            >
              About
            </NavLink>
            <NavLink
              to="/login"
              className={navClass}
            >
              Login
            </NavLink>
            <Link
              to="/register"
              className="rounded-lg bg-slate-950 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
