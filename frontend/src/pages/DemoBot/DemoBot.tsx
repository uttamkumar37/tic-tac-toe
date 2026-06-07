import { useState } from 'react';
import toast from 'react-hot-toast';
import DemoGameBoard from '@/components/Demo/DemoGameBoard';
import { demoGameService } from '@/services/demo/demoGameService';
import type { DemoGame } from '@/services/demo/demoStorage';
import type { BotDifficulty } from '@/services/demo/demoBotEngine';

const botOptions: Array<{
  value: BotDifficulty;
  label: string;
  body: string;
}> = [
  {
    value: 'easy',
    label: 'Easy Bot',
    body: 'Random valid moves. Good for beginners.',
  },
  {
    value: 'medium',
    label: 'Medium Bot',
    body: 'Wins, blocks, then prefers center and corners.',
  },
  {
    value: 'hard',
    label: 'Hard Bot',
    body: 'Uses minimax. Unbeatable with perfect play.',
  },
];

export default function DemoBot() {
  const [difficulty, setDifficulty] = useState<BotDifficulty>('hard');
  const [game, setGame] = useState<DemoGame>(() => demoGameService.createBotGame('hard'));

  const startGame = (nextDifficulty: BotDifficulty) => {
    setDifficulty(nextDifficulty);
    setGame(demoGameService.createBotGame(nextDifficulty));
  };

  const handleMove = (position: number) => {
    if (game.currentTurn !== 'X' || game.status === 'FINISHED') return;
    const next = demoGameService.makeDemoMove(game.roomCode, position);
    setGame(next);
    if (next.status === 'FINISHED') toast.success(next.winner ? `${next.winner} wins` : 'Draw game');
  };

  const handleUndo = () => {
    setGame(demoGameService.undoDemoMove(game.roomCode));
  };

  const handleRestart = () => {
    setGame(demoGameService.restartDemoGame(game.roomCode));
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">Bot difficulty</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">Choose your opponent</h1>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
              You are X
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {botOptions.map((option) => {
              const isActive = difficulty === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => startGame(option.value)}
                  className={[
                    'rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                    isActive
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-blue-300',
                  ].join(' ')}
                >
                  <span className="block text-lg font-black">{option.label}</span>
                  <span className={['mt-2 block text-sm leading-6', isActive ? 'text-slate-200' : 'text-slate-600'].join(' ')}>
                    {option.body}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <DemoGameBoard
        game={game}
        title="Play vs Bot"
        subtitle="You play X. The bot plays O using the selected browser-only difficulty."
        onMove={handleMove}
        onUndo={handleUndo}
        onRestart={handleRestart}
      />
    </>
  );
}
