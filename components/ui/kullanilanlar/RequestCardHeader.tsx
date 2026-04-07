import Checkbox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  statusLabel: string;
  isInitiallySelected: boolean;
}

const RequestCardHeader: React.FC<HeaderProps> = ({ statusLabel, isInitiallySelected }) => {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    setIsSelected(isInitiallySelected);
  }, [isInitiallySelected]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.badgeWrapper}>
        <StatusBadge status={statusLabel} fullWidth={true} />
      </View>
      <View style={styles.checkboxWrapper}>
        <Checkbox
          value={isSelected}
          onValueChange={setIsSelected}
          color={isSelected ? '#1976D2' : undefined}
          style={styles.checkbox}
        />
      </View>
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
  },
  badgeWrapper: { position: 'absolute', left: '10%', width: '80%' },
  checkboxWrapper: { zIndex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 4 },
});

export default RequestCardHeader;