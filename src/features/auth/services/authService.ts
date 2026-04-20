import { appConfig, isRemoteAuthEnabled } from '@/src/config/appConfig';
import {
  AuthUserDto,
  LoginErrorResponseDto,
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
import { createApiClient } from '@/src/shared/api/apiClient';
import { Platform } from 'react-native';

const AUTH_TOKEN_URL =
  'https://oauthtest.yasar.com.tr/auth/realms/Mobil.Onay/protocol/openid-connect/token';
const VERSION_CHECK_URL = 'https://mos-tst.yasar.com.tr/mos/api/v3/check';
const REGISTER_URL = 'https://mos-tst.yasar.com.tr/mos/api/v3/register';
const SET_PASSWORD_URL = 'https://mos-tst.yasar.com.tr/mos/api/v3/set-password';
const APP_VERSION_BY_PLATFORM = {
  ios: '2.4.4',
  android: '2.4.1',
} as const;

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

interface DebugOnlyResponse {
  code: number;
  message: string | null;
  data: null;
  dataList: null;
  title: string | null;
}

function wait() {
  return Promise.resolve();
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
    mode: isRemoteAuthEnabled() ? 'remote' : 'mock',
  };
}

function isDebugOnlyResponse(value: unknown): value is DebugOnlyResponse {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'code' in value &&
      'message' in value &&
      (value as DebugOnlyResponse).code === 202,
  );
}

function ensureNotDebugOnlyResponse(value: unknown, operation: string) {
  if (isDebugOnlyResponse(value)) {
    throw new Error(
      `${operation} istegi webhook'a yonlendirildi. Debug modunda gercek backend cevabi olmadigi icin islem tamamlanamaz.`,
    );
  }
}

const apiClient = createApiClient(appConfig.api.baseUrl);

async function runVersionCheck(accessToken: string) {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const query = new URLSearchParams({
    platform,
    version: APP_VERSION_BY_PLATFORM[platform],
  }).toString();

  const versionResponse = await apiClient.request<VersionCheckResponseDto | DebugOnlyResponse>(
    `${VERSION_CHECK_URL}?${query}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  ensureNotDebugOnlyResponse(versionResponse, 'Versiyon kontrol');

  console.log('[auth] version check response body', versionResponse);

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

  async register(payload: RegisterPayload): Promise<string | null> {
    await wait();
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);
    return 'Gecici sifre e-posta ile gonderildi.';
  },

  async setPassword(payload: SetPasswordPayload): Promise<string | null> {
    await wait();
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);
    return 'Sifre guncellendi.';
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    await wait();
    const dto = mapPasswordResetPayloadToDto(payload);
    ensureEmail(dto.email);
  },
};

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

    const tokenResponse = await apiClient.request<
      LoginResponseDto | LoginErrorResponseDto | DebugOnlyResponse
    >(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    ensureNotDebugOnlyResponse(tokenResponse, 'Giris');

    console.log('[auth] login success response body', tokenResponse);

    if (!('access_token' in tokenResponse) || !tokenResponse.access_token) {
      let errorMessage = 'Giris islemi basarisiz oldu.';

      if (
        tokenResponse.error === 'invalid_grant' &&
        tokenResponse.error_description === 'Invalid user credentials'
      ) {
        errorMessage = 'Kullanici adi veya sifre hatali.';
      } else if (tokenResponse.error_description) {
        errorMessage = tokenResponse.error_description;
      }

      throw new Error(errorMessage);
    }

    await runVersionCheck(tokenResponse.access_token);

    return mapLoginResponseToSession(tokenResponse);
  },

  async register(payload: RegisterPayload): Promise<string | null> {
    const dto = mapRegisterPayloadToDto(payload);

    if (!dto.firstName || !dto.lastName) {
      throw new Error('Ad ve soyad alanlari zorunludur.');
    }

    ensureEmail(dto.email);

    const registerResponse = await apiClient.request<RegisterResponseDto | DebugOnlyResponse>(
      REGISTER_URL,
      {
        method: 'POST',
        body: dto,
      },
    );

    ensureNotDebugOnlyResponse(registerResponse, 'Kayit');

    if (registerResponse.code !== 200) {
      throw new Error(registerResponse.message || 'Kayit islemi tamamlanamadi.');
    }

    return registerResponse.message;
  },

  async setPassword(payload: SetPasswordPayload): Promise<string | null> {
    const dto = mapSetPasswordPayloadToDto(payload);
    ensureEmail(dto.email);
    ensurePassword(dto.newPassword);

    const setPasswordResponse = await apiClient.request<SetPasswordResponseDto | DebugOnlyResponse>(
      SET_PASSWORD_URL,
      {
        method: 'POST',
        body: dto,
      },
    );

    ensureNotDebugOnlyResponse(setPasswordResponse, 'Sifre guncelleme');

    if (setPasswordResponse.code !== 200) {
      throw new Error(setPasswordResponse.message || 'Sifre guncelleme islemi tamamlanamadi.');
    }

    return setPasswordResponse.message;
  },

  async requestPasswordReset(payload: PasswordResetPayload): Promise<void> {
    const response = await apiClient.request<DebugOnlyResponse | { message?: string }>(
      '/forgot-password',
      {
        method: 'POST',
        body: mapPasswordResetPayloadToDto(payload),
      },
    );

    ensureNotDebugOnlyResponse(response, 'Sifre sifirlama');
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
  async setPassword(payload: SetPasswordPayload) {
    return appConfig.api.mode === 'remote'
      ? remoteAuthService.setPassword(payload)
      : mockAuthService.setPassword(payload);
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
