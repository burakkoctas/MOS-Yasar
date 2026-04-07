import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ListHeader = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Talep Listesi</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: 'center', // Başlığı ortaladık
  },
  title: {
    fontSize: 18,
    fontWeight: '400', // Daha ince (Thin/Regular)
    color: '#1976D2',  // Kurumsal mavi
    letterSpacing: 1,
  },
});

export default ListHeader;