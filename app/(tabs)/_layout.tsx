import MainBottomNavbar from '@/components/ui/kullanilanlar/MainBottomNavbar';
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Aktif olan sayfa (index, past-requests vb.) buraya gelir */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Navbar her zaman en altta sabit kalır */}
      <MainBottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, // Sayfanın Navbar dışında kalan tüm alanı kaplamasını sağlar
  },
});