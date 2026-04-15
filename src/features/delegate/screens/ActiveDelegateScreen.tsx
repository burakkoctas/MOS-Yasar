import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DelegateCard from '../components/DelegateCard';
import { delegateService } from '../services/delegateService';
import { Delegate } from '../types';

export default function ActiveDelegatesScreen() {
  const router = useRouter();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDelegates = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextDelegates = await delegateService.getActiveDelegates();
      setDelegates(nextDelegates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDelegates();
    }, [loadDelegates]),
  );

  const handleRevoke = async () => {
    if (!pendingDeleteId) {
      return;
    }

    setIsLoading(true);
    try {
      await delegateService.revokeDelegate(pendingDeleteId);
      setPendingDeleteId(null);
      await loadDelegates();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Aktif Vekaletlerim',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerTitleStyle: { color: '#1976D2', fontSize: 18, fontWeight: 'normal' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 5, padding: 5 }}>
              <Ionicons name="arrow-back" size={28} color="#1976D2" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/settings/create-delegate')}
              style={{ marginRight: 5, padding: 5 }}
            >
              <Ionicons name="add" size={32} color="#1976D2" />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={delegates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <DelegateCard delegate={item} onDelete={setPendingDeleteId} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#1976D2" />
            <Text style={[styles.emptyText, { color: '#1976D2' }]}>
              Aktif vekaletiniz bulunmuyor.
            </Text>
          </View>
        }
      />

      <ConfirmModal
        visible={Boolean(pendingDeleteId)}
        title="Vekalet Silme"
        message="Bu vekaleti silmek istediğinize emin misiniz?"
        confirmText="Sil"
        cancelText="Vazgeç"
        confirmTextColor="#D32F2F"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleRevoke}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16 },
});
