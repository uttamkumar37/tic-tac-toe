import type { GameHistoryResponse, UserResponse } from '@/types';
import { demoUser, getHistory } from './demoStorage';

export interface DemoStats extends UserResponse {
  displayName: string;
  winRate: number;
  favoriteMode: string;
  botGames: number;
  localGames: number;
}

function isDemoWin(game: GameHistoryResponse): boolean {
  return game.winnerUsername === demoUser.username;
}

function isDemoLoss(game: GameHistoryResponse): boolean {
  return Boolean(game.winnerUsername) && game.winnerUsername !== demoUser.username;
}

export const demoStatsService = {
  getStats(): DemoStats {
    const history = getHistory();
    const totalGames = history.length;
    const wins = history.filter(isDemoWin).length;
    const losses = history.filter(isDemoLoss).length;
    const draws = history.filter((game) => !game.winnerUsername).length;
    const botGames = history.filter((game) => game.mode === 'BOT').length;
    const localGames = history.filter((game) => game.mode === 'MULTIPLAYER').length;
    const favoriteMode = botGames === localGames
      ? 'Balanced'
      : botGames > localGames
        ? 'Play vs Bot'
        : 'Local 2 Player';

    return {
      id: demoUser.id,
      username: demoUser.username,
      displayName: demoUser.displayName,
      email: demoUser.email,
      totalGames,
      wins,
      losses,
      draws,
      winRate: totalGames ? Math.round((wins / totalGames) * 100) : 0,
      favoriteMode,
      botGames,
      localGames,
    };
  },
};
