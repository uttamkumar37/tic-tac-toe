import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gameAPI } from '@/services/api';
import { setCurrentGame, clearGame } from '@/store/gameSlice';
import type { RootState, AppDispatch } from '@/store';
import Board from '@/components/Board/Board';
import PlayerInfo from '@/components/PlayerInfo/PlayerInfo';
import GameControls from '@/components/GameControls/GameControls';
import GameResult from '@/components/GameResult/GameResult';
import toast from 'react-hot-toast';

export default function BotGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentGame } = useSelector((s: RootState) => s.game);
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (!roomCode) return;
    gameAPI
      .get(roomCode)
      .then((g) => dispatch(setCurrentGame(g)))
      .catch(() => {
        toast.error('Game not found');
        navigate('/lobby');
      });
    return () => {
      dispatch(clearGame());
    };
  }, [roomCode, dispatch, navigate]);

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-lg">Loading game…</div>
      </div>
    );
  }

  const isFinished =
    currentGame.status === 'FINISHED' || currentGame.status === 'ABANDONED';

  const handleMove = (position: number) => {
    if (!roomCode || isFinished) return;
    gameAPI
      .makeMove({ roomCode, position })
      .then((g) => dispatch(setCurrentGame(g)))
      .catch((err) =>
        toast.error(err?.response?.data?.message ?? 'Invalid move')
      );
  };

  const handleUndo = () => {
    if (!roomCode) return;
    gameAPI
      .undo(roomCode)
      .then((g) => dispatch(setCurrentGame(g)))
      .catch((err) =>
        toast.error(err?.response?.data?.message ?? 'Cannot undo')
      );
  };

  const handleRestart = () => {
    if (!roomCode) return;
    gameAPI
      .restart(roomCode)
      .then((g) => dispatch(setCurrentGame(g)))
      .catch(() => toast.error('Cannot restart'));
  };

  const handleLeave = () => {
    dispatch(clearGame());
    navigate('/lobby');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* BOT difficulty badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          🤖 BOT — {currentGame.botDifficulty ?? 'EASY'}
        </span>
        <span className="ml-auto font-mono text-sm text-gray-400">{roomCode}</span>
      </div>

      <PlayerInfo game={currentGame} currentUsername={user?.username ?? ''} />

      <div className="my-6">
        <Board
          game={currentGame}
          currentUsername={user?.username ?? ''}
          onCellClick={handleMove}
        />
      </div>

      <GameControls
        game={currentGame}
        canUndo={!isFinished && currentGame.totalMoves > 0}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onLeave={handleLeave}
      />

      {isFinished && (
        <GameResult
          game={currentGame}
          currentUsername={user?.username ?? ''}
        />
      )}
    </div>
  );
}
