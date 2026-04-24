import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ThemeMode } from '@/src/store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedItem = ({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) => {
  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(itemSlide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, itemFade, itemSlide]);

  return (
    <Animated.View renderToHardwareTextureAndroid style={{ opacity: itemFade, transform: [{ translateY: itemSlide }] }}>
      {children}
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { session, clearSession } = useAuthStore();
  const displayName = session?.user.fullName?.trim() || t.settings.demoUser;
  const organizationName = session?.user.company?.trim() || t.settings.demoCompany;
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
      setIsDataReady(true);
    }, []),
  );

  const themeModes: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: t.settings.light },
    { key: 'dark', label: t.settings.dark },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.langBadge}
          onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          activeOpacity={0.7}
        >
          <Text style={styles.langBadgeText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isDataReady && (
        <>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <AnimatedItem delay={100}>
              <Text style={styles.sectionTitle}>{t.settings.profile}</Text>
              <View style={styles.profileCard}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.companyName}>{organizationName}</Text>
              </View>
            </AnimatedItem>

            <AnimatedItem delay={250}>
              <Text style={styles.sectionTitle}>{t.settings.delegation}</Text>
              <View style={styles.menuContainer}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => router.push('/settings/active-attorneys')}
                >
                  <Text style={styles.menuText}>{t.attorney.active}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSystemGray} />
                </Pressable>

                <Pressable
                  style={styles.menuItem}
                  onPress={() => router.push('/settings/past-attorneys')}
                >
                  <Text style={styles.menuText}>{t.attorney.past}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSystemGray} />
                </Pressable>
              </View>
            </AnimatedItem>

            <AnimatedItem delay={350}>
              <Text style={styles.sectionTitle}>{t.settings.theme}</Text>
              <View style={styles.themeSegment}>
                {themeModes.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.themeSegmentItem, mode === key && styles.themeSegmentItemActive]}
                    onPress={() => setMode(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.themeSegmentText, mode === key && styles.themeSegmentTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AnimatedItem>
          </ScrollView>

          <AnimatedItem delay={400}>
            <View style={styles.footer}>
              <Text style={styles.versionText}>v0.0.1</Text>
              <Pressable
                onPress={() => setIsLogoutModalVisible(true)}
                style={({ pressed }) => [styles.logoutButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.logoutText}>{t.settings.logout}</Text>
              </Pressable>
            </View>
          </AnimatedItem>
        </>
      )}

      <ConfirmModal
        visible={isLogoutModalVisible}
        message={t.settings.logoutMessage}
        confirmText={t.settings.logoutConfirm}
        cancelText={t.settings.logoutCancel}
        confirmTextColor="#D32F2F"
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          clearSession();
          router.replace('/login');
        }}
      />

      <AppLoader visible={isLoading} />
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.background },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.primary, textAlign: 'center' },
  headerSpacer: { width: 72 },
  langBadge: { width: 40, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 },
  langBadgeText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 25,
    marginBottom: 10,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: colors.profileCard,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0,
  },
  userName: { fontSize: 20, fontWeight: '500', color: colors.textPrimary },
  companyName: { fontSize: 14, color: colors.textSecondary, marginTop: 5, letterSpacing: 0.5 },
  menuContainer: { gap: 12 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuText: { fontSize: 16, color: colors.textBody },
  footer: { alignItems: 'center', paddingBottom: 25, paddingTop: 15, backgroundColor: colors.background },
  versionText: { fontSize: 12, color: colors.textDisabled, marginBottom: 10 },
  logoutButton: { backgroundColor: colors.dangerBg, paddingVertical: 12, paddingHorizontal: 80, borderRadius: 25 },
  logoutText: { color: colors.dangerText, fontWeight: '600', fontSize: 15 },
  themeSegment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceInactive,
    borderRadius: 12,
    padding: 4,
  },
  themeSegmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  themeSegmentItemActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeSegmentText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  themeSegmentTextActive: { color: colors.primary, fontWeight: '700' },
});
