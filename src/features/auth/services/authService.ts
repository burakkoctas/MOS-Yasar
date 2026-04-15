import { appConfig } from '@/src/config/appConfig';
import {
  LoginRequestDto,
  LoginResponseDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
} from '@/src/features/auth/api/contracts';
import {
  AuthSession,
  LoginPayload,
  PasswordResetPayload,
  RegisterPayload,
} from '@/src/features/auth/types';
import { createApiClient } from '@/src/shared/api/apiClient';

const MOCK_USER = {
  id: 'user-1',
  fullName: 'Burak Koçtaş',
  email: 'burak.koctas@yasarbilgi.com.tr',
  company: 'Yaşar Bilgi',
};

const DELAY = 300;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, DELAY));
}

function ensureEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Geçerli bir e-posta adresi girin.');
  }
}

function mapLoginPayloadToDto(payload: LoginPayload): LoginRequestDto {
  return {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    rememberMe: payload.rememberMe,
  };
}

function mapRegisterPayloadToDto(payload: RegisterPayload): RegisterRequestDto {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
  };
}

function mapPasswordResetPayloadToDto(payload: PasswordResetPayload): PasswordResetRequestDto {
  return {
    email: payload.email.trim().toLowerCase(),
  };
}

function mapLoginResponseToSession(response: LoginResponseDto): AuthSession {
  return {
    accessToken: response.accessToken,
    user: response.user,
    mode: appConfig.api.mode,
  };
}

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<void>;
  requestPasswordReset(payload: PasswordResetPayload): Promise<void>;
}

const mockAuthService: AuthService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    await wait();
    const dto = mapLoginPayloadToDto(payload);
    ensureEmail(dto.email);

    if (!dto.password.trim()) {
      throw new Error('Şifre alanı boş bırakılamaz.');
    }

    return mapLoginResponseToSession({
      accessToken: 'mock-session-token',
      user: {
        ...MOCK_USER,
        email: dto.email,
      },
    });
  },

  async register(payload: RegisterPayload): Promise<void> {
    await wait();
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanları zorunludur.');
    }

    ensureEmail(dto.email);
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    await wait();
    const dto = mapPasswordResetPayloadToDto(payload);
    ensureEmail(dto.email);
  },
};

const apiClient = createApiClient(appConfig.api.baseUrl);

const remoteAuthService: AuthService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await apiClient.request<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: mapLoginPayloadToDto(payload),
    });

    return mapLoginResponseToSession(response);
  },

  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.request('/auth/register', {
      method: 'POST',
      body: mapRegisterPayloadToDto(payload),
    });
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    await apiClient.request('/auth/password-reset', {
      method: 'POST',
      body: mapPasswordResetPayloadToDto(payload),
    });
  },
};

export const authService: AuthService =
  appConfig.api.mode === 'remote' ? remoteAuthService : mockAuthService;
