import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const EmptyState = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Eşleşen kayıt bulunamadı.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    alignItems: 'center',
  },
  text: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default EmptyState;