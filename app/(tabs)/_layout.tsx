import MainBottomNavbar from '@/src/shared/components/ui/MainBottomNavbar';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={() => <MainBottomNavbar />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="past-requests" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
