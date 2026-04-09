import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import RequestCardDetails from './RequestCardDetails';
import RequestCardHeader from './RequestCardHeader';
import RequestCardInfo from './RequestCardInfo';

interface RequestItemProps {
  requestData: any;
  onItemPress: (item: any) => void;
  isSelected: boolean;
  // Hatanın çözümü burada: Fonksiyon imzasını (id, isSelected) olarak güncelledik
  onSelect: (id: string, isSelected: boolean) => void; 
}

const RequestItem: React.FC<RequestItemProps> = ({ 
  requestData, 
  onItemPress, 
  isSelected,
  onSelect 
}) => {
  
  if (!requestData) return null;

  return (
    <Pressable style={styles.cardContainer} onPress={() => onItemPress(requestData)}>
      
      <RequestCardHeader 
        statusLabel={requestData.onayDurumu || 'Bekliyor'} 
        isSelected={isSelected} 
        // Burada id'yi zaten requestData içinden biliyoruz, onu paslıyoruz
        onSelect={(val: boolean) => onSelect(requestData.id, val)}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  }
});

export default RequestItem;