'use client';

import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { ResetPasswordDto } from '../dtos/request/reset-password.dto';
import { UserDto } from '../dtos/response/auth-response.dto';
import { authStorage, userStorage } from '@/lib/utils/local-storage';
import { toast } from '@/lib/utils/toast';

export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      // Gọi service, service sẽ lo việc lưu Storage và Cookie
      const response = await authService.login(dto);
      
      if (response.success && response.data) {
        // Lấy thông tin user để update state React
        const data = response.data as any;
        let userData = data.user || data.data?.user;

        if (userData) {
           setUser(userData);
           toast.success('Login successful!');
        } else {
           // Nếu không có user trong response login, gọi fetchIdentity để lấy
           const userRes = await authService.getIdentity();
           if (userRes.success && userRes.data) {
             setUser(userRes.data);
             userStorage.setUser(userRes.data);
           }
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    setIsLoading(true);
    try {
      const response = await authService.register(dto);
      if (response.success) {
        toast.success('Registration successful! Please login.');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      return response;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      // Force reload để xóa sạch mọi state cũ
      window.location.href = '/login'; 
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Các hàm khác giữ nguyên hoặc gọi service tương ứng
  const forgotPassword = async (email: string) => authService.forgotPassword(email);
  const resetPassword = async (dto: ResetPasswordDto) => authService.resetPassword(dto);
  const fetchIdentity = async () => authService.getIdentity();

  return {
    user,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    fetchIdentity,
    isAuthenticated: !!user,
  };
}