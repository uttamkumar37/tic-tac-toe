import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GameResponse } from '@/types';

interface GameState {
  currentGame: GameResponse | null;
  openGames: GameResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  currentGame: null,
  openGames: [],
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame(state, action: PayloadAction<GameResponse>) {
      state.currentGame = action.payload;
    },
    updateGameState(state, action: PayloadAction<GameResponse>) {
      // Called by WebSocket onMessage to apply real-time updates
      state.currentGame = action.payload;
    },
    setOpenGames(state, action: PayloadAction<GameResponse[]>) {
      state.openGames = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearGame(state) {
      state.currentGame = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentGame,
  updateGameState,
  setOpenGames,
  setLoading,
  setError,
  clearGame,
} = gameSlice.actions;

export default gameSlice.reducer;
