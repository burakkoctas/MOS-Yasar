import { appConfig, isRemoteAuthEnabled } from '@/src/config/appConfig';
import {
  AuthUserDto,
  LoginErrorResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  VersionCheckResponseDto,
} from '@/src/features/auth/api/contracts';
import {
  AuthSession,
  LoginPayload,
  PasswordResetPayload,
  RegisterPayload,
} from '@/src/features/auth/types';
import { createApiClient } from '@/src/shared/api/apiClient';
import { Platform } from 'react-native';

const AUTH_TOKEN_URL =
  'https://oauthtest.yasar.com.tr/auth/realms/Mobil.Onay/protocol/openid-connect/token';
const VERSION_CHECK_URL = 'https://mos-tst.yasar.com.tr/mos/api/v3/check';
const APP_VERSION_BY_PLATFORM = {
  ios: '2.4.4',
  android: '2.4.1',
} as const;

const MOCK_USER: AuthUserDto = {
  id: 'user-1',
  fullName: 'Burak Koçtaş',
  email: 'burak.koctas@yasarbilgi.com.tr',
  company: 'Yaşar Bilgi',
  roles: ['bulk_approve'],
  username: 'burakkoctas',
};

const DELAY = 300;

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

function wait() {
  return new Promise((resolve) => setTimeout(resolve, DELAY));
}

function ensureUsername(username: string) {
  if (!username.trim()) {
    throw new Error('Kullanıcı adı boş bırakılamaz.');
  }
}

function ensurePassword(password: string) {
  if (!password.trim()) {
    throw new Error('Şifre alanı boş bırakılamaz.');
  }
}

function ensureEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Geçerli bir e-posta adresi girin.');
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

  throw new Error('Token çözümlenemedi.');
}

function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');

  if (parts.length < 2) {
    throw new Error('Geçersiz token alındı.');
  }

  return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
}

function mapJwtPayloadToUser(payload: JwtPayload): AuthUserDto {
  return {
    id: payload.sub ?? 'unknown-user',
    fullName: payload.name ?? payload.preferred_username ?? 'Kullanıcı',
    email: payload.email ?? '',
    company: payload.organizationName ?? '',
    roles: payload.realm_access?.roles ?? [],
    username: payload.preferred_username ?? '',
  };
}

function mapLoginResponseToSession(response: LoginResponseDto): AuthSession {
  if (!response.access_token) {
    throw new Error('Giriş işlemi tamamlanamadı.');
  }

  const tokenPayload = parseJwtPayload(response.access_token);
  const user = mapJwtPayloadToUser(tokenPayload);

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user,
    mode: isRemoteAuthEnabled() ? 'remote' : 'mock',
  };
}

async function runVersionCheck(accessToken: string) {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const query = new URLSearchParams({
    platform,
    version: APP_VERSION_BY_PLATFORM[platform],
  }).toString();

  const response = await fetch(`${VERSION_CHECK_URL}?${query}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  console.log('[auth] version check status', response.status);

  if (!response.ok) {
    throw new Error('Versiyon kontrolü başarısız oldu.');
  }

  const versionResponse = (await response.json()) as VersionCheckResponseDto;
  console.log('[auth] version check response body', versionResponse);

  if (versionResponse.code !== 200) {
    throw new Error(versionResponse.title || versionResponse.message || 'Versiyon kontrolü başarısız oldu.');
  }
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
    console.log('[auth] mock login kullanildi', { username: dto.username });
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
    const dto = mapLoginPayloadToDto(payload);
    console.log('[auth] remote login basladi', {
      mode: appConfig.auth.mode,
      username: dto.username,
      endpoint: AUTH_TOKEN_URL,
    });
    ensureUsername(dto.username);
    ensurePassword(dto.password);

    const formBody = new URLSearchParams({
      grant_type: 'password',
      username: dto.username,
      password: dto.password,
      client_id: 'mobile-api',
    }).toString();

    const response = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    console.log('[auth] login response status', response.status);

    if (!response.ok) {
      let errorMessage = 'Giriş işlemi başarısız oldu.';

      try {
        const errorResponse = (await response.json()) as LoginErrorResponseDto;
        console.log('[auth] login error response body', errorResponse);

        if (
          errorResponse.error === 'invalid_grant' &&
          errorResponse.error_description === 'Invalid user credentials'
        ) {
          errorMessage = 'Kullanıcı adı veya şifre hatalı.';
        } else if (errorResponse.error_description) {
          errorMessage = errorResponse.error_description;
        }
      } catch {
        // Keep the default error message when the backend error body cannot be parsed.
      }

      throw new Error(errorMessage);
    }

    const tokenResponse = (await response.json()) as LoginResponseDto;
    console.log('[auth] login success response body', tokenResponse);

    if (!tokenResponse.access_token) {
      throw new Error('Giriş başarısız. Geçerli bir oturum alınamadı.');
    }

    await runVersionCheck(tokenResponse.access_token);

    return mapLoginResponseToSession(tokenResponse);
  },

  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.request('/register', {
      method: 'POST',
      body: mapRegisterPayloadToDto(payload),
    });
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    await apiClient.request('/forgot-password', {
      method: 'POST',
      body: mapPasswordResetPayloadToDto(payload),
    });
  },
};

export const authService: AuthService = {
  async login(payload: LoginPayload) {
    console.log('[auth] aktif modlar', {
      authMode: appConfig.auth.mode,
      apiMode: appConfig.api.mode,
    });
    return isRemoteAuthEnabled()
      ? remoteAuthService.login(payload)
      : mockAuthService.login(payload);
  },
  async register(payload: RegisterPayload) {
    return appConfig.api.mode === 'remote'
      ? remoteAuthService.register(payload)
      : mockAuthService.register(payload);
  },
  async requestPasswordReset(payload: PasswordResetPayload) {
    return appConfig.api.mode === 'remote'
      ? remoteAuthService.requestPasswordReset(payload)
      : mockAuthService.requestPasswordReset(payload);
  },
};

export function sanitizeUsernameInput(value: string) {
  return trimEdgeSpaces(value);
}
