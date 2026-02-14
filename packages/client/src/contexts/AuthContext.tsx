import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@baduk/shared';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../utils/token';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch {
          tokenStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string, rememberMe = false) => {
    const res = await authApi.login({ username, password, rememberMe });
    tokenStorage.setTokens(res.accessToken, res.refreshToken, rememberMe);
    setUser(res.user);
  }, []);

  const register = useCallback(async (username: string, password: string, nickname: string) => {
    const res = await authApi.register({ username, password, nickname });
    tokenStorage.setTokens(res.accessToken, res.refreshToken, false);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
