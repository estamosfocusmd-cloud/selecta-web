import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types';

const BASE = (import.meta.env.VITE_API_URL as string) || 'https://selecta-web.onrender.com';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('selecta_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    // Validate token with backend
    axios.get(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => {
        setToken(storedToken);
        setUser(res.data);
        localStorage.setItem('selecta_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('selecta_token');
        localStorage.removeItem('selecta_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(token: string, user: User) {
    setToken(token);
    setUser(user);
    localStorage.setItem('selecta_token', token);
    localStorage.setItem('selecta_user', JSON.stringify(user));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('selecta_token');
    localStorage.removeItem('selecta_user');
  }

  function updateUser(partial: Partial<User>) {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('selecta_user', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
