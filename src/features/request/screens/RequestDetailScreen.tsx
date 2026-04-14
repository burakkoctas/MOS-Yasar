// Path: src/features/request/screens/RequestDetailScreen.tsx

import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RequestDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const dummyDetail = {
    id: id || 'REQ-9982',
    isim: 'Ahmet Yılmaz',
    tarih: '08 Nis 2026',
    belgeNo: 'BEL-2026-001',
    sirket: 'Pinar Et ve Süt.',
    statu: 'Yönetici Onayında',
    istekNo: id || 'REQ-9982',
    acilis: '05.04.2026',
    bitis: '10.04.2026',
    modul: 'SAP FI',
    kategori: 'Yetki Talebi',
    aciklama:
      'Kullanıcının SAP FI modülünde masraf merkezi raporlarına erişim yetkisi tanımlanması gerekmektedir.',
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* CUSTOM HEADER */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top + 6 },
        ]}
      >
        <Pressable
          style={styles.headerSideButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color="#1976D2"
          />
        </Pressable>

        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>
            Talep Detay
          </Text>
        </View>

        <Pressable
          style={styles.headerSideButton}
          onPress={() =>
            setIsDeleteModalVisible(true)
          }
        >
          <Ionicons
            name="trash-outline"
            size={23}
            color="#1976D2"
          />
        </Pressable>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 130,
          },
        ]}
      >
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {dummyDetail.statu}
          </Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.nameText}>
            {dummyDetail.isim}
          </Text>

          <Text style={styles.dateText}>
            {dummyDetail.tarih}
          </Text>
        </View>

        <Text style={styles.belgeNoText}>
          Belge No: {dummyDetail.belgeNo}
        </Text>

        <Text style={styles.sectionTitle}>
          Feniks Sap Uygulamaları
        </Text>

        <View style={styles.sectionCard}>
          <InfoRow
            label="İstek No"
            value={dummyDetail.istekNo}
          />
          <InfoRow
            label="Şirket"
            value={dummyDetail.sirket}
          />
          <InfoRow
            label="Statü"
            value={dummyDetail.statu}
          />
          <InfoRow
            label="Açılış Tarihi"
            value={dummyDetail.acilis}
          />
          <InfoRow
            label="Bitiş Tarihi"
            value={dummyDetail.bitis}
          />
          <InfoRow
            label="Modül"
            value={dummyDetail.modul}
          />
          <InfoRow
            label="Kategori"
            value={dummyDetail.kategori}
          />
        </View>

        <Text style={styles.sectionTitle}>
          İstek Açıklaması
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.descriptionText}>
            {dummyDetail.aciklama}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Kişiler
        </Text>

        <View style={styles.sectionCard}>
          <InfoRow
            label="İstek Sahibi"
            value="Ahmet Yılmaz"
          />
          <InfoRow
            label="Görevi"
            value="Finans Uzmanı"
          />
          <InfoRow
            label="Grubu"
            value="Mali İşler"
          />
          <InfoRow
            label="Yöneticisi"
            value="Mehmet Demir"
          />
          <InfoRow
            label="Bölgesi"
            value="Merkez"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Onay Tarihçesi
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.historyText}>
            • 1. Onaylayan:
            Mehmet Demir (Onaylandı)
          </Text>

          <Text style={styles.historyText}>
            • 2. Onaylayan:
            Bekliyor...
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          İstek Notları
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.noteName}>
            Ayşe Kaya{' '}
            <Text style={styles.noteDate}>
              (05.04.2026)
            </Text>
          </Text>

          <Text style={styles.noteText}>
            İlgili yetki formu ektedir,
            işlemler başlatıldı.
          </Text>
        </View>
      </ScrollView>

      {/* MODAL */}
      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Uyarı"
        message={
          <>
            İstek yalnızca talep
            listenizden kaldırılacak,
            Talep eden sisteme{' '}
            <Text
              style={{
                fontStyle: 'italic',
                fontWeight: 'bold',
              }}
            >
              iletilmeyecektir.
            </Text>{' '}
            Emin misiniz?
          </>
        }
        onCancel={() =>
          setIsDeleteModalVisible(false)
        }
        onConfirm={() => {
          setIsDeleteModalVisible(false);
          router.back();
        }}
      />

      {/* DRAWER */}
      <ActionDrawer
        selectedIds={[dummyDetail.id]}
        onActionComplete={() =>
          router.back()
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  headerContainer: {
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  headerSideButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },

  scrollContent: {
    padding: 20,
    paddingTop: 12,
  },

  statusBar: {
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },

  statusText: {
    color: '#E65100',
    fontWeight: 'bold',
    fontSize: 14,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  dateText: {
    fontSize: 14,
    color: '#666',
  },

  belgeNoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 10,
    marginTop: 10,
  },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    elevation: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },

  historyText: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },

  noteName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  noteDate: {
    fontWeight: 'normal',
    color: '#888',
    fontSize: 12,
  },

  noteText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontStyle: 'italic',
  },
});