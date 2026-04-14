// Path: src/features/settings/screens/SettingsScreen.tsx
import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal'; // ŞEFİM: Modalı import ettik
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const AnimatedItem = ({ children, delay }: { children: React.ReactNode, delay: number }) => {
  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(itemSlide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: itemFade, transform: [{ translateY: itemSlide }] }}>
      {children}
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // ŞEFİM: Çıkış modalı için state
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsDataReady(false); 
      setIsLoading(true);

      const timer = setTimeout(() => {
        setIsLoading(false); 
        setIsDataReady(true); 
      }, 800);

      return () => clearTimeout(timer);
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      {isDataReady && (
        <>
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <AnimatedItem delay={100}>
              <Text style={styles.sectionTitle}>Profil</Text>
              <View style={styles.profileCard}>
                <Text style={styles.userName}>BURAK KOÇTAŞ</Text>
                <Text style={styles.companyName}>YAŞAR BİLGİ</Text>
              </View>
            </AnimatedItem>

            <AnimatedItem delay={250}>
              <Text style={styles.sectionTitle}>Vekalet</Text>
              <View style={styles.menuContainer}>
                <Pressable 
                  style={styles.menuItem}
                  onPress={() => router.push('/settings/active-delegates')}
                >
                  <Text style={styles.menuText}>Aktif vekaletlerim</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </Pressable>
                
                <Pressable 
                  style={styles.menuItem}
                  onPress={() => router.push('/settings/past-delegates')}
                >
                  <Text style={styles.menuText}>Geçmiş vekaletlerim</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </Pressable>
              </View>
            </AnimatedItem>
          </ScrollView>

          <AnimatedItem delay={400}>
            <View style={styles.footer}>
              <Text style={styles.versionText}>v0.0.1</Text>
              <Pressable 
                onPress={() => setIsLogoutModalVisible(true)} // Tıklanınca modalı aç
                style={({ pressed }) => [
                  styles.logoutButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles.logoutText}>Çıkış Yap</Text>
              </Pressable>
            </View>
          </AnimatedItem>
        </>
      )}

      {/* ÇIKIŞ YAP MODALI */}
      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Uyarı"
        message="Çıkış yapıyorsunuz."
        confirmText="TAMAM"
        cancelText="İPTAL"
        confirmTextColor="#D32F2F" // Çıkış butonu kırmızı olsun
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          // Tüm geçmişi temizle ve Login ekranına fırlat
          router.replace('/login');
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Tüm stiller aynı kalıyor, hiçbir değişiklik yok)
  container: { flex: 1, backgroundColor: '#FAFAFA' }, 
  header: { paddingVertical: 15, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1976D2' },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, color: '#8E8E93', marginTop: 25, marginBottom: 10, marginLeft: 5 },
  profileCard: { backgroundColor: '#cce5f3', borderRadius: 20, padding: 20, elevation: 2, shadowColor: '#ffffff', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderWidth:0 },
  userName: { fontSize: 20, fontWeight: '500', color: '#333' },
  companyName: { fontSize: 14, color: '#666', marginTop: 5, letterSpacing: 0.5 },
  menuContainer: { gap: 12 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 15, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#EBEBEB', elevation: 1, shadowColor: '#ffffff', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  menuText: { fontSize: 16, color: '#333' },
  footer: { alignItems: 'center', paddingBottom: 25, paddingTop: 15, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#F2F2F2' },
  versionText: { fontSize: 12, color: '#A0A0A0', marginBottom: 10 },
  logoutButton: { backgroundColor: '#FEEBEE', paddingVertical: 12, paddingHorizontal: 80, borderRadius: 25 },
  logoutText: { color: '#D32F2F', fontWeight: '600', fontSize: 15 },
});