import Constants from 'expo-constants';

export type ApiMode = 'mock' | 'remote';

export interface RuntimeApiConfig {
  mode: ApiMode;
  baseUrl: string;
  timeoutMs: number;
}

export interface AppConfig {
  api: RuntimeApiConfig;
}

interface ExpoExtraConfig {
  api?: Partial<RuntimeApiConfig>;
}

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

const fallbackConfig: AppConfig = {
  api: {
    mode: 'mock',
    baseUrl: '',
    timeoutMs: 10000,
  },
};

export const appConfig: AppConfig = {
  api: {
    mode: extra.api?.mode ?? fallbackConfig.api.mode,
    baseUrl: extra.api?.baseUrl ?? fallbackConfig.api.baseUrl,
    timeoutMs: extra.api?.timeoutMs ?? fallbackConfig.api.timeoutMs,
  },
};

export function isRemoteApiEnabled() {
  return appConfig.api.mode === 'remote' && Boolean(appConfig.api.baseUrl);
}
