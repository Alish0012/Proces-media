'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { apiFetch } from './api';

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'procesmedia_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    apiFetch<{ user: User }>('/api/auth/me', { token: stored })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name: string, email: string, password: string) {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
