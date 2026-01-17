// frontend/src/lib/utils/local-storage.ts

/**
 * Type-safe localStorage wrapper
 * Handles JSON serialization/deserialization safely
 */
class LocalStorage {
  /**
   * Get item from localStorage
   * ✅ FIX: Chặn chuỗi "undefined" và xử lý lỗi parse JSON
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = window.localStorage.getItem(key);

      // 1. Nếu không có item hoặc item là chuỗi rác "undefined"/"null" -> trả về null
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }

      // 2. Thử parse JSON
      return JSON.parse(item);
    } catch (error) {
      // 3. Fallback: Nếu item là raw string (ví dụ token cũ) mà không phải JSON
      // thì trả về nguyên gốc để không làm gián đoạn app.
      const rawItem = window.localStorage.getItem(key);
      if (rawItem && rawItem !== 'undefined') {
        return rawItem as unknown as T;
      }
      
      console.error(`Error getting localStorage item "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   * ✅ FIX: Ngăn chặn việc lưu giá trị undefined/null
   */
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    // 1. Chặn tuyệt đối việc lưu undefined hoặc null
    if (value === undefined || value === null) {
      console.warn(`⚠️ [LocalStorage] Attempted to store undefined/null in "${key}". Ignoring.`);
      // Tùy chọn: Xóa key cũ nếu giá trị mới là null
      this.remove(key); 
      return;
    }

    try {
      // 2. Stringify an toàn
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, valueToStore);
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

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  }

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