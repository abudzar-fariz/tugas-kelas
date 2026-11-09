import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: sessionStorage.getItem('token'),
    isLoading: true,
  });

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authApi
      .getMe()
      .then(({ user }) => setState({ user, token, isLoading: false }))
      .catch(() => {
        sessionStorage.removeItem('token');
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    sessionStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  }, []);

  const register = useCallback(async (payload: authApi.RegisterPayload) => {
    const { token, user } = await authApi.register(payload);
    sessionStorage.setItem('token', token);
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
