// frontend/src/lib/utils/toast.ts
import hotToast, { ToastOptions as HotToastOptions } from 'react-hot-toast';

/**
 * Toast notification utility
 * Wrapper for react-hot-toast
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: HotToastOptions['position'];
}

class ToastManager {
  /**
   * Show success toast
   */
  success(message: string, options?: ToastOptions) {
    hotToast.success(message, {
      duration: options?.duration,
      position: options?.position,
    });
  }

  /**
   * Show error toast
   */
  error(message: string, options?: ToastOptions) {
    hotToast.error(message, {
      duration: options?.duration,
      position: options?.position,
    });
  }

  /**
   * Show warning toast (Custom icon)
   */
  warning(message: string, options?: ToastOptions) {
    hotToast(message, {
      icon: '⚠️',
      duration: options?.duration,
      position: options?.position,
    });
  }

  /**
   * Show info toast (Custom icon)
   */
  info(message: string, options?: ToastOptions) {
    hotToast(message, {
      icon: 'ℹ️',
      duration: options?.duration,
      position: options?.position,
    });
  }

  /**
   * Show promise-based toast
   * Automatically handles loading, success, and error states
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    return hotToast.promise(promise, messages);
  }
}

export const toast = new ToastManager();

/**
 * Show API error as toast
 */
export function showApiError(error: any) {
  const message = error?.message || 'An error occurred';
  toast.error(message);
}

/**
 * Show API success as toast
 */
export function showApiSuccess(message: string = 'Operation successful') {
  toast.success(message);
}