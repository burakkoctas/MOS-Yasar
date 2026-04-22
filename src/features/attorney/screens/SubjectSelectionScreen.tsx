import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAttorney } from '../context/AttorneyContext';

const AnimatedPill = ({ children, index }: { children: React.ReactNode; index: number }) => {
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

export default function SubjectSelectionScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { availableSubjects, selectedSubjectIds, setSelectedSubjectIds } = useAttorney();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const initialSelectionRef = useRef<number[]>(selectedSubjectIds);

  const toggleSelection = (id: number) => {
    setSelectedSubjectIds(
      selectedSubjectIds.includes(id)
        ? selectedSubjectIds.filter((item) => item !== id)
        : [...selectedSubjectIds, id],
    );
  };

  const handleBackPress = () => {
    const initial = initialSelectionRef.current;
    const hasChanges =
      selectedSubjectIds.length !== initial.length ||
      selectedSubjectIds.some((id) => !initial.includes(id));

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
          headerTitle: 'Konu Seç',
          headerTitleAlign: 'center',
          headerTitleStyle: { color: colors.primary, fontWeight: 'normal', fontSize: 18 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={handleBackPress} style={{ marginLeft: 5 }}>
              <Ionicons name="arrow-back" size={28} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
              <Text style={styles.doneButtonText}>Bitti</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={availableSubjects}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selectedSubjectIds.includes(item.id);
          return (
            <AnimatedPill index={index}>
              <TouchableOpacity
                style={[styles.pillContainer, isSelected && styles.pillContainerSelected]}
                onPress={() => toggleSelection(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {item.name}
                </Text>
                <View style={styles.iconPlaceholder}>
                  {isSelected && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
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
          setSelectedSubjectIds(initialSelectionRef.current);
          router.back();
        }}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    iconPlaceholder: { width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: 20, paddingBottom: 40 },
    doneButtonText: { color: colors.primary, fontWeight: 'normal', fontSize: 16 },
    pillContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 30, marginBottom: 12, borderWidth: 1.5, borderColor: colors.border, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
    pillContainerSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLightBorder },
    pillText: { fontSize: 16, color: colors.textBody, fontWeight: '400' },
    pillTextSelected: { color: colors.primary, fontWeight: '400', fontSize: 16 },
  });
