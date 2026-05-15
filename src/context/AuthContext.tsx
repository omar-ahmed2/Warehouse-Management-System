import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types/user.types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEY, SEED_DATA, AppData } from '../utils/seedData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem, removeItem } = useLocalStorage();

  useEffect(() => {
    const initializeAuth = () => {
      const storedData = getItem(STORAGE_KEY) as AppData | null;
      if (!storedData) {
        setItem(STORAGE_KEY, SEED_DATA);
      }

      const sessionUser = window.sessionStorage.getItem('makhzan_session');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [getItem, setItem]);

  const login = useCallback((email: string, password: string) => {
    const data = getItem(STORAGE_KEY) as AppData | null;
    if (!data) return false;

    const foundUser = data.users.find((u) => u.email === email && u.password === password && u.isActive);
    if (foundUser) {
      setUser(foundUser);
      window.sessionStorage.setItem('makhzan_session', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, [getItem]);

  const logout = useCallback(() => {
    setUser(null);
    window.sessionStorage.removeItem('makhzan_session');
  }, []);

  const contextValue = React.useMemo(() => ({ 
    user, 
    login, 
    logout, 
    isAuthenticated: !!user, 
    isLoading 
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
