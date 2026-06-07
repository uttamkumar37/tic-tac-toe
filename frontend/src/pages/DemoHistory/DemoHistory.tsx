import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameHistoryResponse } from '@/types';
import { demoGameService } from '@/services/demo/demoGameService';

function formatDate(value: string | null) {
  if (!value) return 'In progress';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDifficulty(value: string | null | undefined) {
  if (!value) return 'Bot';
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()} Bot`;
}

export default function DemoHistory() {
  const [history, setHistory] = useState<GameHistoryResponse[]>([]);

  const refresh = () => {
    demoGameService.getHistory(0, 50).then((page) => setHistory(page.content));
  };

  useEffect(refresh, []);

  const clear = () => {
    demoGameService.clearHistory();
    refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Demo history</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Completed local games</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Results are stored in this browser only. Clearing browser storage resets the public demo history.
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={clear} disabled={history.length === 0}>Clear History</button>
      </div>

      {history.length === 0 ? (
        <section className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-2xl font-black text-slate-950">No completed games yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Finish a bot or local match and it will appear here with winner, move count, mode, and date.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link className="btn btn-primary" to="/demo/bot">Play vs Bot</Link>
            <Link className="btn btn-secondary" to="/demo/local">Local 2 Player</Link>
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {history.map((game) => (
            <article key={`${game.roomCode}-${game.finishedAt}`} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{game.mode === 'BOT' ? 'Play vs Bot' : 'Local 2 Player'}</h2>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-500">{game.roomCode}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {game.mode === 'BOT' && (
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-800">
                      {formatDifficulty(game.botDifficulty)}
                    </span>
                  )}
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {game.winner ? `${game.winner} wins` : 'Draw'}
                  </span>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold text-slate-500">Winner</dt>
                  <dd className="mt-1 font-bold text-slate-950">{game.winnerUsername ?? 'Draw'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Moves</dt>
                  <dd className="mt-1 font-bold text-slate-950">{game.totalMoves}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-semibold text-slate-500">Finished</dt>
                  <dd className="mt-1 font-bold text-slate-950">{formatDate(game.finishedAt)}</dd>
                </div>
              </dl>
              <div className="mt-5 grid grid-cols-9 gap-1">
                {game.finalBoard.split('').map((cell, index) => (
                  <span key={index} className="flex aspect-square items-center justify-center rounded border border-slate-200 bg-slate-50 text-sm font-black text-slate-800">
                    {cell === '_' ? '' : cell}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
