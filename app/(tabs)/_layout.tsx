// Path: app/(tabs)/_layout.tsx
import MainBottomNavbar from '@/src/shared/components/ui/MainBottomNavbar';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    // DİKKAT: Global Safe Area! Sadece üst kısmı korur, alt kısmı Navbar halleder.
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Tabs
        screenOptions={{ 
          headerShown: false,
          tabBarHideOnKeyboard: true 
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
    backgroundColor: '#fff' // Arka planın sayfalara uyumlu olması kritik
  }
});