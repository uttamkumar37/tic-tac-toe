export type BotDifficulty = 'easy' | 'medium' | 'hard';
type Symbol = 'X' | 'O';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function availableMoves(board: string[]): number[] {
  return board
    .map((cell, index) => (cell === '_' ? index : -1))
    .filter((index) => index >= 0);
}

function winner(board: string[]): Symbol | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] !== '_' && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as Symbol;
    }
  }
  return null;
}

function randomMove(board: string[]): number {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)] ?? -1;
}

function findImmediateMove(board: string[], symbol: Symbol): number | null {
  for (const move of availableMoves(board)) {
    const next = [...board];
    next[move] = symbol;
    if (winner(next) === symbol) return move;
  }
  return null;
}

function mediumMove(board: string[], botSymbol: Symbol, playerSymbol: Symbol): number {
  const winningMove = findImmediateMove(board, botSymbol);
  if (winningMove !== null) return winningMove;

  const blockingMove = findImmediateMove(board, playerSymbol);
  if (blockingMove !== null) return blockingMove;

  if (board[4] === '_') return 4;

  const corners = [0, 2, 6, 8].filter((index) => board[index] === '_');
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)] ?? corners[0];
  }

  return randomMove(board);
}

function minimax(board: string[], botSymbol: Symbol, playerSymbol: Symbol, isBotTurn: boolean): number {
  const currentWinner = winner(board);
  if (currentWinner === botSymbol) return 10;
  if (currentWinner === playerSymbol) return -10;

  const moves = availableMoves(board);
  if (moves.length === 0) return 0;

  const scores = moves.map((move) => {
    const next = [...board];
    next[move] = isBotTurn ? botSymbol : playerSymbol;
    return minimax(next, botSymbol, playerSymbol, !isBotTurn);
  });

  return isBotTurn ? Math.max(...scores) : Math.min(...scores);
}

function hardMove(board: string[], botSymbol: Symbol, playerSymbol: Symbol): number {
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMove = -1;

  for (const move of availableMoves(board)) {
    const next = [...board];
    next[move] = botSymbol;
    const score = minimax(next, botSymbol, playerSymbol, false);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getBotMove(
  board: string[],
  botSymbol: 'O',
  playerSymbol: 'X',
  difficulty: BotDifficulty
): number {
  if (availableMoves(board).length === 0) return -1;

  if (difficulty === 'easy') {
    return randomMove(board);
  }

  if (difficulty === 'medium') {
    return mediumMove(board, botSymbol, playerSymbol);
  }

  return hardMove(board, botSymbol, playerSymbol);
}
