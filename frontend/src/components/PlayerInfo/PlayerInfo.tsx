import type { GameResponse } from '@/types';

interface PlayerInfoProps {
  game: GameResponse;
  currentUsername: string;
}

/**
 * Shows both players' names, their symbols, and whose turn it is.
 */
export default function PlayerInfo({ game, currentUsername }: PlayerInfoProps) {
  const players = [
    { username: game.playerXUsername, symbol: 'X', color: 'text-red-500' },
    {
      username: game.playerOUsername ?? 'BOT',
      symbol: 'O',
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="flex justify-between gap-4">
      {players.map(({ username, symbol, color }) => {
        const isActive =
          game.status === 'IN_PROGRESS' && game.currentTurn === symbol;
        const isCurrentUser = username === currentUsername;

        return (
          <div
            key={symbol}
            className={[
              'flex-1 p-3 rounded-xl border-2 transition-all',
              isActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md scale-105'
                : 'border-transparent bg-white/60 dark:bg-slate-700/50',
            ].join(' ')}
          >
            <p className={`text-2xl font-extrabold ${color}`}>{symbol}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {username}
              {isCurrentUser && (
                <span className="ml-1 text-xs text-indigo-500">(you)</span>
              )}
            </p>
            {isActive && (
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                ▶ Your turn
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
