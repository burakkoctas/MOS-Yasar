import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailsProps {
  requestId: string;
  companyTitle: string;
  currentStatus: string;
  startDate: string;
  endDate: string;
}

const RequestCardDetails: React.FC<DetailsProps> = ({ 
  requestId, companyTitle, currentStatus, startDate, endDate 
}) => (
  <View style={styles.detailsContainer}>
    <Text style={styles.detailItem}>İstek No: {requestId}</Text>
    <Text style={styles.detailItem}>Şirket: {companyTitle}</Text>
    <Text style={styles.detailItem}>Statü: {currentStatus}</Text>
    <Text style={styles.detailItem}>Açılış Tarihi: {startDate}</Text>
    <Text style={styles.detailItem}>Bitiş Tarihi: {endDate}</Text>
  </View>
);

const styles = StyleSheet.create({
  detailsContainer: { paddingHorizontal: 15 },
  detailItem: { fontSize: 13, color: '#444', marginBottom: 4 },
});

export default RequestCardDetails;