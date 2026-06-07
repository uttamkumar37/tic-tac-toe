import type { BotDifficulty, GameHistoryResponse, GameMode, GameResponse, PlayerSymbol } from '@/types';

export interface DemoUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
}

export interface DemoRoom {
  id: string;
  roomCode: string;
  name: string;
  mode: GameMode;
  status: 'Open' | 'Ready' | 'Practice';
  players: string;
  createdAt: string;
}

export interface DemoMove {
  position: number;
  symbol: PlayerSymbol;
  board: string;
  playedAt: string;
}

export interface DemoGame extends GameResponse {
  moves: DemoMove[];
}

const STORAGE_PREFIX = 'ttt_demo';

export const demoUser: DemoUser = {
  id: 1,
  username: 'demo_player',
  displayName: 'Demo Player',
  email: 'demo_player@example.local',
};

export const demoStorageKeys = {
  activeGames: `${STORAGE_PREFIX}_active_games`,
  history: `${STORAGE_PREFIX}_history`,
};

function isBrowser() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getActiveGames(): DemoGame[] {
  return readStorage<DemoGame[]>(demoStorageKeys.activeGames, []);
}

export function saveActiveGames(games: DemoGame[]): void {
  writeStorage(demoStorageKeys.activeGames, games);
}

export function upsertActiveGame(game: DemoGame): DemoGame {
  const games = getActiveGames();
  const next = [game, ...games.filter((item) => item.roomCode !== game.roomCode)].slice(0, 10);
  saveActiveGames(next);
  return game;
}

export function getHistory(): GameHistoryResponse[] {
  return readStorage<GameHistoryResponse[]>(demoStorageKeys.history, []);
}

export function saveHistory(history: GameHistoryResponse[]): void {
  writeStorage(demoStorageKeys.history, history);
}

export function addHistoryEntry(entry: GameHistoryResponse): void {
  const history = getHistory();
  const exists = history.some((item) => item.roomCode === entry.roomCode && item.finishedAt === entry.finishedAt);
  if (!exists) {
    saveHistory([entry, ...history].slice(0, 50));
  }
}

export function clearDemoHistory(): void {
  saveHistory([]);
}

export function createEmptyGame(mode: GameMode, difficulty: BotDifficulty | null = null): DemoGame {
  const now = new Date().toISOString();
  const roomCode = Math.random().toString(36).slice(2, 10).toUpperCase();

  return {
    id: Date.now(),
    roomCode,
    playerXUsername: demoUser.username,
    playerOUsername: mode === 'BOT' ? 'Smart Bot' : 'Local Player O',
    mode,
    status: 'IN_PROGRESS',
    board: '_________',
    currentTurn: 'X',
    winner: null,
    botDifficulty: difficulty,
    totalMoves: 0,
    createdAt: now,
    finishedAt: null,
    isDraw: false,
    moves: [],
  };
}

export function toHistoryEntry(game: DemoGame): GameHistoryResponse {
  return {
    id: Date.now(),
    roomCode: game.roomCode,
    playerXUsername: game.playerXUsername,
    playerOUsername: game.playerOUsername ?? '',
    mode: game.mode,
    botDifficulty: game.botDifficulty,
    winner: game.winner,
    winnerUsername: game.winner
      ? game.winner === 'X'
        ? game.playerXUsername
        : game.playerOUsername
      : null,
    totalMoves: game.totalMoves,
    finalBoard: game.board,
    createdAt: game.createdAt,
    finishedAt: game.finishedAt,
  };
}
