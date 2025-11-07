import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, dashboardAPI } from './api';
import { TOKEN_KEY } from './constants';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token is valid by making a request
      await dashboardAPI.get();
      setIsAuthenticated(true);
    } catch (err) {
      // Token is invalid, remove it
      localStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.login(username, password);

      // Store the JWT token
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setIsAuthenticated(false);
    }
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
