// frontend/src/lib/utils/local-storage.ts

/**
 * Type-safe localStorage wrapper
 * Handles JSON serialization/deserialization
 */

class LocalStorage {
  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    if (typeof window === 'undefined') return [];
    return Object.keys(window.localStorage);
  }
}

export const localStorage = new LocalStorage();

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  VIEW_MODE: 'viewMode',
} as const;

/**
 * Type-safe getters/setters for common storage items
 */

export const authStorage = {
  getAccessToken: () => localStorage.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => localStorage.set(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeAccessToken: () => localStorage.remove(STORAGE_KEYS.ACCESS_TOKEN),
  
  getRefreshToken: () => localStorage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => localStorage.set(STORAGE_KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: () => localStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
  
  clearAuth: () => {
    localStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.remove(STORAGE_KEYS.USER);
  },
};

export const userStorage = {
  getUser: <T>() => localStorage.get<T>(STORAGE_KEYS.USER),
  setUser: <T>(user: T) => localStorage.set(STORAGE_KEYS.USER, user),
  removeUser: () => localStorage.remove(STORAGE_KEYS.USER),
};

export const themeStorage = {
  getTheme: () => localStorage.get<string>(STORAGE_KEYS.THEME) || 'light',
  setTheme: (theme: string) => localStorage.set(STORAGE_KEYS.THEME, theme),
};