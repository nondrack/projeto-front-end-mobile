import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { cinemaApi } from '@/services/cinema-api';
import type { AuthUser } from '@/types/cinema';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (payload: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const session = await cinemaApi.getUserSession();
      setToken(session.token ?? null);
      setUser((session.user as AuthUser) ?? null);
    };

    void loadSession();
  }, []);

  const login = async (email: string, senha: string) => {
    const auth = await cinemaApi.login(email, senha);
    setToken(auth.token);
    setUser(auth.user);
    await AsyncStorage.setItem('cinemax-token', auth.token);
    await AsyncStorage.setItem('cinemax-user', JSON.stringify(auth.user));
  };

  const register = async (payload: { nome: string; email: string; senha: string; cpf?: string; telefone?: string }) => {
    const auth = await cinemaApi.register(payload);
    setToken(auth.token);
    setUser(auth.user);
    await AsyncStorage.setItem('cinemax-token', auth.token);
    await AsyncStorage.setItem('cinemax-user', JSON.stringify(auth.user));
  };

  const logout = async () => {
    await cinemaApi.logout();
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
