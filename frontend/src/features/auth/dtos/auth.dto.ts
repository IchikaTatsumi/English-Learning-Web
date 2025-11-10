export type { LoginDto } from './request/login.dto';
export type { RegisterDto } from './request/register.dto';
export type { ResetPasswordDto } from './request/reset-password.dto';

// Re-export Response DTOs
export type { AuthResponseDto, UserDto } from './response/auth-response.dto';

// Type guards for runtime checks
export function isAuthResponseDto(obj: any): obj is import('./response/auth-response.dto').AuthResponseDto {
  return obj && 
    typeof obj.accessToken === 'string' &&
    obj.user &&
    typeof obj.user.id === 'number';
}

export function isUserDto(obj: any): obj is import('./response/auth-response.dto').UserDto {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.username === 'string' &&
    typeof obj.email === 'string';
}