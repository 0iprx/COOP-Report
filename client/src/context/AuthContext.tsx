import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken, getAccessToken } from '../services/api';

export interface AuthUser {
  id: number;
  username: string;
  role: 'trainee' | 'supervisor';
  supervisorId?: number | null;
  supervisor?: { id: number; username: string } | null;
  tenantId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setLoading(false);
        return;
      }

      // If no token in memory, try silent refresh with httpOnly cookie
      try {
        const refreshRes = await api.post('/auth/refresh');
        if (refreshRes.data.token) {
          setAccessToken(refreshRes.data.token);
          const meRes = await api.get('/auth/me');
          setUser(meRes.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      setAccessToken(res.data.token);
    }
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      setAccessToken(res.data.token);
    }
    setUser(res.data.user);
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo');
    if (res.data.token) {
      setAccessToken(res.data.token);
    }
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    setAccessToken(null);
    setUser(null);
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
    } catch {
      // Ignore
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
