import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  status: string;
  fullWidth?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export default function StatusBadge({
  status,
  fullWidth,
  backgroundColor,
  textColor,
}: StatusBadgeProps) {
  const getBadgeStyle = () => {
    if (backgroundColor || textColor) {
      return {
        bg: backgroundColor ?? '#F5F5F5',
        text: textColor ?? '#616161',
      };
    }

    switch (status?.toLowerCase()) {
      case 'onaylandı':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'onay bekliyor':
        return { bg: '#FFF3E0', text: '#EF6C00' };
      case 'reddedildi':
        return { bg: '#FFEBEE', text: '#C62828' };
      default:
        return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  const colors = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        fullWidth && styles.fullWidthBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          fullWidth && styles.fullWidthText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
  fullWidthBadge: { width: '100%', alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  fullWidthText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
});
