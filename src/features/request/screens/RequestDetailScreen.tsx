import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RequestDetailHeader from '../components/detail/RequestDetailHeader';
import RequestDetailSection from '../components/detail/RequestDetailSection';
import RequestInfoRow from '../components/detail/RequestInfoRow';
import { requestService } from '../services/requestService';
import { RequestItem } from '../types';

export default function RequestDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [request, setRequest] = useState<RequestItem | null>(null);
  const isHistoryView = source === 'history';

  const loadRequest = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    try {
      const nextRequest = await requestService.getRequestById(id);
      setRequest(nextRequest);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [loadRequest]),
  );

  const handleActionComplete = async (action: 'APPROVE' | 'REJECT') => {
    if (!request) {
      return;
    }

    setIsLoading(true);
    try {
      await requestService.processAction([request.id], action);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  if (!request && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Talep detayı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RequestDetailHeader
        title="Talep Detay"
        topInset={insets.top}
        onBack={() => router.back()}
        onDelete={!isHistoryView ? () => setIsDeleteModalVisible(true) : undefined}
      />

      {request && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + (isHistoryView ? 24 : 130) },
            ]}
          >
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{request.statu}</Text>
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.nameText}>{request.isim ?? request.gonderen}</Text>
              <Text style={styles.dateText}>{request.tarih ?? request.baslangic}</Text>
            </View>

            <Text style={styles.belgeNoText}>
              Belge No: {request.belgeNo ?? `BEL-${request.istekNo}`}
            </Text>

            <RequestDetailSection title={request.kategori ?? 'Talep Bilgileri'}>
              <RequestInfoRow label="İstek No" value={request.istekNo} />
              <RequestInfoRow label="Şirket" value={request.sirket} />
              <RequestInfoRow label="Statü" value={request.statu} />
              <RequestInfoRow label="Açılış Tarihi" value={request.acilis ?? request.baslangic} />
              <RequestInfoRow label="Bitiş Tarihi" value={request.bitis} />
              <RequestInfoRow label="Modül" value={request.modul ?? 'SAP Workflow'} />
              <RequestInfoRow label="Kategori" value={request.kategori ?? '-'} />
            </RequestDetailSection>

            <RequestDetailSection title="İstek Açıklaması">
              <Text style={styles.descriptionText}>
                {request.aciklama ?? 'Açıklama bulunmuyor.'}
              </Text>
            </RequestDetailSection>

            <RequestDetailSection title="Kişiler">
              <RequestInfoRow label="İstek Sahibi" value={request.gonderen} />
              <RequestInfoRow label="Şirket" value={request.sirket} />
              <RequestInfoRow label="Onay Durumu" value={request.onayDurumu} />
            </RequestDetailSection>
          </ScrollView>

          {!isHistoryView && (
            <>
              <ConfirmModal
                visible={isDeleteModalVisible}
                title="Uyarı"
                message="İstek yalnızca bu cihazdaki listeden kaldırılacak. Talep oluşturan kişiye iletilmeyecektir."
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={() => {
                  setIsDeleteModalVisible(false);
                  router.back();
                }}
              />

              <ActionDrawer selectedIds={[request.id]} onActionComplete={handleActionComplete} />
            </>
          )}
        </>
      )}

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  emptyText: { fontSize: 16, color: '#666' },
  scrollContent: { padding: 20, paddingTop: 12 },
  statusBar: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  statusText: { color: '#E65100', fontWeight: 'bold', fontSize: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 14, color: '#666' },
  belgeNoText: { fontSize: 14, color: '#888', marginBottom: 20 },
  descriptionText: { fontSize: 14, color: '#444', lineHeight: 20 },
});
