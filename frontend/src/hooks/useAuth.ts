import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((s: RootState) => s.auth);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout: () => dispatch(logout()),
  };
}
