import { useSyncExternalStore } from 'react';
import { AuthSession } from '@/src/features/auth/types';

interface AuthState {
  session: AuthSession | null;
}

const listeners = new Set<() => void>();

let authState: AuthState = {
  session: null,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authState;
}

export const authStore = {
  getState: getSnapshot,
  setSession(session: AuthSession | null) {
    authState = { session };
    emitChange();
  },
  clear() {
    authState = { session: null };
    emitChange();
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
