import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import RequestCardDetails from './RequestCardDetails';
import RequestCardHeader from './RequestCardHeader';
import RequestCardInfo from './RequestCardInfo';

interface RequestItemProps {
  requestData: any;
  onItemPress: (item: any) => void;
  isItemForceSelected: boolean;
}

const RequestItem: React.FC<RequestItemProps> = ({ 
  requestData, 
  onItemPress, 
  isItemForceSelected 
}) => {
  
  // PROFESYONEL ÖNLEM: Veri yoksa boş dön, hatayı engelle
  if (!requestData) return null;

  return (
    <Pressable style={styles.cardContainer} onPress={() => onItemPress(requestData)}>
      
      {/* Verilerin varlığını garanti altına alarak gönderiyoruz */}
      <RequestCardHeader 
        statusLabel={requestData.onayDurumu || 'Bekliyor'} 
        isInitiallySelected={isItemForceSelected} 
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
    marginBottom: 10, 
    marginHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    elevation: 2,
  }
});

export default RequestItem;