export interface LoginRequestDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface AuthUserDto {
  id: string;
  fullName: string;
  email: string;
  company: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface PasswordResetResponseDto {
  message: string;
}

export interface RegisterResponseDto {
  message: string;
}
