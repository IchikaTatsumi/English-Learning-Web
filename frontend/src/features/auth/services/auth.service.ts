import { LoginDto, RegisterDto, AuthResponseDto } from '../dtos/auth.dto';

export class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: dto.email, // Backend expects usernameOrEmail
          password: dto.password
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Backend returns: { access_token, user }
      return {
        accessToken: data.access_token,
        refreshToken: '', // Backend doesn't return refresh token in this version
        user: {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.full_name,
          username: data.user.username,
          role: data.user.role
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: dto.name.toLowerCase().replace(/\s+/g, ''),
          email: dto.email,
          password: dto.password,
          fullName: dto.name
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // After registration, need to login
      return await this.login({ email: dto.email, password: dto.password });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Backend doesn't have logout endpoint, just clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  async getMe(): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to get user info');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

// Auth DTO with complete types
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'Admin' | 'User';
  full_name?: string;
  created_at?: string;
}