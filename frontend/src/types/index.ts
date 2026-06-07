// ============================================================
// Shared TypeScript types (mirror Java DTOs)
// ============================================================

export type PlayerSymbol = 'X' | 'O';

export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';

export type GameMode = 'MULTIPLAYER' | 'BOT';

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'easy' | 'medium' | 'hard';

// ---- Auth ----

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  email: string;
  userId: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// ---- Game ----

export interface GameResponse {
  id: number;
  roomCode: string;
  playerXUsername: string;
  playerOUsername: string | null;
  mode: GameMode;
  status: GameStatus;
  board: string;           // 9-char: "XO_______"
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | null;
  botDifficulty: BotDifficulty | null;
  totalMoves: number;
  createdAt: string;
  finishedAt: string | null;
  isDraw: boolean;
}

export interface CreateGameRequest {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
}

export interface MakeMoveRequest {
  roomCode: string;
  position: number;
}

// ---- User / Profile ----

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface PublicUserResponse {
  id: number;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
}

// ---- History ----

export interface GameHistoryResponse {
  id: number;
  roomCode: string;
  playerXUsername: string;
  playerOUsername: string;
  mode: GameMode;
  botDifficulty?: BotDifficulty | null;
  winner: PlayerSymbol | null;
  winnerUsername: string | null;
  totalMoves: number;
  finalBoard: string;
  createdAt: string;
  finishedAt: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

// ---- Error ----

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
