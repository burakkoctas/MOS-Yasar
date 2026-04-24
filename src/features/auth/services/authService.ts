import {
  API_BASE_URL,
  APP_VERSION_BY_PLATFORM,
  KEYCLOAK_BASE_URL,
  isRemoteAuthEnabled,
} from '@/src/config/appConfig';
import { registerForPushNotifications } from './notificationService';
import {
  AuthUserDto,
  LoginRequestDto,
  LoginResponseDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  SetPasswordRequestDto,
  SetPasswordResponseDto,
  VersionCheckResponseDto,
} from '@/src/features/auth/api/contracts';
import {
  AuthSession,
  LoginPayload,
  PasswordResetPayload,
  RegisterPayload,
  SetPasswordPayload,
} from '@/src/features/auth/types';
import { ApiError, FetchApiClient } from '@/src/shared/api/apiClient';
import { Platform } from 'react-native';

const keycloakApiClient = new FetchApiClient(KEYCLOAK_BASE_URL);
const mosApiClient = new FetchApiClient(API_BASE_URL);

const MOCK_USER: AuthUserDto = {
  id: 'user-1',
  fullName: 'Burak Koctas',
  email: 'burak.koctas@yasarbilgi.com.tr',
  company: 'Yasar Bilgi',
  roles: ['bulk_approve'],
  username: 'burakkoctas',
};

interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  organizationName?: string;
  realm_access?: {
    roles?: string[];
  };
}

function ensureUsername(username: string) {
  if (!username.trim()) {
    throw new Error('Kullanici adi bos birakilamaz.');
  }
}

function ensurePassword(password: string) {
  if (!password.trim()) {
    throw new Error('Sifre alani bos birakilamaz.');
  }
}

function ensureEmail(email: string) {
  if (!email.trim()) {
    throw new Error('E-posta alani bos birakilamaz.');
  }
}

function trimEdgeSpaces(value: string) {
  return value.replace(/^\s+|\s+$/g, '');
}

function mapLoginPayloadToDto(payload: LoginPayload): LoginRequestDto {
  return {
    username: trimEdgeSpaces(payload.username),
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

function mapSetPasswordPayloadToDto(payload: SetPasswordPayload): SetPasswordRequestDto {
  return {
    email: payload.email.trim(),
    newPassword: payload.newPassword,
  };
}

function decodeBase64Url(value: string) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalizedValue.length % 4;
  const paddedValue =
    padding === 0 ? normalizedValue : normalizedValue + '='.repeat(4 - padding);

  if (typeof atob === 'function') {
    const decoded = atob(paddedValue);
    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  }

  throw new Error('Token cozumlenemedi.');
}

function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new Error('Gecersiz token alindi.');
  }

  return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
}

function mapJwtPayloadToUser(payload: JwtPayload): AuthUserDto {
  return {
    id: payload.sub ?? 'unknown-user',
    fullName: payload.name ?? payload.preferred_username ?? 'Kullanici',
    email: payload.email ?? '',
    company: payload.organizationName ?? '',
    roles: payload.realm_access?.roles ?? [],
    username: payload.preferred_username ?? '',
  };
}

function mapLoginResponseToSession(response: LoginResponseDto): AuthSession {
  if (!response.access_token) {
    throw new Error('Giris islemi tamamlanamadi.');
  }

  const tokenPayload = parseJwtPayload(response.access_token);
  const user = mapJwtPayloadToUser(tokenPayload);

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user,
    mode: 'remote',
  };
}

async function runVersionCheck() {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const query = new URLSearchParams({
    platform,
    version: APP_VERSION_BY_PLATFORM[platform],
  }).toString();

  const versionResponse = await mosApiClient.request<VersionCheckResponseDto>(
    `/mos/api/v3/check?${query}`,
    {
      method: 'POST',
    },
  );

  if (versionResponse.code !== 200) {
    throw new Error(
      versionResponse.title || versionResponse.message || 'Versiyon kontrolu basarisiz oldu.',
    );
  }
}

export interface AuthService {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<string | null>;
  setPassword(payload: SetPasswordPayload): Promise<string | null>;
  requestPasswordReset(payload: PasswordResetPayload): Promise<void>;
}

const mockAuthService: AuthService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const dto = mapLoginPayloadToDto(payload);
    ensureUsername(dto.username);
    ensurePassword(dto.password);

    return {
      accessToken: 'mock-session-token',
      refreshToken: 'mock-refresh-token',
      user: {
        ...MOCK_USER,
        username: dto.username,
      },
      mode: 'mock',
    };
  },

  async register(payload: RegisterPayload): Promise<string | null> {
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);
    return 'Gecici sifre e-posta ile gonderildi.';
  },

  async setPassword(payload: SetPasswordPayload): Promise<string | null> {
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);
    return 'Sifre guncellendi.';
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    const dto = mapPasswordResetPayloadToDto(payload);
    ensureEmail(dto.email);
  },
};

const remoteAuthService: AuthService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const dto = mapLoginPayloadToDto(payload);
    ensureUsername(dto.username);
    ensurePassword(dto.password);

    await runVersionCheck();

    const formBody = new URLSearchParams({
      grant_type: 'password',
      username: dto.username,
      password: dto.password,
      client_id: 'mobile-api',
    }).toString();

    let tokenResponse: LoginResponseDto;

    try {
      tokenResponse = await keycloakApiClient.request<LoginResponseDto>(
        '/auth/realms/Mobil.Onay/protocol/openid-connect/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody,
        },
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === 'invalid_grant') {
        throw new Error('Kullanici adi veya sifre hatali.');
      }
      throw error;
    }

    const session = mapLoginResponseToSession(tokenResponse);
    registerForPushNotifications(session.accessToken).catch(() => {});
    return session;
  },

  async register(payload: RegisterPayload): Promise<string | null> {
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);

    const registerResponse = await mosApiClient.request<RegisterResponseDto>(
      '/mos/api/v3/register',
      {
        method: 'POST',
        body: dto,
      },
    );

    if (registerResponse.code !== 200) {
      throw new Error(registerResponse.message || 'Kayit islemi tamamlanamadi.');
    }

    return registerResponse.message;
  },

  async setPassword(payload: SetPasswordPayload): Promise<string | null> {
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);

    const setPasswordResponse = await mosApiClient.request<SetPasswordResponseDto>(
      '/mos/api/v3/set-password',
      {
        method: 'POST',
        body: dto,
      },
    );

    if (setPasswordResponse.code !== 200) {
      throw new Error(setPasswordResponse.message || 'Sifre guncelleme islemi tamamlanamadi.');
    }

    return setPasswordResponse.message;
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    await mosApiClient.request('/mos/api/v3/forgot-password', {
      method: 'POST',
      body: mapPasswordResetPayloadToDto(payload),
    });
  },
};

export const authService: AuthService = {
  async login(payload: LoginPayload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.login(payload)
      : mockAuthService.login(payload);
  },
  async register(payload: RegisterPayload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.register(payload)
      : mockAuthService.register(payload);
  },
  async setPassword(payload: SetPasswordPayload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.setPassword(payload)
      : mockAuthService.setPassword(payload);
  },
  async requestPasswordReset(payload: PasswordResetPayload) {
    return isRemoteAuthEnabled()
      ? remoteAuthService.requestPasswordReset(payload)
      : mockAuthService.requestPasswordReset(payload);
  },
};

export function sanitizeUsernameInput(value: string) {
  return trimEdgeSpaces(value);
}
