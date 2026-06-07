import { Link } from 'react-router-dom';
import { appConfig } from '@/config/appConfig';

const featureCards = [
  ['Play vs Bot', 'Practice in a browser-only bot match with tactical move selection.'],
  ['Local 2 Player', 'Play X and O on one device with saved local results.'],
  ['Demo Lobby', 'Preview rooms and start demo matches without a server.'],
  ['Game History', 'Completed demo games are stored in localStorage.'],
  ['Profile Stats', 'Track games, wins, losses, draws, and win rate locally.'],
  ['Real-time Multiplayer Ready', 'The repo keeps the Spring WebSocket/STOMP integration.'],
  ['JWT Auth Ready', 'Live mode can use the existing Spring Security JWT backend.'],
  ['Dockerized Backend', 'Backend, MySQL, Redis, and Nginx are included for local or VPS use.'],
  ['CI/CD Ready', 'GitHub Actions build the frontend and validate the project.'],
];

const previewBoard = ['X', 'O', 'X', '_', 'O', '_', '_', 'X', 'O'];

export default function Landing() {
  return (
    <div className="bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold text-red-600">Full-stack portfolio app with static public demo</p>
            <h1 className="text-4xl font-black text-slate-950 sm:text-5xl lg:text-6xl">
              Tic-Tac-Toe Arena
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
              Real-time multiplayer Tic-Tac-Toe with bot mode, local demo mode, game history, and production-style architecture.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demo" className="btn btn-primary">
                Play Demo
              </Link>
              <Link to="/demo/bot" className="btn btn-secondary">
                Play vs Bot
              </Link>
              <Link to="/tech-stack" className="btn btn-ghost">
                View Tech Stack
              </Link>
              <a href={appConfig.githubUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">
                View GitHub
              </a>
            </div>
            <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-950">
                Public GitHub Pages demo runs fully in browser. Backend is optional and can be deployed separately.
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                No backend, database, JWT server, Redis cache, or WebSocket server is required for the public demo.
              </p>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
              {['React', 'TypeScript', 'Spring Boot', 'Docker'].map((item) => (
                <Link key={item} to="/tech-stack" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center font-semibold transition hover:border-blue-300">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Demo room</p>
                  <p className="font-mono text-sm font-bold text-slate-900">BROWSER01</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Static</span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-950 p-2">
                {previewBoard.map((cell, index) => (
                  <div
                    key={index}
                    className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white text-4xl font-black"
                  >
                    <span className={cell === 'X' ? 'text-rose-600' : 'text-blue-700'}>
                      {cell === '_' ? '' : cell}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
                <span className="rounded-lg bg-rose-50 px-2 py-2 text-rose-700">Player X</span>
                <span className="rounded-lg bg-amber-50 px-2 py-2 text-amber-700">Saved</span>
                <span className="rounded-lg bg-blue-50 px-2 py-2 text-blue-700">Player O</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">Features</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Public demo plus deployable backend</h2>
          </div>
          <Link to="/about" className="btn btn-secondary">Read Architecture</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map(([title, body]) => (
            <article key={title} className="card">
              <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          {[
            ['Frontend-only hosting', 'GitHub Pages serves the static React build from a custom domain.'],
            ['Backend remains optional', 'Spring Boot, MySQL, Redis, and WebSocket code remain in the repository.'],
            ['Safe public demo', 'Demo games and stats are stored only in the visitor browser.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
