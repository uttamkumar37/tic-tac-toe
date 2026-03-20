import Cell from './Cell';
import type { GameResponse } from '@/types';

interface BoardProps {
  game: GameResponse;
  currentUsername: string;
  onCellClick: (index: number) => void;
}

// All winning combinations (mirroring the backend)
const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinningCells(board: string): Set<number> {
  const cells = new Set<number>();
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] !== '_' && board[a] === board[b] && board[b] === board[c]) {
      cells.add(a); cells.add(b); cells.add(c);
    }
  }
  return cells;
}

/**
 * Renders the 3×3 game board.
 *
 * Calculates which cells are part of the winning line and
 * passes that information down to each Cell for highlighting.
 */
export default function Board({ game, currentUsername, onCellClick }: BoardProps) {
  const cells = game.board.split('');
  const winCells = getWinningCells(game.board);

  // A cell is clickable only if:
  //  - It is the current player's turn
  //  - The game is still IN_PROGRESS
  const isMyTurn =
    game.status === 'IN_PROGRESS' &&
    ((game.currentTurn === 'X' && game.playerXUsername === currentUsername) ||
     (game.currentTurn === 'O' && game.playerOUsername === currentUsername));

  return (
    <div
      className="grid grid-cols-3 gap-3 p-4 bg-indigo-100 dark:bg-slate-800 rounded-2xl shadow-xl"
      aria-label="Tic-Tac-Toe board"
    >
      {cells.map((value, index) => (
        <Cell
          key={index}
          value={value}
          index={index}
          isWinningCell={winCells.has(index)}
          isDisabled={!isMyTurn || value !== '_'}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}
