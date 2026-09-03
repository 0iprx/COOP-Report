import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  id: number;
  username: string;
  role: 'trainee' | 'supervisor';
  supervisorId?: number | null;
  supervisor?: { id: number; username: string } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('coop_auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
      localStorage.removeItem('coop_auth_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('coop_auth_token', res.data.token);
    }
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('coop_auth_token', res.data.token);
    }
    setUser(res.data.user);
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo');
    if (res.data.token) {
      localStorage.setItem('coop_auth_token', res.data.token);
    }
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('coop_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
