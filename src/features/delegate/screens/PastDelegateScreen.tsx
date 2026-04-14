// Path: src/features/delegate/screens/PastDelegateScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DelegateCard from '../components/DelegateCard';
import { Delegate } from '../types';

export default function PastDelegateScreen() {
  const router = useRouter();

  // Geçmiş veriler simülasyonu
  const [pastDelegates] = useState<Delegate[]>([
    {
      id: '101',
      email: 'eski.calisan@sirket.com',
      startDate: '01.01.2026',
      endDate: '15.01.2026',
      titles: 'Genel Onay Yetkisi',
    },
    {
      id: '102',
      email: 'yonetici.yedek@pinarsut.com.tr',
      startDate: '10.02.2026',
      endDate: '20.02.2026',
      titles: 'Satın Alma Onayları, Masraf Merkezi Yetkileri',
    }
  ]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Geçmiş Vekaletlerim",
          headerTitleAlign: 'center',
          headerTitleStyle: { color: '#1976D2', fontWeight: 'normal', fontSize: 18 },
          headerTintColor: '#1976D2',
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: 5 })}
            >
              <Ionicons name="arrow-back" size={28} color="#1976D2" />
            </Pressable>
          ),
          // Artı tuşu (headerRight) burada yok
        }}
      />

      {pastDelegates.length > 0 ? (
        <FlatList
          data={pastDelegates}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DelegateCard
              delegate={item}
              showDelete={false} // Çöp kutusunu gizliyoruz
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geçmiş vekalet kaydı bulunmamaktadır.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { padding: 15, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center' },
});