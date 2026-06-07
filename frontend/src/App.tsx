import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing/Landing';
import Demo from '@/pages/Demo/Demo';
import DemoBot from '@/pages/DemoBot/DemoBot';
import DemoLocal from '@/pages/DemoLocal/DemoLocal';
import DemoLobby from '@/pages/DemoLobby/DemoLobby';
import DemoHistory from '@/pages/DemoHistory/DemoHistory';
import DemoProfile from '@/pages/DemoProfile/DemoProfile';
import About from '@/pages/About/About';
import TechStack from '@/pages/TechStack/TechStack';
import NotFound from '@/pages/NotFound/NotFound';
import Login from '@/pages/Login/Login';
import Register from '@/pages/Register/Register';
import Lobby from '@/pages/Lobby/Lobby';
import Game from '@/pages/Game/Game';
import BotGame from '@/pages/BotGame/BotGame';
import History from '@/pages/History/History';
import Profile from '@/pages/Profile/Profile';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pb-12">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/demo/bot" element={<DemoBot />} />
          <Route path="/demo/local" element={<DemoLocal />} />
          <Route path="/demo/lobby" element={<DemoLobby />} />
          <Route path="/demo/history" element={<DemoHistory />} />
          <Route path="/demo/profile" element={<DemoProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/tech-stack" element={<TechStack />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomCode" element={<Game />} />
            <Route path="/bot/:roomCode" element={<BotGame />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
