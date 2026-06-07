type AppMode = 'demo' | 'live';

const requestedMode = (import.meta.env.VITE_APP_MODE || 'demo') as AppMode;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || '';

export const appConfig = {
  mode: requestedMode,
  apiBaseUrl,
  wsBaseUrl,
  isDemoMode: !apiBaseUrl || requestedMode === 'demo',
  publicUrl: 'https://tictactoe.mycloudcampus.in',
  portfolioUrl: 'https://uttam.mycloudcampus.in',
  productUrl: 'https://mycloudcampus.in',
  githubUrl: 'https://github.com/uttamkumar/tic-tac-toe',
};

export type { AppMode };
