import AppLoader from '@/src/shared/components/ui/AppLoader';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DelegateCard from '../components/DelegateCard';
import { delegateService } from '../services/delegateService';
import { Delegate } from '../types';

export default function PastDelegateScreen() {
  const router = useRouter();
  const [pastDelegates, setPastDelegates] = useState<Delegate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDelegates = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextDelegates = await delegateService.getPastDelegates();
      setPastDelegates(nextDelegates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDelegates();
    }, [loadDelegates]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Geçmiş Vekaletlerim',
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
        }}
      />

      {pastDelegates.length > 0 ? (
        <FlatList
          data={pastDelegates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <DelegateCard delegate={item} showDelete={false} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Geçmiş vekalet kaydı bulunmamaktadır.</Text>
        </View>
      )}

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { padding: 15, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#8E8E93', textAlign: 'center' },
});
