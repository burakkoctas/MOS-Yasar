import { authService } from '@/src/features/auth/services/authService';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import CustomFabIcon from '@/src/shared/components/ui/CustomFabIcon';
import YasarBilgiLogo from '@/src/shared/components/ui/YasarBilgiLogo';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      const message = await authService.register({
        firstName,
        lastName,
        email,
      });

      Alert.alert('Bilgi', message || 'Geçici şifre e-posta ile gönderildi.');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kayıt tamamlanamadı.';
      Alert.alert('Kayıt Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: '',
            headerTransparent: false,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#FAFAFA' },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-back" size={28} color="#1976D2" />
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.logoContainer, isKeyboardVisible && styles.logoContainerKeyboardVisible]}>
            {!isKeyboardVisible && (
              <View style={styles.iconWrapper}>
                <CustomFabIcon size={55} color="#1976D2" />
              </View>
            )}
            <Text style={[styles.appName, isKeyboardVisible && styles.appNameKeyboardVisible]}>
              Dijital.Onay
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ad"
                placeholderTextColor="#A0A0A0"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Soyad"
                placeholderTextColor="#A0A0A0"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>Üye Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <YasarBilgiLogo width={120} height={19} />
          </View>
        )}

        <AppLoader visible={isSubmitting} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  backButton: { marginLeft: 5, padding: 5 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 100,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoContainerKeyboardVisible: { marginBottom: 26 },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1976D2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    letterSpacing: 0.5,
  },
  appNameKeyboardVisible: {
    fontSize: 32,
  },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  registerButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
    alignItems: 'center',
  },
});
