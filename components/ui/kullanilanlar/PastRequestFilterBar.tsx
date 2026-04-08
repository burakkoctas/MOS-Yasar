import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateRangePickerModal from './DateRangePickerModal';

interface PastRequestFilterBarProps {
    onSearch: (text: string) => void;
    onDateRangeSelect: (range: string) => void; // Seçilen aralığı üst sayfaya bildirir
}

const PastRequestFilterBar: React.FC<PastRequestFilterBarProps> = ({
    onSearch,
    onDateRangeSelect
}) => {
    const [searchText, setSearchText] = useState('');
    const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);
    const handleTextChange = (text: string) => {
        setSearchText(text); // Kendi içindeki state'i günceller (görsel için)
        onSearch(text);      // Üst sayfaya (past-requests.tsx) haberi uçurur
    };
    // BUGÜNÜN GÜNÜ (Takvim yaprağı ikonu için)
    const todayDay = new Date().getDate();

    return (
        <View style={styles.container}>
            {/* PAYLAŞILAN ATOM: ARAMA KUTUSU */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Arama kriteri giriniz"
                    placeholderTextColor="#1976D2"
                    value={searchText}
                    onChangeText={handleTextChange}
                />
            </View>

            {/* GEÇMİŞE ÖZEL TAKVİM BUTONU */}
            <Pressable
                style={styles.calendarButton}
                onPress={() => setIsRangePickerVisible(true)}
            >
                <View style={styles.calendarHeader} />
                <View style={styles.calendarBody}>
                    <Text style={styles.calendarText}>{todayDay}</Text>
                </View>
            </Pressable>

            {/* GEÇMİŞE ÖZEL RANGE PICKER MODAL */}
            <DateRangePickerModal
                visible={isRangePickerVisible}
                onClose={() => setIsRangePickerVisible(false)}
                onSave={(range) => {
                    onDateRangeSelect(range);
                    setIsRangePickerVisible(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F2F2F2',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        alignItems: 'center'
    },
    input: { flex: 1, color: '#1976D2', fontSize: 14, fontWeight: '400' },
    calendarButton: {
        width: 40, height: 40, backgroundColor: '#fff', borderRadius: 8,
        borderWidth: 1.5, borderColor: '#1976D2', overflow: 'hidden', marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    calendarHeader: { height: 12, backgroundColor: '#1976D2' },
    calendarBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    calendarText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});

export default PastRequestFilterBar;