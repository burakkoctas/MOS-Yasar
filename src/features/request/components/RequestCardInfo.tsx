import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoProps {
  senderName: string;
  requestDate: string;
}

const RequestCardInfo: React.FC<InfoProps> = ({ senderName, requestDate }) => (
  <View style={styles.infoContainer}>
    <Text style={styles.senderText}>{senderName}</Text>
    <Text style={styles.dateText}>{requestDate}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 2,
  },
  senderText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  dateText: { fontSize: 11, color: '#555' },
});

export default RequestCardInfo;