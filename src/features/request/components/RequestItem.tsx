import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { RequestItem as RequestItemType } from '../types';
import RequestCardDetails from './RequestCardDetails';
import RequestCardHeader from './RequestCardHeader';
import RequestCardInfo from './RequestCardInfo';

interface RequestItemProps {
  requestData: RequestItemType;
  onItemPress: (item: RequestItemType) => void;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
  showCheckbox?: boolean;
  compact?: boolean;
}

const RequestItem: React.FC<RequestItemProps> = ({
  requestData,
  onItemPress,
  isSelected,
  onSelect,
  showCheckbox = true,
  compact = false,
}) => {
  if (!requestData) {
    return null;
  }

  return (
    <Pressable
      style={[styles.cardContainer, compact && styles.cardContainerCompact]}
      onPress={() => onItemPress(requestData)}
    >
      <RequestCardHeader
        statusLabel={requestData.statusLabel || requestData.statu || '-'}
        statusBackgroundColor={requestData.statusBackgroundColor}
        statusTextColor={requestData.statusTextColor}
        isSelected={isSelected}
        onSelect={(value) => onSelect(requestData.id, value)}
        showCheckbox={showCheckbox}
      />

      <RequestCardInfo
        senderName={requestData.gonderen || 'İsimsiz'}
        requestDate={requestData.baslangic || '-'}
        compact={compact}
      />

      <RequestCardDetails lines={requestData.descriptionList ?? []} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#DCE6F2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardContainerCompact: {
    marginHorizontal: 0,
    marginBottom: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
});

export default RequestItem;
