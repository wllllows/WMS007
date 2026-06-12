import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/authService';
import type { LoginResponse } from '../services/authService';
import api from '../services/api';

interface AuthState extends LoginResponse { isLoggedIn: boolean; }
interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  canAccess: (menu: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem('wms_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      return { ...parsed, isLoggedIn: true };
    }
    return { isLoggedIn: false, token: '', username: '', role: '', name: '', menus: [] };
  });

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    sessionStorage.setItem('wms_auth', JSON.stringify(data));
    setAuth({ ...data, isLoggedIn: true });
    navigate('/dashboard');
  };

  const logout = () => {
    sessionStorage.removeItem('wms_auth');
    delete api.defaults.headers.common['Authorization'];
    setAuth({ isLoggedIn: false, token: '', username: '', role: '', name: '', menus: [] });
    navigate('/login');
  };

  const canAccess = (menu: string) => auth.menus.includes(menu);

  return <AuthContext.Provider value={{ ...auth, login, logout, canAccess }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
