import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get stored value from localStorage
  const storedValue = localStorage.getItem(key);
  const initial = storedValue ? JSON.parse(storedValue) : initialValue;

  const [value, setValue] = useState<T>(initial);

  // Update localStorage when value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
