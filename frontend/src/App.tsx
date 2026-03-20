import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';
import Lobby from '@/pages/Lobby/Lobby';
import Game from '@/pages/Game/Game';
import BotGame from '@/pages/BotGame/BotGame';
import History from '@/pages/History/History';
import Profile from '@/pages/Profile/Profile';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-4 pb-12">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/lobby" replace />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomCode" element={<Game />} />
            <Route path="/bot/:roomCode" element={<BotGame />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
