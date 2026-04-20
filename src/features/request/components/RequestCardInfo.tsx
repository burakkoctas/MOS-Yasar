import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoProps {
  senderName: string;
  requestDate: string;
  compact?: boolean;
}

const RequestCardInfo: React.FC<InfoProps> = ({ senderName, requestDate, compact = false }) => (
  <View style={[styles.infoContainer, compact && styles.infoContainerCompact]}>
    <Text style={[styles.senderText, compact && styles.senderTextCompact]}>{senderName}</Text>
    <Text style={[styles.dateText, compact && styles.dateTextCompact]}>{requestDate}</Text>
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
  infoContainerCompact: {
    paddingHorizontal: 12,
  },
  senderText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  senderTextCompact: { fontSize: 13 },
  dateText: { fontSize: 11, color: '#555' },
  dateTextCompact: { fontSize: 10 },
});

export default RequestCardInfo;
