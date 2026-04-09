import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = "arama kriteri giriniz" }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#1976D2"
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  searchContainer: { 
    flex: 1, 
    backgroundColor: '#F2F2F2', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    height: 45, 
    justifyContent: 'center' 
  },
  input: { color: '#1976D2', fontSize: 14, fontWeight: '500' },
});

export default SearchInput;