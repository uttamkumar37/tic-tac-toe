import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GameResponse,
  CreateGameRequest,
  MakeMoveRequest,
  UserResponse,
  PagedResponse,
  GameHistoryResponse,
} from '@/types';

// ---- Axios instance ----

const api = axios.create({
  baseURL: '/api',
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
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ?? error.message ?? 'Unknown error';
    return Promise.reject(new Error(message));
  },
);

// ---- Auth ----

export const authAPI = {
  register: (req: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', req).then((r) => r.data),

  login: (req: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', req).then((r) => r.data),
};

// ---- Game ----

export const gameAPI = {
  create: (req: CreateGameRequest) =>
    api.post<GameResponse>('/games', req).then((r) => r.data),

  join: (roomCode: string) =>
    api.post<GameResponse>(`/games/${roomCode}/join`).then((r) => r.data),

  get: (roomCode: string) =>
    api.get<GameResponse>(`/games/${roomCode}`).then((r) => r.data),

  getOpen: () =>
    api.get<GameResponse[]>('/games/open').then((r) => r.data),

  makeMove: (req: MakeMoveRequest) =>
    api.post<GameResponse>('/games/move', req).then((r) => r.data),

  undo: (roomCode: string) =>
    api.post<GameResponse>(`/games/${roomCode}/undo`).then((r) => r.data),

  restart: (roomCode: string) =>
    api.post<GameResponse>(`/games/${roomCode}/restart`).then((r) => r.data),
};

// ---- User ----

export const userAPI = {
  getMe: () =>
    api.get<UserResponse>('/users/me').then((r) => r.data),

  getUser: (username: string) =>
    api.get<UserResponse>(`/users/${username}`).then((r) => r.data),
};

// ---- History ----

export const historyAPI = {
  getHistory: (page = 0, size = 10) =>
    api
      .get<PagedResponse<GameHistoryResponse>>('/history', { params: { page, size } })
      .then((r) => r.data),
};

export default api;
