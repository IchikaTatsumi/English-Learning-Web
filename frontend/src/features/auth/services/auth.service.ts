import { apiClient } from '@/lib/api/client';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { ResetPasswordDto } from '../dtos/request/reset-password.dto';
import { AuthResponseDto, UserDto } from '../dtos/response/auth-response.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';

/**
 * Authentication Service
 * Maps to backend AuthController endpoints
 */
export class AuthService {
  /**
   * User login
   * POST /auth/login
   * Backend: AuthController.login()
   */
  async login(dto: LoginDto): Promise<ServerResponseModel<AuthResponseDto>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', dto);
    
    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  /**
   * User registration
   * POST /auth/register
   * Backend: AuthController.register()
   */
  async register(dto: RegisterDto): Promise<ServerResponseModel<UserDto>> {
    return apiClient.post('/auth/register', dto);
  }

  /**
   * Reset password
   * POST /auth/reset-password
   * Backend: AuthController.resetPassword()
   */
  async resetPassword(dto: ResetPasswordDto): Promise<ServerResponseModel<{ message: string }>> {
    return apiClient.post('/auth/reset-password', dto);
  }

  /**
   * Logout user
   * Clear local storage (no backend endpoint needed)
   */
  async logout(): Promise<ServerResponseModel<void>> {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    return {
      success: true,
      statusCode: 200,
    };
  }

  /**
   * Get current user identity
   * GET /users/me
   * Backend: UsersController.getMe()
   */
  async getIdentity(): Promise<ServerResponseModel<UserDto>> {
    return apiClient.get('/users/me');
  }

  /**
   * Check authentication status
   * Optionally check for specific role
   */
  async check(params?: { role?: string }): Promise<ServerResponseModel<boolean>> {
    const token = localStorage.getItem('accessToken');
    
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

export const authService = new AuthService();