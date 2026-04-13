import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);

  const logout = useCallback(() => {
    const wasAdmin = useAuthStore.getState().user?.role === 'ADMIN';
    queryClient.clear();
    clear();
    navigate(wasAdmin ? '/admin/login' : '/login', { replace: true });
  }, [clear, navigate, queryClient]);

  return { token, user, setSession, clear, logout };
}
