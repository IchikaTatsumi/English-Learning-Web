import { apiClient } from '@/lib/api/client';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { ResetPasswordDto } from '../dtos/request/reset-password.dto';
import { AuthResponseDto, UserDto } from '../dtos/response/auth-response.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';
import { authStorage, userStorage } from '@/lib/utils/local-storage';

export class AuthService {
  /**
   * User login
   * POST /auth/login
   */
  async login(dto: LoginDto): Promise<ServerResponseModel<AuthResponseDto>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', dto, {
      cache: false,
    });
    
    if (response.success && response.data) {
      authStorage.setAccessToken(response.data.accessToken);
      userStorage.setUser(response.data.user);
    }
    
    return response;
  }

  /**
   * User registration
   * POST /auth/register
   */
  async register(dto: RegisterDto): Promise<ServerResponseModel<UserDto>> {
    return apiClient.post('/auth/register', dto, {
      cache: false,
    });
  }

  /**
   * ✅ NEW: Request password reset email
   * POST /auth/forgot-password
   * Backend: AuthController.forgotPassword()
   */
  async forgotPassword(email: string): Promise<ServerResponseModel<{ message: string }>> {
    return apiClient.post('/auth/forgot-password', { email }, {
      cache: false,
    });
  }

  /**
   * ✅ UPDATED: Reset password with token
   * POST /auth/reset-password
   * Backend: AuthController.resetPassword()
   */
  async resetPassword(dto: ResetPasswordDto): Promise<ServerResponseModel<{ message: string }>> {
    return apiClient.post('/auth/reset-password', dto, {
      cache: false,
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<ServerResponseModel<void>> {
    authStorage.clearAuth();
    apiClient.invalidateCache();
    
    return {
      success: true,
      statusCode: 200,
    };
  }

  /**
   * Get current user identity
   * GET /users/me
   */
  async getIdentity(): Promise<ServerResponseModel<UserDto>> {
    return apiClient.get('/users/me', {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  /**
   * Check authentication status
   */
  async check(params?: { role?: string }): Promise<ServerResponseModel<boolean>> {
    const token = authStorage.getAccessToken();
    
    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: 'Not authenticated'
      };
    }

    const response = await this.getIdentity();
    
    if (!response.success) {
      return {
        success: false,
        statusCode: 401,
        message: 'Invalid token'
      };
    }

    if (params?.role && response.data) {
      const hasRole = response.data.role === params.role;
      return {
        success: hasRole,
        statusCode: hasRole ? 200 : 403,
        data: hasRole
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: true
    };
  }
}

export const authService = new AuthService();