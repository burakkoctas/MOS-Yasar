import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// Profesyonel Tip Tanımlaması
interface NavItem {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'list', label: 'Talep Listesi', iconName: 'list-outline' },
  { id: 'past', label: 'Geçmiş Talepler', iconName: 'time-outline' },
  { id: 'settings', label: 'Ayarlar', iconName: 'settings-outline' },
];

interface NavbarProps {
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

const MainBottomNavbar: React.FC<NavbarProps> = ({ activeTabId, onTabChange }) => {
  const corporateBlue = '#1976D2'; // Talep numaralarındaki kurumsal mavi
  const inactiveGrey = '#A0A0A0';   // Silik gri

  return (
    <View style={styles.navbarContainer}>
      {NAV_ITEMS.map((item) => {
        const isSelected = activeTabId === item.id;
        const currentColor = isSelected ? corporateBlue : inactiveGrey;

        return (
          <Pressable 
            key={item.id} 
            style={styles.navItemButton} 
            onPress={() => onTabChange(item.id)}
          >
            {/* İkon - Boyutları tarifine uygun olarak eşitledik */}
            <Ionicons 
              name={item.iconName} 
              size={24} 
              color={currentColor} 
            />
            
            {/* Yazı - İnce (font-weight 300) ve ortalanmış */}
            <Text style={[styles.navLabel, { color: currentColor }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

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