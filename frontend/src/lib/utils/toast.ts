// frontend/src/lib/utils/toast.ts

/**
 * Toast notification utility
 * Simple wrapper that can be replaced with any toast library
 * (e.g., react-hot-toast, sonner, etc.)
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

class ToastManager {
  /**
   * Show success toast
   */
  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  }

  /**
   * Show error toast
   */
  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  }

  /**
   * Show warning toast
   */
  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options);
  }

  /**
   * Show info toast
   */
  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  }

  /**
   * Show toast (internal method)
   * TODO: Replace with actual toast library implementation
   */
  private show(message: string, type: ToastType, options?: ToastOptions) {
    // For now, use console and alert
    // Replace this with your preferred toast library
    
    const icon = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[type];

    console.log(`${icon} ${type.toUpperCase()}: ${message}`);

    // In development, show alert
    if (process.env.NODE_ENV === 'development') {
      // Don't block with alerts in production
      // window.alert(`${icon} ${message}`);
    }

    // TODO: Replace with actual toast implementation
    // Example with react-hot-toast:
    // import toast from 'react-hot-toast';
    // toast[type](message, { duration: options?.duration || 3000 });
    
    // Example with sonner:
    // import { toast } from 'sonner';
    // toast[type](message);
  }

  /**
   * Show promise-based toast
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> {
    this.info(messages.loading);

    return promise
      .then((data) => {
        const successMsg = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        this.success(successMsg);
        return data;
      })
      .catch((error) => {
        const errorMsg = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error;
        this.error(errorMsg);
        throw error;
      });
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