import { useTheme } from '@/src/shared/theme/useTheme';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface NavItem {
  id: string;
  label: string;
  iconName: IconName;
  path: '/' | '/past-requests' | '/settings';
}

const MainBottomNavbar = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { id: 'list', label: t.nav.requestList, iconName: 'list-outline', path: '/' },
    { id: 'past', label: t.nav.requestHistory, iconName: 'time-outline', path: '/past-requests' },
    { id: 'settings', label: t.nav.settings, iconName: 'settings-outline', path: '/settings' },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  // iOS'ta beyaz alanın gereksiz uzamaması için yükseklik ekran oranına göre hesaplanır.
  const iosBaseHeight = Math.min(Math.max(screenHeight * 0.085, 74), 88);
  const navbarHeight = Platform.OS === 'ios' ? iosBaseHeight + insets.bottom : 100;

  return (
    <View
      style={[
        styles.navbarContainer,
        {
          height: navbarHeight,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
          borderTopColor: colors.borderNavbar,
        },
      ]}
    >
      {navItems.map((item) => {
        const isSelected = pathname === item.path;
        const currentColor = isSelected ? colors.primary : colors.textDisabled;
        const activeIconName = item.iconName.replace('-outline', '') as IconName;

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              if (isSelected) {
                console.log('[navbar] ignored press on active tab', {
                  path: item.path,
                });
                return;
              }

              console.log('[navbar] navigating to tab', {
                from: pathname,
                to: item.path,
              });
              router.replace(item.path);
            }}
            android_ripple={{ color: 'transparent' }}
            style={({ pressed }) => [styles.navItemButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons
              name={isSelected ? activeIconName : item.iconName}
              size={24}
              color={currentColor}
            />
            <Text style={[styles.navLabel, { color: currentColor }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItemButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});

export default MainBottomNavbar;
