import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router'; // usePathname ekledik
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const NAV_ITEMS = [
  { id: 'list', label: 'Talep Listesi', iconName: 'list-outline', path: '/' },
  { id: 'past', label: 'Geçmiş Talepler', iconName: 'time-outline', path: '/past-requests' },
  { id: 'settings', label: 'Ayarlar', iconName: 'settings-outline', path: '/settings' },
];

const MainBottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // Şu anki aktif yolu (URL) verir

  return (
    <View style={styles.navbarContainer}>
      {NAV_ITEMS.map((item) => {
        // Renk kontrolü: URL ile path eşleşiyor mu?
        const isSelected = pathname === item.path;
        const currentColor = isSelected ? '#1976D2' : '#A0A0A0';

        return (
          <Pressable 
            key={item.id} 
            style={styles.navItemButton} 
            onPress={() => router.replace(item.path as any)} // push yerine replace bazen daha akıcıdır
          >
            <Ionicons name={item.iconName as any} size={24} color={currentColor} />
            <Text style={[styles.navLabel, { color: currentColor }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ... stiller aynı ...

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    // Ekranın yaklaşık %10'u (Cihaz boyuna göre dinamikleşebilir ama sabit değer daha güvenlidir)
    height: Platform.OS === 'ios' ? 80 : 65, 
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0', // Çok silik, belli belirsiz ayrım çizgisi
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // iPhone alt çentik payı
    // Profesyonel duruş için çok hafif alt gölge
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  navItemButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '300', // İnce yazı tipi
    marginTop: 4,
    letterSpacing: 0.2,
  },
});

export default MainBottomNavbar;