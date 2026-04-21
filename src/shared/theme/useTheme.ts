import { lightColors, darkColors, AppColors } from './colors';
import { useThemeStore } from '@/src/store/useThemeStore';

export function useTheme() {
  const { resolvedScheme, mode, setMode } = useThemeStore();
  const colors: AppColors = resolvedScheme === 'dark' ? darkColors : lightColors;
  return { colors, isDark: resolvedScheme === 'dark', mode, setMode };
}
