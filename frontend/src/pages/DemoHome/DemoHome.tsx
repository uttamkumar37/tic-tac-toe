import { Link } from 'react-router-dom';
import { appConfig } from '@/config/appConfig';

const demoCards = [
  {
    title: 'Play vs Bot',
    body: 'Practice against a browser-only opponent that can win, block, and choose strong squares.',
    to: '/demo/bot',
  },
  {
    title: 'Local 2 Player',
    body: 'Play X and O on the same device with turn tracking, undo, restart, and saved results.',
    to: '/demo/local',
  },
  {
    title: 'Demo Lobby',
    body: 'Preview the public lobby experience with mock rooms and quick-start demo matches.',
    to: '/demo/lobby',
  },
  {
    title: 'History and Stats',
    body: 'Completed demo games are stored locally and reflected in history and profile statistics.',
    to: '/demo/history',
  },
];

export default function DemoHome() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-700">Frontend-only public demo</p>
            <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Play Tic-Tac-Toe without a backend</h1>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              The GitHub Pages build runs entirely in your browser. It uses localStorage for demo games,
              history, and profile statistics while keeping the real backend integration ready for live deployments.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn btn-primary" to="/demo/bot">Play vs Bot</Link>
            <Link className="btn btn-secondary" to="/demo/local">Local 2 Player</Link>
            <Link className="btn btn-ghost" to="/about">How It Works</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
        {demoCards.map((card) => (
          <Link key={card.title} to={card.to} className="card block transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <h2 className="text-xl font-black text-slate-950">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-bold text-emerald-950">Public URL</p>
          <a className="mt-1 inline-block text-sm font-semibold text-emerald-800 hover:underline" href={appConfig.publicUrl}>
            {appConfig.publicUrl}
          </a>
          <p className="mt-3 text-sm leading-6 text-emerald-800">
            No Spring Boot server, MySQL database, Redis cache, JWT issuer, or WebSocket server is required for this public demo.
          </p>
        </div>
      </section>
    </div>
  );
}
