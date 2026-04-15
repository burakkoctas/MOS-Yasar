import { appConfig, isRemoteApiEnabled } from '@/src/config/appConfig';
import { useSyncExternalStore } from 'react';

export interface AppEnvironment {
  apiMode: 'mock' | 'remote';
  apiBaseUrl: string;
  apiTimeoutMs: number;
  servicesReady: boolean;
}

interface AppState {
  environment: AppEnvironment;
}

const listeners = new Set<() => void>();

let appState: AppState = {
  environment: {
    apiMode: appConfig.api.mode,
    apiBaseUrl: appConfig.api.baseUrl,
    apiTimeoutMs: appConfig.api.timeoutMs,
    servicesReady: appConfig.api.mode === 'mock' || isRemoteApiEnabled(),
  },
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return appState;
}

export const appStore = {
  getState: getSnapshot,
  setEnvironment(environment: Partial<AppEnvironment>) {
    appState = {
      environment: {
        ...appState.environment,
        ...environment,
      },
    };
    emitChange();
  },
};

export function useAppStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...state,
    setEnvironment: appStore.setEnvironment,
  };
}
