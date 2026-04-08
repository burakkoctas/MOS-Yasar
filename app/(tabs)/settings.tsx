import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Kademeli giriş animasyonu için yardımcı bileşen
const AnimatedItem = ({ children, delay }: { children: React.ReactNode, delay: number }) => {
  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: itemFade, transform: [{ translateY: itemSlide }] }}>
      {children}
    </Animated.View>
  );
};

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      {/* 1. ÜST BAŞLIK (SABİT) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      {/* 2. KAYDIRILABİLİR İÇERİK */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* PROFİL BÖLÜMÜ */}
        <AnimatedItem delay={100}>
          <Text style={styles.sectionTitle}>Profil</Text>
          <View style={styles.profileCard}>
            <Text style={styles.userName}>BURAK KOÇTAŞ</Text>
            <Text style={styles.companyName}>YAŞAR BİLGİ</Text>
          </View>
        </AnimatedItem>

        {/* VEKALET BÖLÜMÜ */}
        <AnimatedItem delay={250}>
          <Text style={styles.sectionTitle}>Vekalet</Text>
          <View style={styles.menuContainer}>
            <Pressable style={styles.menuItem}>
              <Text style={styles.menuText}>Aktif vekaletlerim</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </Pressable>
            
            <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.menuText}>Geçmiş vekaletlerim</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </Pressable>
          </View>
        </AnimatedItem>
      </ScrollView>

      {/* 3. SABİT ALT BİLGİ (NAVBAR ÜSTÜ) */}
      <AnimatedItem delay={400}>
        <View style={styles.footer}>
          <Text style={styles.versionText}>v0.0.1</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.logoutButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </Pressable>
        </View>
      </AnimatedItem>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    paddingTop: 60, 
    paddingBottom: 20, 
    alignItems: 'center', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff'
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1976D2' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  sectionTitle: { 
    fontSize: 14, 
    color: '#8E8E93', 
    marginTop: 25, 
    marginBottom: 10, 
    marginLeft: 5 
  },
  profileCard: {
    backgroundColor: '#198ed22d',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userName: { 
    fontSize: 20, 
    fontWeight: 500, 
    color: '#333' 
  },
  companyName: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 5, 
    letterSpacing: 0.5 
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  menuText: { 
    fontSize: 16, 
    color: '#333' 
  },
  footer: { 
    alignItems: 'center', 
    paddingBottom: 25, 
    paddingTop: 15,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#F2F2F2'
  },
  versionText: { 
    fontSize: 12, 
    color: '#A0A0A0', 
    marginBottom: 10 
  },
  logoutButton: {
    backgroundColor: '#FEEBEE',
    paddingVertical: 12,
    paddingHorizontal: 180,
    borderRadius: 25,
  },
  logoutText: { 
    color: '#D32F2F', 
    fontWeight: '600', 
    fontSize: 15 
  },
});