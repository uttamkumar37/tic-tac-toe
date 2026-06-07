const stack = [
  ['React', 'Static UI, route shell, component state'],
  ['TypeScript', 'Typed DTOs and demo service contracts'],
  ['Vite', 'Fast frontend build for GitHub Pages'],
  ['Tailwind', 'Responsive utility styling'],
  ['Spring Boot', 'Optional backend API included in the repo'],
  ['JWT', 'Live authentication path for backend deployments'],
  ['WebSocket/STOMP', 'Live multiplayer transport when backend is deployed'],
  ['MySQL', 'Production relational database for backend mode'],
  ['Redis', 'Optional backend cache and live state support'],
  ['Docker', 'Local and production container workflows'],
  ['GitHub Actions', 'CI checks and GitHub Pages deployment'],
];

export default function TechStack() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-700">Tech stack</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Frontend demo plus full-stack architecture</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
        The public site is static and browser-only. The repository also contains the backend stack needed for real
        multiplayer, authentication, persistence, and WebSocket gameplay.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stack.map(([name, body]) => (
          <article key={name} className="card">
            <h2 className="text-xl font-black text-slate-950">{name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
