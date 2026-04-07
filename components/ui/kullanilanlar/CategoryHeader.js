import Checkbox from 'expo-checkbox';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CategoryHeader({ title, count, expanded, onToggle, isAllSelected, onSelectAll }) {
  return (
    <View style={[styles.header, expanded ? styles.headerActive : styles.headerInactive]}>
      {/* Tıklanabilir Sol Alan */}
      <Pressable style={styles.clickableArea} onPress={onToggle}>
        <View style={styles.countCircle}>
          <Text style={styles.countText}>{count}</Text>
        </View>
        <Text style={[styles.title, expanded && styles.titleActive]}>{title}</Text>
      </Pressable>

      {/* Seçim Kutusu */}
      {expanded && (
        <View style={styles.rightContent}>
          <Checkbox
            value={isAllSelected}
            onValueChange={onSelectAll}
            color={isAllSelected ? '#2196F3' : undefined}
            style={styles.checkbox}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderRadius: 50, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
    marginHorizontal:10
  },
  headerInactive: { backgroundColor: '#f2f2f2' },
  headerActive: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#BBDEFB' },
  clickableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingLeft: 15, 
  },
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countText: { fontSize: 28, fontWeight: 'bold', color: '#1976D2' },
  title: { fontSize: 25, fontWeight: '600', color: '#000000', marginLeft: 10 },
  titleActive: { color: '#1976D2' },
  rightContent: {
    paddingVertical: 10,
    paddingRight: 15, 
    paddingLeft: 10,
    justifyContent: 'center',
  },
  checkbox: { width: 20, height: 20, borderRadius: 4 },
});
