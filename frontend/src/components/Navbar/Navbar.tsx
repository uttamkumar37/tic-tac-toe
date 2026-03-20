import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight hover:opacity-90">
          ✕ Tic‑Tac‑Toe
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/lobby"
              className="text-sm hover:underline"
            >
              Lobby
            </Link>
            <Link
              to="/history"
              className="text-sm hover:underline"
            >
              History
            </Link>
            <Link
              to="/profile"
              className="text-sm hover:underline"
            >
              {user.username}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="text-sm hover:underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-white text-indigo-600 px-3 py-1 rounded-lg font-semibold hover:bg-indigo-50"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
