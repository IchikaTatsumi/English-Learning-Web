import { apiClient } from '@/lib/api/client';
import { LoginDto } from '../dtos/request/login.dto';
import { RegisterDto } from '../dtos/request/register.dto';
import { ResetPasswordDto } from '../dtos/request/reset-password.dto';
import { AuthResponseDto, UserDto } from '../dtos/response/auth-response.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';
import { authStorage, userStorage } from '@/lib/utils/local-storage';
import { setAuthToken, removeAuthToken } from '@/lib/cookie/cookie'; // ✅ Import Cookie Helper

export class AuthService {
  async login(dto: LoginDto): Promise<ServerResponseModel<AuthResponseDto>> {
    console.log("🚀 [AuthService] Sending login request...");
    
    const response = await apiClient.post<AuthResponseDto>('/auth/login', dto, {
      cache: false,
    });
    
    if (response.success) {
      const data = response.data as any;

      // 1. Tìm Token (Logic tìm kiếm thông minh)
      let token = data?.accessToken || data?.access_token || data?.token;
      if (!token && data?.data) {
         token = data.data.accessToken || data.data.access_token || data.data.token;
      }

      // 2. Tìm User
      let user = data?.user;
      if (!user && data?.data?.user) {
          user = data.data.user;
      }

      if (token) {
        console.log("✅ [AuthService] Token found, saving to Storage & Cookie...");
        
        // A. Lưu LocalStorage (để gọi API từ Client)
        authStorage.setAccessToken(token);
        
        // B. ✅ QUAN TRỌNG: Lưu Cookie (để Middleware cho qua)
        setAuthToken(token);
        
        if (user) {
          userStorage.setUser(user);
        }
      } else {
        console.error("❌ Login success but NO TOKEN found!");
      }
    }
    
    return response;
  }

  // ... Các hàm register, forgotPassword, resetPassword giữ nguyên ...
  async register(dto: RegisterDto): Promise<ServerResponseModel<UserDto>> {
    return apiClient.post('/auth/register', dto, { cache: false });
  }

  async forgotPassword(email: string): Promise<ServerResponseModel<{ message: string }>> {
    return apiClient.post('/auth/forgot-password', { email }, { cache: false });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ServerResponseModel<{ message: string }>> {
    return apiClient.post('/auth/reset-password', dto, { cache: false });
  }

  async logout(): Promise<ServerResponseModel<void>> {
    console.log("🚪 Logging out...");
    
    // Xóa sạch cả 2 nơi
    authStorage.clearAuth();
    removeAuthToken(); // ✅ Xóa cookie
    
    apiClient.invalidateCache();
    
    return {
      success: true,
      statusCode: 200,
    };
  }

  async getIdentity(): Promise<ServerResponseModel<UserDto>> {
    return apiClient.get('/users/me', {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }

  async check(params?: { role?: string }): Promise<ServerResponseModel<boolean>> {
    const token = authStorage.getAccessToken();
    if (!token) return { success: false, statusCode: 401, message: 'Not authenticated' };

    const response = await this.getIdentity();
    if (!response.success) {
      authStorage.clearAuth();
      removeAuthToken(); // ✅ Xóa cookie nếu token hết hạn
      return { success: false, statusCode: 401, message: 'Invalid token' };
    }

    if (params?.role && response.data) {
      const userData = response.data as any;
      const userRole = userData.role || userData.role_id;
      const hasRole = String(userRole) === String(params.role);
      return { success: hasRole, statusCode: hasRole ? 200 : 403, data: hasRole };
    }

    return { success: true, statusCode: 200, data: true };
  }
}

export const authService = new AuthService();