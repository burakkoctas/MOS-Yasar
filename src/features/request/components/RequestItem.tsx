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
}

const RequestItem: React.FC<RequestItemProps> = ({
  requestData,
  onItemPress,
  isSelected,
  onSelect,
  showCheckbox = true,
}) => {
  if (!requestData) return null;

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => onItemPress(requestData)}
    >
      <RequestCardHeader
        statusLabel={requestData.onayDurumu || 'Bekliyor'}
        isSelected={isSelected}
        onSelect={(val) => onSelect(requestData.id, val)}
        showCheckbox={showCheckbox}
      />

      <RequestCardInfo
        senderName={requestData.gonderen || 'İsimsiz'}
        requestDate={requestData.baslangic || '-'}
      />

      <RequestCardDetails
        requestId={requestData.istekNo || '0'}
        companyTitle={requestData.sirket || '-'}
        currentStatus={requestData.statu || '-'}
        startDate={requestData.baslangic || '-'}
        endDate={requestData.bitis || '-'}
      />
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
    // Accordion animasyonu sirasinda siyah golge izleri olusmamasi icin
    // kart ayiricisini shadow yerine border ile veriyoruz.
    shadowColor: '#DCE6F2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
});

export default RequestItem;
