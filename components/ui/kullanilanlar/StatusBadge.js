import { StyleSheet, Text, View } from 'react-native';

export default function StatusBadge({ status, fullWidth }) {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'onaylandı': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'onay bekliyor': return { bg: '#FFF3E0', text: '#EF6C00' }; // Açık turuncu arka plan, koyu turuncu yazı
      case 'reddedildi': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  const colors = getBadgeStyle();

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: colors.bg }, 
      fullWidth && styles.fullWidthBadge // Eğer fullWidth istenmişse bu stili de ekle
    ]}>
      <Text style={[
        styles.text, 
        { color: colors.text }, 
        fullWidth && styles.fullWidthText
      ]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
  
  // %80 Genişlik istendiğinde devreye girecek stiller
  fullWidthBadge: { 
    width: '100%', 
    alignItems: 'center', // Yazıyı yatayda ortala
    paddingVertical: 6, 
    borderRadius: 8 
  },
  fullWidthText: { 
    fontSize: 12, 
    fontWeight: 'bold',
    textTransform: 'uppercase' // Onay durumu genelde büyük harfle şık durur
  }
});