import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DetailsProps {
  lines: string[];
}

const RequestCardDetails: React.FC<DetailsProps> = ({ lines }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detailsContainer}>
      {lines.slice(0, 5).map((line, index) => (
        <Text key={`${line}-${index}`} style={[styles.detailItem, { color: colors.textBody }]}>
          {line}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  detailsContainer: { paddingHorizontal: 15 },
  detailItem: { fontSize: 13, marginBottom: 4 },
});

export default RequestCardDetails;
