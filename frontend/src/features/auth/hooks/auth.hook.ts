'use client';

import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { ResetPasswordDto } from '../dtos/request/reset-password.dto';
import { AuthResponseDto, UserDto } from '../dtos/response/auth-response.dto';
import { authStorage, userStorage } from '@/lib/utils/local-storage';
import { toast } from '@/lib/utils/toast';

export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = () => {
      const token = authStorage.getAccessToken();
      const storedUser = userStorage.getUser<UserDto>();
      
      if (token && storedUser) {
        setUser(storedUser);
      }
      
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(dto);
      
      if (response.success && response.data) {
        const { accessToken, user } = response.data;
        
        authStorage.setAccessToken(accessToken);
        userStorage.setUser(user);
        
        setUser(user);
        toast.success('Login successful!');
        
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register user
   */
  const register = useCallback(async (dto: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(dto);
      
      if (response.success && response.data) {
        toast.success('Registration successful! Please login.');
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ NEW: Request password reset email
   */
  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('Reset email sent! Please check your inbox.');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ NEW: Reset password with token
   */
  const resetPassword = useCallback(async (dto: ResetPasswordDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(dto);
      
      if (response.success) {
        toast.success('Password reset successfully!');
        return response.data;
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      
      authStorage.clearAuth();
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current user identity
   */
  const fetchIdentity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.getIdentity();
      
      if (response.success && response.data) {
        setUser(response.data);
        userStorage.setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user identity');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch identity';
      setError(message);
      
      authStorage.clearAuth();
      setUser(null);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!user && !!authStorage.getAccessToken();
  }, [user]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return user?.role === 'Admin';
  }, [user]);

  return {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    forgotPassword, // ✅ NEW
    resetPassword,  // ✅ NEW
    logout,
    fetchIdentity,
    isAuthenticated,
    isAdmin,
  };
}