import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDelegate } from '../context/DelegateContext';

const titleData = [
  { id: '1', name: 'Akdem' },
  { id: '2', name: 'Alacak Dekontu' },
  { id: '3', name: 'ATF' },
  { id: '4', name: 'Bedelsiz Sipariş' },
  { id: '5', name: 'Dijital.Proje' },
];

const AnimatedPill = ({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, index, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

export default function TitleSelectionScreen() {
  const router = useRouter();
  const { selectedTitles, setSelectedTitles } = useDelegate();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const initialSelectionRef = useRef<string[]>(selectedTitles);

  const toggleSelection = (id: string) => {
    setSelectedTitles(
      selectedTitles.includes(id)
        ? selectedTitles.filter((item) => item !== id)
        : [...selectedTitles, id],
    );
  };

  const handleDone = () => {
    router.back();
  };

  const handleBackPress = () => {
    const initialSelection = initialSelectionRef.current;
    const hasChanges =
      selectedTitles.length !== initialSelection.length ||
      selectedTitles.some((title) => !initialSelection.includes(title));

    if (hasChanges) {
      setIsWarningVisible(true);
      return;
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Başlık Seç',
          headerTitleAlign: 'center',
          headerTitleStyle: { color: '#1976D2', fontWeight: 'normal', fontSize: 18 },
          headerStyle: { backgroundColor: '#FAFAFA' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={handleBackPress} style={{ marginLeft: 5 }}>
              <Ionicons name="arrow-back" size={28} color="#1976D2" />
            </Pressable>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDone} style={{ marginRight: 10 }}>
              <Text style={styles.doneButtonText}>Bitti</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={titleData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedTitles.includes(item.id);

          return (
            <AnimatedPill index={index}>
              <TouchableOpacity
                style={[
                  styles.pillContainer,
                  isSelected && styles.pillContainerSelected,
                ]}
                onPress={() => toggleSelection(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {item.name}
                </Text>

                <View style={styles.iconPlaceholder}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={26} color="#1976D2" />
                  )}
                </View>
              </TouchableOpacity>
            </AnimatedPill>
          );
        }}
      />

      <ConfirmModal
        visible={isWarningVisible}
        title="Uyarı"
        message="Yaptığınız değişiklikler kaybolacak. Emin misiniz?"
        confirmText="EVET"
        cancelText="HAYIR"
        onCancel={() => setIsWarningVisible(false)}
        onConfirm={() => {
          setIsWarningVisible(false);
          setSelectedTitles(initialSelectionRef.current);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconPlaceholder: { width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { padding: 20, paddingBottom: 40 },
  doneButtonText: { color: '#1976D2', fontWeight: 'normal', fontSize: 16 },
  pillContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 30, marginBottom: 12, borderWidth: 1.5, borderColor: '#EBEBEB', elevation: 2, shadowColor: '#fff', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  pillContainerSelected: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
  pillText: { fontSize: 16, color: '#444', fontWeight: '400' },
  pillTextSelected: { color: '#1976D2', fontWeight: '400', fontSize: 16 },
});
