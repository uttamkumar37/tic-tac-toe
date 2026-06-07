import { Link } from 'react-router-dom';
import { appConfig } from '@/config/appConfig';

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-700">About the project</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Static frontend demo, production backend ready</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-black text-slate-950">GitHub Pages hosting</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            GitHub Pages hosts only the compiled React frontend. It cannot run Java, Spring Boot, MySQL, Redis, JWT issuing,
            or WebSocket/STOMP services.
          </p>
        </section>
        <section className="card">
          <h2 className="text-xl font-black text-slate-950">Demo mode</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            When no backend URL is configured, the app automatically switches to demo mode and stores games, history,
            and profile statistics in localStorage.
          </p>
        </section>
        <section className="card">
          <h2 className="text-xl font-black text-slate-950">Backend path</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The Spring Boot backend remains in this repository. It can be run locally with Docker Compose or deployed later
            to Render, Railway, Fly.io, or a Docker-based VPS.
          </p>
        </section>
        <section className="card">
          <h2 className="text-xl font-black text-slate-950">Public domain</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The public frontend demo is configured for <a className="font-bold text-blue-700 hover:underline" href={appConfig.publicUrl}>{appConfig.publicUrl}</a>.
          </p>
        </section>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/demo">Open Demo</Link>
        <Link className="btn btn-secondary" to="/tech-stack">View Tech Stack</Link>
      </div>
    </div>
  );
}
