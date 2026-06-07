import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demoGameService } from '@/services/demo/demoGameService';

export default function DemoLobby() {
  const navigate = useNavigate();
  const rooms = useMemo(() => demoGameService.getMockRooms(), []);

  const startLocal = () => {
    demoGameService.createLocalGame();
    navigate('/demo/local');
  };

  const startBot = () => {
    demoGameService.createBotGame('hard');
    navigate('/demo/bot');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Demo lobby</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Choose a public demo table</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            These rooms are browser-only previews. The production backend can later power real room discovery and joining.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" type="button" onClick={startBot}>Start Bot Match</button>
          <button className="btn btn-secondary" type="button" onClick={startLocal}>Create Local Match</button>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <article key={room.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{room.name}</h2>
                <p className="mt-1 font-mono text-sm font-bold text-slate-500">{room.roomCode}</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{room.status}</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Mode</dt>
                <dd className="mt-1 font-bold text-slate-950">{room.mode === 'BOT' ? 'Bot' : 'Local'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Players</dt>
                <dd className="mt-1 font-bold text-slate-950">{room.players}</dd>
              </div>
            </dl>
            <Link className="btn btn-secondary mt-5 w-full" to={room.mode === 'BOT' ? '/demo/bot' : '/demo/local'}>
              Open Table
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
