// Path: src/features/settings/screens/ActiveDelegatesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_DATA = [
  { id: '1', email: 'ahmet.yilmaz@yasarbilgi.com.tr', date: '15.04.2026 - 20.04.2026', scope: 'Tümü' },
  { id: '2', email: 'uzun.isimli.bir.personel@yasarbilgi.com.tr', date: '10.04.2026 - Süresiz', scope: 'Dijital.Proje, Akdem, ATF' },
  { id: '3', email: 'kisa@yasarbilgi.com.tr', date: '01.05.2026 - 05.05.2026', scope: 'Bedelsiz Sipariş' },
];

export default function ActiveDelegatesScreen() {
  const router = useRouter();

  // ŞEFİM: Silme tuşu için onay pop-up mekanizması geri geldi
  const handleRevoke = (id: string) => {
    Alert.alert(
      "Vekalet Silme",
      "Bu vekaleti silmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sil", 
          style: "destructive", 
          onPress: () => console.log("Backend'e silme isteği gönderildi ID:", id) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: "Aktif Vekaletlerim", 
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FAFAFA' },
          // Yazı tipi artık 'normal' (kalın değil) ve mavi renkte
          headerTitleStyle: { color: '#1976D2', fontSize: 18, fontWeight: 'normal' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ marginLeft: 5, padding: 5 }}
            >
              <Ionicons name="arrow-back" size={28} color="#1976D2" />
            </TouchableOpacity>
          ),
          // ŞEFİM: Sağ üstteki "+" butonu geri eklendi
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings/create-delegate')} // İlgili rotaya yönlendirir
              style={{ marginRight: 5, padding: 5 }}
            >
              <Ionicons name="add" size={32} color="#1976D2" />
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={MOCK_DATA}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            
            {/* SİLME BUTONU (Artık mavi temalı) */}
            <TouchableOpacity 
              style={styles.revokeButton} 
              onPress={() => handleRevoke(item.id)}
            >
              <Ionicons name="trash-outline" size={22} color="#D32F2F" />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>E-Posta: </Text>
                <Text style={styles.valueText}>{item.email}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.label}>Tarih: </Text>
                <Text style={styles.valueText}>{item.date}</Text>
              </View>

              <View style={styles.fieldRow}>
                <Text style={styles.label}>Kapsam: </Text>
                <Text style={styles.valueText}>{item.scope}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#1976D2" />
            <Text style={[styles.emptyText, { color: '#1976D2' }]}>Aktif vekaletiniz bulunmuyor.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { padding: 20, paddingBottom: 40, gap: 15 },
  
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    paddingRight: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  revokeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 6,
    borderRadius: 8,
    zIndex: 10,
  },

  infoContainer: { gap: 6 },
  
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333', // Etiketler artık mavi
    lineHeight: 22,
  },
  valueText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16 },
});