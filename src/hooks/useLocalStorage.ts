import { useCallback } from 'react';

export const useLocalStorage = () => {
  const setItem = useCallback((key: string, value: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage', error);
    }
  }, []);

  const getItem = useCallback((key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting localStorage', error);
      return null;
    }
  }, []);

  const removeItem = useCallback((key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage', error);
    }
  }, []);

  return { setItem, getItem, removeItem };
};
