import { Link } from 'react-router-dom';
import { demoStatsService } from '@/services/demo/demoStatsService';

export default function DemoProfile() {
  const stats = demoStatsService.getStats();
  const metrics = [
    ['Games played', stats.totalGames],
    ['Wins', stats.wins],
    ['Losses', stats.losses],
    ['Draws', stats.draws],
    ['Win rate', `${stats.winRate}%`],
    ['Favorite mode', stats.favoriteMode],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-950 text-3xl font-black text-white">
            DP
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">{stats.displayName}</h1>
          <p className="mt-1 font-mono text-sm font-bold text-slate-500">@{stats.username}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Browser-only profile generated from completed demo games in localStorage.
          </p>
          <Link className="btn btn-primary mt-5 w-full" to="/demo/bot">Play Another Game</Link>
        </aside>

        <section>
          <p className="text-sm font-semibold text-blue-700">Demo profile</p>
          <h2 className="mt-2 text-4xl font-black text-slate-950">Statistics</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(([label, value]) => (
              <article key={label} className="card">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="font-bold text-blue-950">Mode split</p>
            <p className="mt-2 text-sm leading-6 text-blue-800">
              Bot games: <span className="font-bold">{stats.botGames}</span> · Local games: <span className="font-bold">{stats.localGames}</span>
            </p>
          </div>
        </section>
      </section>
    </div>
  );
}
