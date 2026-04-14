// Path: src/features/request/components/RequestCardHeader.tsx
import Checkbox from 'expo-checkbox';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  statusLabel: string;
  isSelected: boolean;
  onSelect: (value: boolean) => void;
  showCheckbox?: boolean; // ŞEFİM: Geçmiş listesinde gizlemek için eklendi
}

const RequestCardHeader: React.FC<HeaderProps> = ({ 
  statusLabel, 
  isSelected, 
  onSelect,
  showCheckbox = true
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.badgeWrapper}>
        <StatusBadge status={statusLabel} fullWidth={true} />
      </View>

      {showCheckbox && (
        <Pressable 
          style={styles.checkboxWrapper}
          onPress={(e) => {
            e.stopPropagation(); // Karta tıklamayı (detaya gitmeyi) engeller
            onSelect(!isSelected); // Seçimi tersine çevir
          }} 
          // ŞEFİM: Görünmez tıklama alanını her yönden 15 birim genişlettik
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          {/* pointerEvents="none" sayesinde küçük kutu tıklamayı yutmaz, Pressable halleder */}
          <View pointerEvents="none">
            <Checkbox
              value={isSelected}
              color={isSelected ? '#1976D2' : undefined}
              style={styles.checkbox}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingRight: 15,
    height: 30,
    zIndex: 10,
  },
  badgeWrapper: { position: 'absolute', left: '10%', width: '80%', pointerEvents: 'none' },
  checkboxWrapper: { padding: 10, marginRight: -10, zIndex: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 4 },
});

export default RequestCardHeader;