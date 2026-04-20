import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailsProps {
  lines: string[];
}

const RequestCardDetails: React.FC<DetailsProps> = ({ lines }) => (
  <View style={styles.detailsContainer}>
    {lines.slice(0, 5).map((line, index) => (
      <Text key={`${line}-${index}`} style={styles.detailItem}>
        {line}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  detailsContainer: { paddingHorizontal: 15 },
  detailItem: { fontSize: 13, color: '#444', marginBottom: 4 },
});

export default RequestCardDetails;
