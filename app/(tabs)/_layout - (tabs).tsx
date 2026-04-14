import MainBottomNavbar from '@/src/shared/components/ui/MainBottomNavbar';
import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      {/* Aktif olan sayfa */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Navbar her zaman en altta sabit kalır. 
        z-index ve elevation (Android için) ekleyerek öne çıkmasını garanti ediyoruz.
      */}
      <View style={styles.navbarWrapper}>
        <MainBottomNavbar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, 
  },
  navbarWrapper: {
    // Navbarın her zaman en üstte (z-ekseninde) görünmesini sağlar
    zIndex: 1000,
    elevation: 20, // Android için gölge ve katman önceliği
    backgroundColor: '#fff',
  }
});