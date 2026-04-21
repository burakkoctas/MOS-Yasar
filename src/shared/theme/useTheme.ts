import { lightColors, darkColors, AppColors } from './colors';
import { useThemeStore } from '@/src/store/useThemeStore';

export function useTheme() {
  const { mode, setMode } = useThemeStore();
  const colors: AppColors = mode === 'dark' ? darkColors : lightColors;
  return { colors, isDark: mode === 'dark', mode, setMode };
}
