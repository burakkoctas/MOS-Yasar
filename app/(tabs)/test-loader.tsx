import AppLoader from '@/components/ui/kullanilanlar/AppLoader';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoaderTestScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLoading = () => {
    setIsLoading(true);

    // Şefim, istediğin gibi 5 saniye boyunca ekranda kalacak
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Yeni Loader Testi" }} />

      <View style={styles.content}>
        <Text style={styles.infoText}>
          Yeni Tasarım: Beyaz Zemin, Mavi Çember, Mavi Ok{"\n"}
          Efekt: 0.75sn Takla + 0.75sn Bekleme
        </Text>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleStartLoading}
        >
          <Text style={styles.buttonText}>5 SANİYE TEST ET</Text>
        </TouchableOpacity>

        <Text style={styles.subText}>
          FAB ile tam uyumlu yeni yükleme ekranı.
        </Text>
      </View>

      <AppLoader visible={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  testButton: { backgroundColor: '#1976D2', paddingVertical: 18, paddingHorizontal: 30, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  subText: { marginTop: 15, fontSize: 12, color: '#999' }
});