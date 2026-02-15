import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lobbyApi } from '../api/lobby.api';

export function useHeartbeat() {
  const { user } = useAuth();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    lobbyApi.heartbeat().catch(() => {});

    intervalRef.current = window.setInterval(() => {
      lobbyApi.heartbeat().catch(() => {});
    }, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);
}
