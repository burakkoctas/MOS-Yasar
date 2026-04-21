import AppLoader from '@/src/shared/components/ui/AppLoader';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DelegateCard from '../components/DelegateCard';
import { delegateService } from '../services/delegateService';
import { Delegate } from '../types';

export default function PastDelegateScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Geçmiş Vekaletlerim',
          headerTitleAlign: 'center',
          headerTitleStyle: { color: colors.primary, fontWeight: 'normal', fontSize: 18 },
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, marginLeft: 5 })}
            >
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
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
          <Text style={[styles.emptyText, { color: colors.textSystemGray }]}>Geçmiş vekalet kaydı bulunmamaktadır.</Text>
        </View>
      )}

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
