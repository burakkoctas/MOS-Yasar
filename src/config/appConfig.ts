import Constants from 'expo-constants';

export type ApiMode = 'mock' | 'remote';

export interface RuntimeApiConfig {
  mode: ApiMode;
  baseUrl: string;
  timeoutMs: number;
}

export interface AppConfig {
  api: RuntimeApiConfig;
  auth: Pick<RuntimeApiConfig, 'mode' | 'timeoutMs'>;
}

interface ExpoExtraConfig {
  api?: Partial<RuntimeApiConfig>;
  auth?: Partial<Pick<RuntimeApiConfig, 'mode' | 'timeoutMs'>>;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

const fallbackConfig: AppConfig = {
  api: {
    mode: 'mock',
    baseUrl: '',
    timeoutMs: 10000,
  },
  auth: {
    mode: 'mock',
    timeoutMs: 10000,
  },
};

export const appConfig: AppConfig = {
  api: {
    mode: extra.api?.mode ?? fallbackConfig.api.mode,
    baseUrl: extra.api?.baseUrl ?? fallbackConfig.api.baseUrl,
    timeoutMs: extra.api?.timeoutMs ?? fallbackConfig.api.timeoutMs,
  },
  auth: {
    mode: extra.auth?.mode ?? fallbackConfig.auth.mode,
    timeoutMs: extra.auth?.timeoutMs ?? fallbackConfig.auth.timeoutMs,
  },
};

export function isRemoteApiEnabled() {
  return appConfig.api.mode === 'remote' && Boolean(appConfig.api.baseUrl);
}

export function isRemoteAuthEnabled() {
  return appConfig.auth.mode === 'remote';
}
