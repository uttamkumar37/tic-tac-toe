import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import { authAPI } from '@/services/api';
import { appConfig } from '@/config/appConfig';
import { demoAuthService } from '@/services/demo/demoAuthService';

interface AuthState {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
}

function loadStoredAuth(): AuthResponse | null {
  if (appConfig.isDemoMode) {
    return demoAuthService.getDemoAuth();
  }

  const stored = localStorage.getItem('auth');
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AuthResponse>;
    if (!parsed.token || !parsed.username || !parsed.email) {
      localStorage.removeItem('auth');
      return null;
    }
    return parsed as AuthResponse;
  } catch {
    localStorage.removeItem('auth');
    return null;
  }
}

const initialState: AuthState = {
  user: loadStoredAuth(),
  loading: false,
  error: null,
};

// ---- Async thunks ----

export const login = createAsyncThunk(
  'auth/login',
  async (req: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(req);
      localStorage.setItem('auth', JSON.stringify(data));
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return rejectWithValue(msg);
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (req: RegisterRequest, { rejectWithValue }) => {
    try {
      const data = await authAPI.register(req);
      localStorage.setItem('auth', JSON.stringify(data));
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return rejectWithValue(msg);
    }
  },
);

// ---- Slice ----

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('auth');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const loadingCases = [login.pending, register.pending];
    const successCases = [login.fulfilled, register.fulfilled];
    const rejectedCases = [login.rejected, register.rejected];

    loadingCases.forEach((action) => {
      builder.addCase(action, (state) => {
        state.loading = true;
        state.error = null;
      });
    });

    successCases.forEach((action) => {
      builder.addCase(action, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload;
      });
    });

    rejectedCases.forEach((action) => {
      builder.addCase(action, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
