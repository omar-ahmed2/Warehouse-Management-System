import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppData, STORAGE_KEY, INITIAL_DATA } from '../utils/seedData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product } from '../types/product.types';
import { User } from '../types/user.types';
import { IncomingOrder, OutgoingOrder, InventoryItem } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { useAuth } from './AuthContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface AppContextType {
  data: AppData;
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
  updateData: (newData: Partial<AppData>) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getItem, setItem } = useLocalStorage();
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const stored = getItem(STORAGE_KEY);
    if (stored) {
      setData(stored);
    } else {
      setItem(STORAGE_KEY, INITIAL_DATA);
    }
  }, []);

  const updateData = useCallback((newData: Partial<AppData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData };
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  }, [setItem]);

  const resetData = useCallback(() => {
    setData(INITIAL_DATA);
    setItem(STORAGE_KEY, INITIAL_DATA);
  }, [setItem]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ 
    data, 
    showToast, 
    toasts, 
    removeToast, 
    updateData,
    resetData 
  }), [data, showToast, toasts, removeToast, updateData, resetData]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
