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
   * Backend: AuthController.login()
   */
  async login(dto: LoginDto): Promise<ServerResponseModel<AuthResponseDto>> {
    // Don't cache login requests
    const response = await apiClient.post<AuthResponseDto>('/auth/login', dto, {
      cache: false,
    });
    
    if (response.success && response.data) {
      // Store token and user
      authStorage.setAccessToken(response.data.accessToken);
      userStorage.setUser(response.data.user);
    }
    
    return response;
  }

  /**
   * User registration
   * POST /auth/register
   * Backend: AuthController.register()
   */
  async register(dto: RegisterDto): Promise<ServerResponseModel<UserDto>> {
    return apiClient.post('/auth/register', dto, {
      cache: false,
    });
  }

  /**
   * Reset password
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
   * Clear local storage and invalidate all caches
   */
  async logout(): Promise<ServerResponseModel<void>> {
    // Clear auth data
    authStorage.clearAuth();
    
    // Clear all API caches
    apiClient.invalidateCache();
    
    return {
      success: true,
      statusCode: 200,
    };
  }

  /**
   * Get current user identity
   * GET /users/me
   * Backend: UsersController.getMe()
   * 
   * Cached for 5 minutes
   */
  async getIdentity(): Promise<ServerResponseModel<UserDto>> {
    return apiClient.get('/users/me', {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Check authentication status
   * Optionally check for specific role
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

    // Check role if specified
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
const mapUserDto = (backendUser: any): UserDto => ({
  id: backendUser.user_id,
  username: backendUser.username,
  email: backendUser.email,
  fullName: backendUser.full_name,
  role: backendUser.role,
  createdAt: backendUser.created_at,
});

export const authService = new AuthService();