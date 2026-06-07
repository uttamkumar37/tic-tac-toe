import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import { demoUser } from './demoStorage';

const demoAuth: AuthResponse = {
  token: 'demo-token-browser-only',
  tokenType: 'Bearer',
  username: demoUser.username,
  email: demoUser.email,
  userId: demoUser.id,
};

export const demoAuthService = {
  getDemoAuth(): AuthResponse {
    return demoAuth;
  },

  login(_req?: LoginRequest): Promise<AuthResponse> {
    localStorage.setItem('auth', JSON.stringify(demoAuth));
    return Promise.resolve(demoAuth);
  },

  register(_req?: RegisterRequest): Promise<AuthResponse> {
    localStorage.setItem('auth', JSON.stringify(demoAuth));
    return Promise.resolve(demoAuth);
  },
};
