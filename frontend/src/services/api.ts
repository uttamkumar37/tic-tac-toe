import axios from 'axios';
import { appConfig } from '@/config/appConfig';
import { demoAuthService } from '@/services/demo/demoAuthService';
import { demoGameService } from '@/services/demo/demoGameService';
import { demoStatsService } from '@/services/demo/demoStatsService';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GameResponse,
  CreateGameRequest,
  MakeMoveRequest,
  UserResponse,
  PublicUserResponse,
  PagedResponse,
  GameHistoryResponse,
} from '@/types';

// ---- Axios instance ----

const api = axios.create({
  baseURL: appConfig.apiBaseUrl || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth');
  if (stored) {
    const auth = JSON.parse(stored) as AuthResponse;
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.hash = '#/login';
    }
    const message =
      error.response?.data?.message ?? error.message ?? 'Unknown error';
    return Promise.reject(new Error(message));
  },
);

// ---- Auth ----

export const authAPI = {
  register: (req: RegisterRequest) =>
    appConfig.isDemoMode
      ? demoAuthService.register(req)
      : api.post<AuthResponse>('/auth/register', req).then((r) => r.data),

  login: (req: LoginRequest) =>
    appConfig.isDemoMode
      ? demoAuthService.login(req)
      : api.post<AuthResponse>('/auth/login', req).then((r) => r.data),
};

// ---- Game ----

export const gameAPI = {
  create: (req: CreateGameRequest) =>
    appConfig.isDemoMode
      ? demoGameService.create(req)
      : api.post<GameResponse>('/games', req).then((r) => r.data),

  join: (roomCode: string) =>
    appConfig.isDemoMode
      ? demoGameService.join(roomCode)
      : api.post<GameResponse>(`/games/${roomCode}/join`).then((r) => r.data),

  get: (roomCode: string) =>
    appConfig.isDemoMode
      ? demoGameService.get(roomCode)
      : api.get<GameResponse>(`/games/${roomCode}`).then((r) => r.data),

  getOpen: () =>
    appConfig.isDemoMode
      ? demoGameService.getOpen()
      : api.get<GameResponse[]>('/games/open').then((r) => r.data),

  makeMove: (req: MakeMoveRequest) =>
    appConfig.isDemoMode
      ? demoGameService.makeMove(req)
      : api.post<GameResponse>('/games/move', req).then((r) => r.data),

  undo: (roomCode: string) =>
    appConfig.isDemoMode
      ? demoGameService.undo(roomCode)
      : api.post<GameResponse>(`/games/${roomCode}/undo`).then((r) => r.data),

  restart: (roomCode: string) =>
    appConfig.isDemoMode
      ? demoGameService.restart(roomCode)
      : api.post<GameResponse>(`/games/${roomCode}/restart`).then((r) => r.data),
};

// ---- User ----

export const userAPI = {
  getMe: () =>
    appConfig.isDemoMode
      ? Promise.resolve(demoStatsService.getStats())
      : api.get<UserResponse>('/users/me').then((r) => r.data),

  getUser: (username: string) => {
    if (appConfig.isDemoMode) {
      const stats = demoStatsService.getStats();
      const publicUser: PublicUserResponse = {
        id: stats.id,
        username,
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
      };

      return Promise.resolve(publicUser);
    }

    return api.get<PublicUserResponse>(`/users/${username}`).then((r) => r.data);
  },
};

// ---- History ----

export const historyAPI = {
  getHistory: (page = 0, size = 10) =>
    appConfig.isDemoMode
      ? demoGameService.getHistory(page, size)
      : api
          .get<PagedResponse<GameHistoryResponse>>('/history', { params: { page, size } })
          .then((r) => r.data),
};

export default api;
