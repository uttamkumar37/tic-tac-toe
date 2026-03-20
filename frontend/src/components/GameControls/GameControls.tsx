import type { GameResponse } from '@/types';

interface GameControlsProps {
  game: GameResponse;
  onUndo: () => void;
  onRestart: () => void;
  onLeave: () => void;
  canUndo: boolean;
}

/**
 * Control bar below the board: Undo, Restart, Leave.
 */
export default function GameControls({
  game,
  onUndo,
  onRestart,
  onLeave,
  canUndo,
}: GameControlsProps) {
  const isFinished = game.status === 'FINISHED';

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {!isFinished && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="btn btn-secondary disabled:opacity-40"
        >
          ↩ Undo
        </button>
      )}

      <button
        onClick={onRestart}
        className="btn btn-primary"
      >
        🔄 Restart
      </button>

      <button
        onClick={onLeave}
        className="btn btn-danger"
      >
        🚪 Leave
      </button>
    </div>
  );
}
