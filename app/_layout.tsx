import * as SystemUI from 'expo-system-ui';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { lightColors, darkColors } from '@/src/shared/theme/colors';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

function NotificationTapHandler() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastResponse &&
      lastResponse.notification.request.identifier !== handledIdRef.current
    ) {
      handledIdRef.current = lastResponse.notification.request.identifier;
      router.push('/(tabs)/');
    }
  }, [lastResponse, router]);

  return null;
}

export default function RootLayout() {
  const { isLoading } = useAuthStore();

  return (
    <SafeAreaProvider>
      <ThemeSync />
      <NotificationTapHandler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <AppLoader visible={isLoading} />
    </SafeAreaProvider>
  );
}
