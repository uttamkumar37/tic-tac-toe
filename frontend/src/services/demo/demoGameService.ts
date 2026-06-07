import type {
  BotDifficulty,
  CreateGameRequest,
  GameHistoryResponse,
  GameResponse,
  MakeMoveRequest,
  PagedResponse,
  PlayerSymbol,
} from '@/types';
import { getBotMove, type BotDifficulty as DemoBotDifficulty } from './demoBotEngine';
import {
  addHistoryEntry,
  clearDemoHistory,
  createEmptyGame,
  DemoGame,
  DemoMove,
  DemoRoom,
  getActiveGames,
  getHistory,
  toHistoryEntry,
  upsertActiveGame,
} from './demoStorage';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function now() {
  return new Date().toISOString();
}

export function getWinningCells(board: string): number[] {
  const line = WIN_LINES.find(([a, b, c]) => {
    return board[a] !== '_' && board[a] === board[b] && board[b] === board[c];
  });

  return line ?? [];
}

function getWinner(board: string): PlayerSymbol | null {
  const line = getWinningCells(board);
  return line.length ? (board[line[0]] as PlayerSymbol) : null;
}

function applyMove(game: DemoGame, position: number, symbol: PlayerSymbol): DemoGame {
  if (game.status === 'FINISHED') return game;
  if (position < 0 || position > 8 || game.board[position] !== '_') return game;

  const board = game.board.split('');
  board[position] = symbol;
  const nextBoard = board.join('');
  const winner = getWinner(nextBoard);
  const isDraw = !winner && !nextBoard.includes('_');
  const playedAt = now();
  const move: DemoMove = { position, symbol, board: nextBoard, playedAt };

  return {
    ...game,
    board: nextBoard,
    currentTurn: symbol === 'X' ? 'O' : 'X',
    winner,
    isDraw,
    status: winner || isDraw ? 'FINISHED' : 'IN_PROGRESS',
    finishedAt: winner || isDraw ? playedAt : null,
    totalMoves: game.totalMoves + 1,
    moves: [...game.moves, move],
  };
}

function normalizeDifficulty(difficulty?: BotDifficulty | null): DemoBotDifficulty {
  const value = String(difficulty ?? 'hard').toLowerCase();
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'hard';
}

function finalizeIfNeeded(game: DemoGame): DemoGame {
  upsertActiveGame(game);

  if (game.status === 'FINISHED' && game.finishedAt) {
    addHistoryEntry(toHistoryEntry(game));
  }

  return game;
}

function findGame(roomCode: string): DemoGame {
  const existing = getActiveGames().find((game) => game.roomCode === roomCode);
  if (!existing) {
    throw new Error('Demo game not found. Start a new demo match.');
  }
  return existing;
}

export const demoGameService = {
  create(req: CreateGameRequest): Promise<GameResponse> {
    const difficulty = req.mode === 'BOT' ? normalizeDifficulty(req.botDifficulty) : null;
    const game = createEmptyGame(req.mode, difficulty);
    return Promise.resolve(finalizeIfNeeded(game));
  },

  createBotGame(difficulty: BotDifficulty = 'hard'): DemoGame {
    return finalizeIfNeeded(createEmptyGame('BOT', normalizeDifficulty(difficulty)));
  },

  createLocalGame(): DemoGame {
    return finalizeIfNeeded(createEmptyGame('MULTIPLAYER'));
  },

  get(roomCode: string): Promise<GameResponse> {
    return Promise.resolve(findGame(roomCode));
  },

  getOpen(): Promise<GameResponse[]> {
    return Promise.resolve(getActiveGames().filter((game) => game.status === 'IN_PROGRESS'));
  },

  join(roomCode: string): Promise<GameResponse> {
    return Promise.resolve(findGame(roomCode));
  },

  makeMove(req: MakeMoveRequest): Promise<GameResponse> {
    return Promise.resolve(this.makeDemoMove(req.roomCode, req.position));
  },

  makeDemoMove(roomCode: string, position: number): DemoGame {
    const game = findGame(roomCode);
    let next = applyMove(game, position, game.currentTurn);

    if (next.mode === 'BOT' && next.status === 'IN_PROGRESS' && next.currentTurn === 'O') {
      const botPosition = getBotMove(
        next.board.split(''),
        'O',
        'X',
        normalizeDifficulty(next.botDifficulty)
      );
      next = applyMove(next, botPosition, 'O');
    }

    return finalizeIfNeeded(next);
  },

  undo(roomCode: string): Promise<GameResponse> {
    return Promise.resolve(this.undoDemoMove(roomCode));
  },

  undoDemoMove(roomCode: string): DemoGame {
    const game = findGame(roomCode);
    const lastMove = game.moves[game.moves.length - 1];
    const removeCount = game.mode === 'BOT' && lastMove?.symbol === 'O' ? 2 : 1;
    const moves = game.moves.slice(0, Math.max(0, game.moves.length - removeCount));
    const previousMove = moves[moves.length - 1];
    const board = previousMove?.board ?? '_________';
    const currentTurn: PlayerSymbol = moves.length % 2 === 0 ? 'X' : 'O';

    return finalizeIfNeeded({
      ...game,
      board,
      currentTurn,
      winner: null,
      isDraw: false,
      status: 'IN_PROGRESS',
      finishedAt: null,
      totalMoves: moves.length,
      moves,
    });
  },

  restart(roomCode: string): Promise<GameResponse> {
    return Promise.resolve(this.restartDemoGame(roomCode));
  },

  restartDemoGame(roomCode: string): DemoGame {
    const game = findGame(roomCode);
    const restarted = createEmptyGame(game.mode, game.botDifficulty);
    return finalizeIfNeeded({ ...restarted, roomCode, id: game.id, createdAt: now() });
  },

  getMockRooms(): DemoRoom[] {
    const active = getActiveGames()
      .filter((game) => game.status === 'IN_PROGRESS')
      .slice(0, 3)
      .map((game) => ({
        id: game.roomCode,
        roomCode: game.roomCode,
        name: game.mode === 'BOT' ? 'Bot practice table' : 'Local match table',
        mode: game.mode,
        status: 'Ready' as const,
        players: game.mode === 'BOT' ? '1 + bot' : '2 local',
        createdAt: game.createdAt,
      }));

    return [
      ...active,
      {
        id: 'sample-bot',
        roomCode: 'BOT-DEMO',
        name: 'Smart bot warmup',
        mode: 'BOT',
        status: 'Practice',
        players: '1 + bot',
        createdAt: now(),
      },
      {
        id: 'sample-local',
        roomCode: 'LOCAL-2P',
        name: 'Same-device local room',
        mode: 'MULTIPLAYER',
        status: 'Open',
        players: '2 local',
        createdAt: now(),
      },
    ];
  },

  getHistory(page = 0, size = 10): Promise<PagedResponse<GameHistoryResponse>> {
    const history = getHistory();
    const start = page * size;
    const content = history.slice(start, start + size);

    return Promise.resolve({
      content,
      totalElements: history.length,
      totalPages: Math.max(1, Math.ceil(history.length / size)),
      number: page,
      size,
    });
  },

  clearHistory(): void {
    clearDemoHistory();
  },
};
