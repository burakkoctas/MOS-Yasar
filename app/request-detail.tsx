import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActionDrawer from '../components/ui/kullanilanlar/ActionDrawer';

export default function RequestDetailScreen() {
  const dummyDetail = {
    isim: "Ahmet Yılmaz", tarih: "08 Nis 2026", belgeNo: "BEL-2026-001",
    sirket: "Cevher Jant Sanayii A.Ş.", statu: "Yönetici Onayında",
    istekNo: "REQ-9982", acilis: "05.04.2026", bitis: "10.04.2026",
    modul: "SAP FI", kategori: "Yetki Talebi",
    aciklama: "Kullanıcının SAP FI modülünde masraf merkezi raporlarına erişim yetkisi tanımlanması gerekmektedir.",
  };

  const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Talep Onay", headerBackTitle: "Geri" }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{dummyDetail.statu}</Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{dummyDetail.isim}</Text>
          <Text style={styles.dateText}>{dummyDetail.tarih}</Text>
        </View>
        
        <Text style={styles.belgeNoText}>Belge No: {dummyDetail.belgeNo}</Text>

        <Text style={styles.sectionTitle}>Feniks Sap Uygulamaları</Text>
        <View style={styles.sectionCard}>
          <InfoRow label="İstek No" value={dummyDetail.istekNo} />
          <InfoRow label="Şirket" value={dummyDetail.sirket} />
          <InfoRow label="Statü" value={dummyDetail.statu} />
          <InfoRow label="Açılış Tarihi" value={dummyDetail.acilis} />
          <InfoRow label="Bitiş Tarihi" value={dummyDetail.bitis} />
          <InfoRow label="Modül" value={dummyDetail.modul} />
          <InfoRow label="Kategori" value={dummyDetail.kategori} />
        </View>

        <Text style={styles.sectionTitle}>İstek Açıklaması</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.descriptionText}>{dummyDetail.aciklama}</Text>
        </View>

        <Text style={styles.sectionTitle}>Kişiler</Text>
        <View style={styles.sectionCard}>
          <InfoRow label="İstek Sahibi" value="Ahmet Yılmaz" />
          <InfoRow label="Görevi" value="Finans Uzmanı" />
          <InfoRow label="Grubu" value="Mali İşler" />
          <InfoRow label="Yöneticisi" value="Mehmet Demir" />
          <InfoRow label="Bölgesi" value="Merkez" />
          <InfoRow label="İsteği Açan" value="Ayşe Kaya" />
          <InfoRow label="Sorumlu Uzman" value="Ali Veli" />
        </View>

        <Text style={styles.sectionTitle}>Onay Tarihçesi</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.historyText}>1. Onaylayan Yönetici: Mehmet Demir (Onaylandı)</Text>
          <Text style={styles.historyText}>2. Onaylayan Yönetici: Bekliyor...</Text>
        </View>

        <Text style={styles.sectionTitle}>İstek Notları</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.noteName}>Ayşe Kaya <Text style={styles.noteDate}>(05.04.2026)</Text></Text>
          <Text style={styles.noteText}>İlgili yetki formu ektedir, işlemler başlatıldı.</Text>
        </View>
        
        {/* En altta FAB için geniş boşluk */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* YENİ NESİL AKILLI DRAWER VE FAB BİLEŞENİ */}
      <ActionDrawer 
        onApprove={() => console.log("Onaylandı!")}
        onReject={() => console.log("Reddedildi!")}
      />
    </View>
  );
}

// Stiller aynı kalıyor (sadece sayfa tasarımı)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { padding: 20 },
  statusBar: { width: '80%', alignSelf: 'center', backgroundColor: '#FFF3E0', paddingVertical: 8, borderRadius: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFE0B2' },
  statusText: { color: '#E65100', fontWeight: 'bold', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 14, color: '#666' },
  belgeNoText: { fontSize: 14, color: '#888', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1976D2', marginBottom: 10, marginTop: 10 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#EBEBEB', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 14, color: '#666', flex: 1 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right' },
  descriptionText: { fontSize: 14, color: '#444', lineHeight: 20 },
  historyText: { fontSize: 14, color: '#333', paddingVertical: 4 },
  noteName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  noteDate: { fontWeight: 'normal', color: '#888', fontSize: 12 },
  noteText: { fontSize: 14, color: '#555', marginTop: 5, fontStyle: 'italic' },
});