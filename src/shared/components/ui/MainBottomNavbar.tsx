// Path: src/shared/components/ui/MainBottomNavbar.tsx
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// İkon ismini tip güvenli hale getiriyoruz
type IconName = ComponentProps<typeof Ionicons>['name'];

// Sadece bu kısmı any olarak güncelleyip kaydedebilirsin
interface NavItem {
  id: string;
  label: string;
  iconName: IconName;
  path: any; 
}

const NAV_ITEMS: NavItem[] = [
  { id: 'list', label: 'Talep Listesi', iconName: 'list-outline', path: '/' },
  { id: 'past', label: 'Geçmiş Talepler', iconName: 'time-outline', path: '/past-requests' },
  { id: 'settings', label: 'Ayarlar', iconName: 'settings-outline', path: '/settings' },
];

const MainBottomNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.navbarContainer, 
      { 
        height: Platform.OS === 'ios' ? 100 + insets.bottom : 100,
        paddingBottom: insets.bottom 
      }
    ]}>
      {NAV_ITEMS.map((item) => {
        const isSelected = pathname === item.path;
        const currentColor = isSelected ? '#1976D2' : '#A0A0A0';
        
        // Aktif duruma göre ikon ismini dinamik bulma (TypeScript hatasız)
        const activeIconName = item.iconName.replace('-outline', '') as IconName;

        return (
          <Pressable 
            key={item.id} 
            onPress={() => router.replace(item.path)}
            android_ripple={{ color: 'transparent' }}
            style={({ pressed }) => [
              styles.navItemButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons 
                name={isSelected ? activeIconName : item.iconName} 
                size={24} 
                color={currentColor} 
            />
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
    flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    justifyContent: 'space-around', alignItems: 'center', elevation: 20, zIndex: 1000,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 10,
  },
  navItemButton: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  navLabel: { fontSize: 12, fontWeight: '400', marginTop: 4, letterSpacing: 0.2 },
});

export default MainBottomNavbar;