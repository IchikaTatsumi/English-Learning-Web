'use client';

import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dtos/auth.dto';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // TODO: Call API to get current user
        const mockUser = {
          user_id: 1,
          full_name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          role: 'User',
          created_at: '2024-01-15'
        };
        setUser(mockUser);
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(dto);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
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
      setUser(response.user);
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
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    login,
    register,
    logout,
    isLoading,
    error,
  };
}