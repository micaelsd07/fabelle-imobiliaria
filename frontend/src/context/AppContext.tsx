'use client';

/**
 * Shim de compatibilidade.
 *
 * O contexto foi dividido em AuthContext + ThemeContext.
 * Este arquivo mantém a API antiga (`useApp`, `AppProvider`) funcionando
 * para não quebrar as páginas legadas. Novo código deve importar
 * `useAuth` e `useTheme` diretamente.
 */

import React, { useMemo } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export function useApp() {
  const { user, token, loading, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  return useMemo(
    () => ({ user, token, loading, login, logout, theme, toggleTheme }),
    [user, token, loading, login, logout, theme, toggleTheme],
  );
}
