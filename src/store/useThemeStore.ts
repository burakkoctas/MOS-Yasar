import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = '@mos/theme_mode';

interface ThemeState {
  mode: ThemeMode;
}

function getSystemMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

const listeners = new Set<() => void>();

let themeState: ThemeState = {
  mode: getSystemMode(),
};

function emitChange() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'light' || saved === 'dark') {
    themeState = { mode: saved };
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
    themeState = { mode };
    emitChange();
    AsyncStorage.setItem(STORAGE_KEY, mode);
  },
};

export function useThemeStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...state, setMode: themeStore.setMode };
}
