import * as SystemUI from 'expo-system-ui';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '@/src/store/useThemeStore';
import { lightColors, darkColors } from '@/src/shared/theme/colors';

function ThemeSync() {
  const { resolvedScheme } = useThemeStore();
  const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.surface).catch(() => {});
  }, [colors.surface]);

  return (
    <StatusBar
      style={resolvedScheme === 'dark' ? 'light' : 'dark'}
      backgroundColor={colors.surface}
      translucent={false}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
