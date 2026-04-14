import Checkbox from 'expo-checkbox';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  statusLabel: string;
  isSelected: boolean;
  onSelect: (value: boolean) => void;
  showCheckbox?: boolean;
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
        <StatusBadge status={statusLabel} fullWidth />
      </View>

      {showCheckbox && (
        <Pressable
          style={styles.checkboxWrapper}
          onPress={(e) => e.stopPropagation()}
        >
          <Checkbox
            value={isSelected}
            onValueChange={onSelect}
            color={isSelected ? '#1976D2' : undefined}
            style={styles.checkbox}
          />
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
  },
  badgeWrapper: {
    position: 'absolute',
    left: '10%',
    width: '80%',
  },
  checkboxWrapper: {
    padding: 10,
    marginRight: -10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});

export default RequestCardHeader;