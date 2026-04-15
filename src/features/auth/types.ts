export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordResetPayload {
  email: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  company: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  mode: 'mock' | 'remote';
}
