import { useState, useEffect } from 'react';
import { historyAPI } from '@/services/api';
import type { GameHistoryResponse } from '@/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

function ResultBadge({
  history,
  username,
}: {
  history: GameHistoryResponse;
  username: string;
}) {
  if (!history.winnerUsername) {
    return (
      <span className="badge bg-yellow-100 text-yellow-700">Draw</span>
    );
  }
  if (history.winnerUsername === username) {
    return <span className="badge bg-green-100 text-green-700">Win</span>;
  }
  return <span className="badge bg-red-100 text-red-700">Loss</span>;
}

export default function History() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [items, setItems] = useState<GameHistoryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    historyAPI
      .getHistory(page, PAGE_SIZE)
      .then((paged) => {
        setItems(paged.content);
        setTotalPages(paged.totalPages);
      })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-6">
        Match History
      </h1>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No games played yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50 text-indigo-700 uppercase text-xs tracking-wide">
              <tr>
                <th className="py-3 px-4 text-left">Room</th>
                <th className="py-3 px-4 text-left">Mode</th>
                <th className="py-3 px-4 text-left">Vs</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-center">Moves</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((h) => {
                const opponent =
                  h.playerXUsername === user?.username
                    ? h.playerOUsername ?? 'BOT'
                    : h.playerXUsername;
                return (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {h.roomCode}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {h.mode?.toLowerCase()}
                    </td>
                    <td className="py-3 px-4">{opponent}</td>
                    <td className="py-3 px-4 text-center">
                      <ResultBadge
                        history={h}
                        username={user?.username ?? ''}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">{h.totalMoves}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {h.finishedAt
                        ? new Date(h.finishedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="btn btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
