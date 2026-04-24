import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type Language = 'tr' | 'en';

const STORAGE_KEY = '@mos/language';

interface LanguageState {
  language: Language;
}

const listeners = new Set<() => void>();

let languageState: LanguageState = { language: 'tr' };

function emitChange() {
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
  if (saved === 'tr' || saved === 'en') {
    languageState = { language: saved };
    emitChange();
  }
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return languageState;
}

export const languageStore = {
  getState: getSnapshot,
  setLanguage(language: Language) {
    languageState = { language };
    emitChange();
    AsyncStorage.setItem(STORAGE_KEY, language);
  },
};

export function useLanguageStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...state, setLanguage: languageStore.setLanguage };
}
