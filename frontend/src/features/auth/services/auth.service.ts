import { apiClient } from '@/lib/api/client';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { AuthResponseDto } from '../dtos/response/auth-response.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';

export class AuthService {
  async login(dto: LoginDto): Promise<ServerResponseModel<AuthResponseDto>> {
    const response = await apiClient.post<AuthResponseDto>('/auth/login', dto);
    
    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  async register(dto: RegisterDto): Promise<ServerResponseModel<{ id: number; username: string; email: string; fullName: string; role: string }>> {
    return apiClient.post('/auth/register', dto);
  }

  async logout(): Promise<ServerResponseModel<void>> {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    return {
      success: true,
      statusCode: 200,
    };
  }

  async getIdentity(): Promise<ServerResponseModel<AuthResponseDto['user']>> {
    return apiClient.get('/users/me');
  }

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