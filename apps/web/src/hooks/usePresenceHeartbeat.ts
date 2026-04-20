import { useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const INTERVAL_MS = 45_000;

/**
 * Envia POST /me/presence em intervalos enquanto há sessão (app aberto).
 * Mantém lastSeenAt no servidor para a lista “online agora”.
 */
export function usePresenceHeartbeat() {
  const token = useAuthStore((s) => s.token);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) return;

    const send = () => {
      const t = tokenRef.current;
      if (!t) return;
      void apiFetch<void>('/me/presence', { method: 'POST', token: t }).catch(() => {});
    };

    send();
    const id = window.setInterval(send, INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') send();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);
}
