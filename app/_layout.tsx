import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    // SafeAreaProvider sadece sarmalar, margin verilmez. 
    // Boşluklar sayfa içindeki SafeAreaView veya insets ile yönetilir.
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Ana uygulama akışı (Tab'lar) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* İleride Auth (Giriş/Kayıt) akışını buraya ekleyeceğiz */}
        {/* <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
      </Stack>
    </SafeAreaProvider>
  );
}