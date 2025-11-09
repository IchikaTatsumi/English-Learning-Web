// frontend/src/lib/utils/api-logger.ts

/**
 * API Request/Response Logger
 * Only logs in development mode
 */

interface LogOptions {
  url: string;
  method: string;
  body?: any;
  headers?: HeadersInit;
}

interface ResponseLogOptions {
  url: string;
  method: string;
  status: number;
  data?: any;
  duration: number;
}

class ApiLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private enabled = true;

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Log API request
   */
  logRequest(options: LogOptions) {
    if (!this.isDevelopment || !this.enabled) return;

    console.group(`🌐 API Request: ${options.method} ${options.url}`);
    console.log('Headers:', options.headers);
    if (options.body) {
      console.log('Body:', options.body);
    }
    console.groupEnd();
  }

  /**
   * Log API response
   */
  logResponse(options: ResponseLogOptions) {
    if (!this.isDevelopment || !this.enabled) return;

    const emoji = options.status >= 200 && options.status < 300 ? '✅' : '❌';
    const color = options.status >= 200 && options.status < 300 ? 'green' : 'red';

    console.group(`${emoji} API Response: ${options.method} ${options.url} (${options.duration}ms)`);
    console.log(`%cStatus: ${options.status}`, `color: ${color}; font-weight: bold`);
    if (options.data) {
      console.log('Data:', options.data);
    }
    console.groupEnd();
  }

  /**
   * Log API error
   */
  logError(url: string, method: string, error: any) {
    if (!this.isDevelopment || !this.enabled) return;

    console.group(`❌ API Error: ${method} ${url}`);
    console.error('Error:', error);
    console.groupEnd();
  }

  /**
   * Create timing wrapper
   */
  startTimer(): () => number {
    const start = performance.now();
    return () => Math.round(performance.now() - start);
  }
}

export const apiLogger = new ApiLogger();