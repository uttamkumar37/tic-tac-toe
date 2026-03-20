import type { PlayerSymbol } from '@/types';

interface CellProps {
  value: string;        // '_', 'X', or 'O'
  index: number;
  isWinningCell?: boolean;
  isDisabled: boolean;
  onClick: (index: number) => void;
}

/**
 * A single cell on the Tic-Tac-Toe board.
 *
 * Handles:
 *  - Symbol rendering with color and entry animation
 *  - Win highlight pulse
 *  - Hover effect when the cell is playable
 */
export default function Cell({
  value,
  index,
  isWinningCell = false,
  isDisabled,
  onClick,
}: CellProps) {
  const isEmpty = value === '_';
  const symbol = isEmpty ? null : (value as PlayerSymbol);

  const canClick = isEmpty && !isDisabled;

  const handleClick = () => {
    if (canClick) onClick(index);
  };

  const symbolClasses = symbol === 'X'
    ? 'text-red-500 animate-bounce-in'
    : 'text-blue-500 animate-bounce-in';

  return (
    <button
      onClick={handleClick}
      aria-label={`Cell ${index}${symbol ? `, ${symbol}` : ''}`}
      disabled={!canClick}
      className={[
        'flex items-center justify-center rounded-xl text-5xl font-extrabold',
        'aspect-square select-none transition-all duration-200',
        isWinningCell
          ? 'bg-indigo-200 animate-pulse-win ring-4 ring-indigo-400'
          : 'bg-white/80 dark:bg-slate-700',
        canClick
          ? 'cursor-pointer hover:bg-indigo-50 hover:scale-105 active:scale-95'
          : 'cursor-not-allowed opacity-90',
      ].join(' ')}
    >
      {symbol && (
        <span className={symbolClasses}>{symbol}</span>
      )}
    </button>
  );
}
