import AppLoader from '@/src/shared/components/ui/AppLoader';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AttorneyCard from '../components/AttorneyCard';
import { attorneyService } from '../services/attorneyService';
import { Attorney } from '../types';

export default function PastAttorneyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { history } = await attorneyService.getAttorneys();
      setAttorneys(history);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Veriler yüklenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Geçmiş Vekaletlerim',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.primary, fontSize: 18, fontWeight: 'normal' },
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

      <FlatList
        data={attorneys}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AttorneyCard attorney={item} showRevoke={false} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSystemGray }]}>
              Geçmiş vekalet kaydı bulunmamaktadır.
            </Text>
          </View>
        }
      />

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
