import { Appearance } from 'react-native';
import { useSyncExternalStore } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  resolvedScheme: 'light' | 'dark';
}

function resolveScheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

const listeners = new Set<() => void>();

let themeState: ThemeState = {
  mode: 'system',
  resolvedScheme: resolveScheme('system'),
};

function emitChange() {
  listeners.forEach((l) => l());
}

Appearance.addChangeListener(() => {
  if (themeState.mode === 'system') {
    themeState = { ...themeState, resolvedScheme: resolveScheme('system') };
    emitChange();
  }
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return themeState;
}

export const themeStore = {
  getState: getSnapshot,
  setMode(mode: ThemeMode) {
    themeState = { mode, resolvedScheme: resolveScheme(mode) };
    emitChange();
  },
};

export function useThemeStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...state, setMode: themeStore.setMode };
}
