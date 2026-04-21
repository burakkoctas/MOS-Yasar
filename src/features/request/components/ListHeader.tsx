import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ListHeader = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>Talep Listesi</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 5,
  },
});

export default ListHeader;