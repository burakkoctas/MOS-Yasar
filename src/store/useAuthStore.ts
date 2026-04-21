import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession } from '@/src/features/auth/types';
import { useSyncExternalStore } from 'react';

const SESSION_KEY = '@mos/auth_session';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
}

const listeners = new Set<() => void>();

let authState: AuthState = {
  session: null,
  isLoading: true,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

AsyncStorage.getItem(SESSION_KEY).then((raw) => {
  if (raw) {
    try {
      const session = JSON.parse(raw) as AuthSession;
      authState = { session, isLoading: false };
    } catch {
      authState = { session: null, isLoading: false };
    }
  } else {
    authState = { ...authState, isLoading: false };
  }
  emitChange();
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authState;
}

export const authStore = {
  getState: getSnapshot,
  setSession(session: AuthSession, rememberMe: boolean) {
    authState = { session, isLoading: false };
    emitChange();
    if (rememberMe) {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      AsyncStorage.removeItem(SESSION_KEY);
    }
  },
  clear() {
    authState = { session: null, isLoading: false };
    emitChange();
    AsyncStorage.removeItem(SESSION_KEY);
  },
};

export function useAuthStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    isAuthenticated: Boolean(state.session),
    setSession: authStore.setSession,
    clearSession: authStore.clear,
  };
}
