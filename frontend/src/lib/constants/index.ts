// frontend/src/lib/constants/index.ts

/**
 * Application-wide constants
 */

// Re-export enums
export * from './enums';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api',
  TIMEOUT: 30000, // 30 seconds
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Quiz Configuration
export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  DEFAULT_QUESTIONS: 10,
  TIME_LIMIT_SECONDS: 30,
  PASSING_SCORE: 75, // Percentage
} as const;

// Practice Configuration
export const PRACTICE_CONFIG = {
  MIN_CORRECT_TO_LEARN: 3, // Out of 4 questions
  TOTAL_PRACTICE_QUESTIONS: 4,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VOCABULARIES: '/dashboard/vocabularies',
  QUIZ: '/dashboard/quiz',
  PROGRESS: '/dashboard/progress',
  LEARNED: '/dashboard/learned',
  PROFILE: '/dashboard/profile',
  // Admin routes
  ADMIN: {
    USERS: '/dashboard/usermanagement',
    TOPICS: '/dashboard/topicmanagement',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  VIEW_MODE: 'viewMode',
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
} as const;