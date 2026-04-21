import * as SystemUI from 'expo-system-ui';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { lightColors, darkColors } from '@/src/shared/theme/colors';
import AppLoader from '@/src/shared/components/ui/AppLoader';

function ThemeSync() {
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.surface).catch(() => {});
  }, [colors.surface]);

  return (
    <StatusBar
      style={mode === 'dark' ? 'light' : 'dark'}
      backgroundColor={colors.surface}
      translucent={false}
    />
  );
}

export default function RootLayout() {
  const { isLoading } = useAuthStore();

  return (
    <SafeAreaProvider>
      <ThemeSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <AppLoader visible={isLoading} />
    </SafeAreaProvider>
  );
}
