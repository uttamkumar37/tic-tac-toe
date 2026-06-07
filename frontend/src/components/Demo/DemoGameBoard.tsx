import type { DemoGame } from '@/services/demo/demoStorage';
import { getWinningCells } from '@/services/demo/demoGameService';

interface DemoGameBoardProps {
  game: DemoGame;
  title: string;
  subtitle: string;
  onMove: (position: number) => void;
  onUndo: () => void;
  onRestart: () => void;
}

function symbolClass(symbol: string) {
  if (symbol === 'X') return 'text-rose-600';
  if (symbol === 'O') return 'text-blue-700';
  return 'text-slate-300';
}

function formatDifficulty(value: string | null) {
  if (!value) return 'BOT';
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()} Bot`;
}

export default function DemoGameBoard({
  game,
  title,
  subtitle,
  onMove,
  onUndo,
  onRestart,
}: DemoGameBoardProps) {
  const winningCells = new Set(getWinningCells(game.board));
  const cells = game.board.split('');
  const resultLabel = game.winner
    ? `${game.winner} wins`
    : game.isDraw
      ? 'Draw game'
      : `${game.currentTurn} to move`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,520px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">{game.mode === 'BOT' ? 'Play vs Bot' : 'Local 2 Player'}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
          </div>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            {game.roomCode}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950 p-2 shadow-inner">
          {cells.map((cell, index) => {
            const isWinning = winningCells.has(index);
            const isPlayable = cell === '_' && game.status === 'IN_PROGRESS';

            return (
              <button
                key={index}
                type="button"
                onClick={() => onMove(index)}
                disabled={!isPlayable}
                className={[
                  'flex aspect-square items-center justify-center rounded-lg border text-5xl font-black transition sm:text-6xl',
                  isWinning
                    ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]'
                    : 'border-slate-200 bg-white',
                  isPlayable ? 'hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md' : 'cursor-default',
                ].join(' ')}
                aria-label={`Cell ${index + 1}`}
              >
                <span className={symbolClass(cell)}>{cell === '_' ? '' : cell}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Current state</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">{resultLabel}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
              {game.mode === 'BOT' ? formatDifficulty(game.botDifficulty) : 'LOCAL'}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-700">Player X</p>
            <p className="mt-1 text-lg font-black text-rose-900">{game.playerXUsername}</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-bold text-blue-700">Player O</p>
            <p className="mt-1 text-lg font-black text-blue-900">{game.playerOUsername}</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-700">Moves</p>
            <p className="mt-1 text-2xl font-black text-amber-900">{game.totalMoves}</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-secondary" onClick={onUndo} disabled={game.totalMoves === 0}>
            Undo
          </button>
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            Restart
          </button>
        </section>

        {game.status === 'FINISHED' && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">Result saved locally</p>
            <p className="mt-2 text-2xl font-black text-emerald-950">{resultLabel}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              This completed game is stored in your browser history for the demo profile and stats pages.
            </p>
          </section>
        )}
      </aside>
    </div>
  );
}
