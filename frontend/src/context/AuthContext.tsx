'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setOnUnauthorized } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  creci?: string;
  phone?: string;
  whatsapp?: string;
  photo?: string;
  commissionRate?: number;
  salesMeta?: number;
}

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fabelle-token';
const USER_KEY = 'fabelle-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Ref-based routerRef prevents inclusion of router in effect deps.
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    routerRef.current.push('/login');
  }, []);

  // Registra handler global de 401 vindo do api.ts (só 1x — logout é estável).
  useEffect(() => {
    setOnUnauthorized(() => logout());
    return () => setOnUnauthorized(null);
  }, [logout]);

  // Route protection — router usado via ref para não entrar nas deps.
  useEffect(() => {
    if (loading) return;
    const isDashboardRoute = pathname?.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/cadastro' || pathname?.startsWith('/recuperar');
    if (isDashboardRoute && !user) routerRef.current.push('/login');
    else if (isAuthRoute && user) routerRef.current.push('/dashboard/overview');
  }, [user, pathname, loading]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const data = await api.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
    routerRef.current.push('/dashboard/overview');
    return true;
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
