import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gameAPI } from '@/services/api';
import {
  setCurrentGame,
  setOpenGames,
  setLoading,
} from '@/store/gameSlice';
import type { RootState, AppDispatch } from '@/store';
import type { BotDifficulty, GameResponse } from '@/types';
import toast from 'react-hot-toast';

export default function Lobby() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { openGames, loading } = useSelector((s: RootState) => s.game);

  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('EASY');
  const [joinCode, setJoinCode] = useState('');

  // Load open games on mount
  useEffect(() => {
    const fetchOpen = async () => {
      try {
        const games = await gameAPI.getOpen();
        dispatch(setOpenGames(games));
      } catch {
        // Non-critical; lobby just shows empty list
      }
    };
    fetchOpen();
    const interval = setInterval(fetchOpen, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // ---- Handlers ----

  const createVsBot = async () => {
    dispatch(setLoading(true));
    try {
      const game = await gameAPI.create({ mode: 'BOT', botDifficulty });
      dispatch(setCurrentGame(game));
      navigate(`/bot/${game.roomCode}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createMultiplayer = async () => {
    dispatch(setLoading(true));
    try {
      const game = await gameAPI.create({ mode: 'MULTIPLAYER' });
      dispatch(setCurrentGame(game));
      navigate(`/game/${game.roomCode}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const joinGame = async () => {
    if (!joinCode.trim()) return;
    dispatch(setLoading(true));
    try {
      const game = await gameAPI.join(joinCode.trim().toUpperCase());
      dispatch(setCurrentGame(game));
      navigate(`/game/${game.roomCode}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const quickJoin = async (roomCode: string) => {
    dispatch(setLoading(true));
    try {
      const game = await gameAPI.join(roomCode);
      dispatch(setCurrentGame(game));
      navigate(`/game/${game.roomCode}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-indigo-600">Game Lobby</h1>

      {/* === Play vs BOT === */}
      <section className="card">
        <h2 className="text-xl font-bold mb-4">Play vs BOT</h2>
        <div className="flex gap-3 mb-4">
          {(['EASY', 'HARD'] as BotDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setBotDifficulty(d)}
              className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${
                botDifficulty === d
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {d === 'EASY' ? '😊 Easy' : '🤖 Hard (Minimax)'}
            </button>
          ))}
        </div>
        <button
          onClick={createVsBot}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          Start vs BOT
        </button>
      </section>

      {/* === Create Multiplayer === */}
      <section className="card">
        <h2 className="text-xl font-bold mb-4">Multiplayer</h2>
        <button
          onClick={createMultiplayer}
          disabled={loading}
          className="btn btn-primary w-full mb-4"
        >
          Create New Room
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="input flex-1"
            placeholder="Enter room code (e.g. AB12CD34)"
            maxLength={8}
          />
          <button
            onClick={joinGame}
            disabled={loading || !joinCode.trim()}
            className="btn btn-secondary"
          >
            Join
          </button>
        </div>
      </section>

      {/* === Open Games === */}
      {openGames.length > 0 && (
        <section className="card">
          <h2 className="text-xl font-bold mb-4">Open Rooms</h2>
          <ul className="space-y-2">
            {openGames.map((g: GameResponse) => (
              <li
                key={g.id}
                className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg"
              >
                <div>
                  <span className="font-mono font-bold">{g.roomCode}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    by {g.playerXUsername}
                  </span>
                </div>
                <button
                  onClick={() => quickJoin(g.roomCode)}
                  className="btn btn-primary text-sm py-1 px-3"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
