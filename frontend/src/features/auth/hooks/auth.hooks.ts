'use client';

import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(dto);
      // Store tokens in localStorage or cookies
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(dto);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    register,
    logout,
    isLoading,
    error,
  };
}
