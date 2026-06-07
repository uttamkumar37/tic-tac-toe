import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm font-semibold text-blue-700">404</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Page not found</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        This route is not part of the public Tic-Tac-Toe demo.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link className="btn btn-primary" to="/">Go Home</Link>
        <Link className="btn btn-secondary" to="/demo">Open Demo</Link>
      </div>
    </div>
  );
}
