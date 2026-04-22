import { authService, sanitizeUsernameInput } from '@/src/features/auth/services/authService';
import { AuthSession } from '@/src/features/auth/types';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import CustomFabIcon from '@/src/shared/components/ui/CustomFabIcon';
import YasarBilgiLogo from '@/src/shared/components/ui/YasarBilgiLogo';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { authStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const DEV_USERNAME = 'ugurbozaci';
  const DEV_PASSWORD = 'Astron05';
  const SUBCATEGORY_DEMO_USERNAME = 'subcategory-demo';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRememberMeAvailable, setIsRememberMeAvailable] = useState(true);
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [activeButton, setActiveButton] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let isMounted = true;

    async function checkDeviceSecurity() {
      try {
        const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
        const isDeviceSecured = enrolledLevel >= LocalAuthentication.SecurityLevel.SECRET;

        if (!isMounted) {
          return;
        }

        setIsRememberMeAvailable(isDeviceSecured);

        if (!isDeviceSecured) {
          setRememberMe(false);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setIsRememberMeAvailable(false);
        setRememberMe(false);
      }
    }

    checkDeviceSecurity();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkDeviceSecurity();
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, []);

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

  const handleRememberMePress = () => {
    if (!isRememberMeAvailable) {
      Alert.alert(
        'Beni Hatırla Kullanılamıyor',
        'Bu özelliği kullanabilmek için telefonunuzun kilit ekranına şifre koyun.',
      );
      return;
    }

    setRememberMe((prev) => !prev);
  };

  const handlePasswordVisibilityToggle = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const performLogin = async (
    nextUsername: string,
    nextPassword: string,
    nextRememberMe: boolean,
  ) => {
    setIsSubmitting(true);
    try {
      const session = await authService.login({
        username: nextUsername,
        password: nextPassword,
        rememberMe: nextRememberMe,
      });
      authStore.setSession(session, nextRememberMe);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giriş yapılamadı.';

      if (message.toLowerCase().includes('not fully set up')) {
        router.push({
          pathname: '/set-password',
          params: { email: nextUsername.trim() },
        });
        return;
      }

      Alert.alert('Giriş Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    await performLogin(username, password, rememberMe);
  };

  const handleDevQuickLogin = async () => {
    setUsername(DEV_USERNAME);
    setPassword(DEV_PASSWORD);
    await performLogin(DEV_USERNAME, DEV_PASSWORD, false);
  };

  const handleSubcategoryDemoLogin = () => {
    const mockSession: AuthSession = {
      accessToken: 'mock-subcategory-token',
      refreshToken: 'mock-subcategory-refresh-token',
      mode: 'mock',
      user: {
        id: 'subcategory-demo-user',
        fullName: 'Subcategory Demo',
        email: 'subcategory.demo@yasarbilgi.com.tr',
        company: 'Yaşar Bilgi',
        roles: ['bulk_approve'],
        username: SUBCATEGORY_DEMO_USERNAME,
      },
    };

    setUsername(SUBCATEGORY_DEMO_USERNAME);
    setPassword('');
    authStore.setSession(mockSession, false);
    router.replace('/(tabs)');
  };

  const handleTestNotification = async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Bildirim izni verilmedi.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: { title: 'Test Bildirimi', body: 'İlk bildirim hemen geldi!' },
      trigger: null,
    });

    await Notifications.scheduleNotificationAsync({
      content: { title: 'Test Bildirimi', body: '5 saniye sonraki bildirim!' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    });
  };

  const handleSetPasswordPreview = () => {
    router.push({
      pathname: '/set-password',
      params: { email: username.trim() || 'preview@example.com' },
    });
  };

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset({ email: forgotEmail });
      setIsForgotModalVisible(false);
      setForgotEmail('');
      Alert.alert('Bilgi', 'Şifre sıfırlama isteği gönderildi.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İşlem tamamlanamadı.';
      Alert.alert('Şifre Sıfırlama Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View
              style={[styles.logoContainer, isKeyboardVisible && styles.logoContainerKeyboardVisible]}
            >
              {!isKeyboardVisible && (
                <View style={styles.iconWrapper}>
                  <CustomFabIcon size={55} color={colors.primary} />
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
                  placeholder="Kullanıcı Adı"
                  placeholderTextColor={colors.textDisabled}
                  value={username}
                  onChangeText={(value) => setUsername(sanitizeUsernameInput(value))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Şifre"
                    placeholderTextColor={colors.textDisabled}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    style={styles.passwordToggleButton}
                    onPress={handlePasswordVisibilityToggle}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textSystemGray}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    !isRememberMeAvailable && styles.checkboxContainerDisabled,
                  ]}
                  onPress={handleRememberMePress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      !isRememberMeAvailable ? 'square' : rememberMe ? 'checkbox' : 'square-outline'
                    }
                    size={30}
                    color={!isRememberMeAvailable ? colors.textDisabled : rememberMe ? colors.primary : colors.textDisabled}
                  />
                  <Text
                    style={[
                      styles.rememberText,
                      !isRememberMeAvailable && styles.rememberTextDisabled,
                    ]}
                  >
                    Beni hatırla
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsForgotModalVisible(true)} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Şifremi unuttum</Text>
                </TouchableOpacity>
              </View>

              <Pressable
                style={[
                  styles.loginButton,
                  isDark && { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
                  { borderColor: isDark && activeButton === 'login' ? colors.primary : 'transparent' },
                ]}
                onPressIn={() => setActiveButton('login')}
                onPress={handleLogin}
              >
                <Text style={[styles.loginButtonText, isDark && { color: colors.primary }]}>Giriş</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.signupContainer,
                  { borderColor: isDark && activeButton === 'signup' ? colors.primary : 'transparent' },
                ]}
                onPressIn={() => setActiveButton('signup')}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.signupText}>Üye Ol</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.notificationTestButton}
            onPress={handleTestNotification}
            activeOpacity={0.8}
          >
            <Text style={styles.devLoginButtonText}>Bildirim Test</Text>
          </TouchableOpacity>
        )}

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <View style={styles.footerBrandRow}>
              <YasarBilgiLogo width={120} height={19} />
              {__DEV__ && (
                <>
                  <TouchableOpacity
                    style={styles.devLoginButton}
                    onPress={handleDevQuickLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.devLoginButtonText}>Dev Giriş</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.devLoginButton}
                    onPress={handleSubcategoryDemoLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.devLoginButtonText}>Sub Demo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.devLoginButton}
                    onPress={handleSetPasswordPreview}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.devLoginButtonText}>Set Password</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text style={[styles.footerText, { marginTop: 5 }]}>v1.0.0</Text>
          </View>
        )}

        <Modal animationType="fade" transparent visible={isForgotModalVisible}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>E-posta adresinizi girin</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="ornek@yasarbilgi.com.tr"
                placeholderTextColor={colors.textDisabled}
                value={forgotEmail}
                onChangeText={setForgotEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setIsForgotModalVisible(false);
                    setForgotEmail('');
                  }}
                >
                  <Text style={styles.buttonTextDefault}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleResetPassword}>
                  <Text style={styles.buttonTextBold}>Şifreyi Sıfırla</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <AppLoader visible={isSubmitting} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardContainer: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoContainerKeyboardVisible: { marginBottom: 28 },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: { fontSize: 28, fontWeight: 'bold', color: colors.primary, letterSpacing: 0.5 },
  appNameKeyboardVisible: { fontSize: 32 },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 15, justifyContent: 'center' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  passwordToggleButton: {
    width: 44,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxContainerDisabled: { opacity: 0.7 },
  rememberText: { marginLeft: 8, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  rememberTextDisabled: { color: colors.textDisabled },
  forgotText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  signupContainer: { alignItems: 'center', paddingVertical: 14, borderRadius: 25, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'transparent' },
  signupText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: { fontSize: 12, color: colors.textDisabled },
  notificationTestButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
    zIndex: 10,
  },
  devLoginButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
  },
  devLoginButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: { width: '92%', backgroundColor: colors.surface, borderRadius: 25, padding: 25, elevation: 5 },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textHeading,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    paddingTop: 15,
  },
  modalButton: { paddingHorizontal: 15, paddingVertical: 5 },
  buttonTextDefault: { color: colors.textPlaceholder, fontSize: 16, fontWeight: '500' },
  buttonTextBold: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
});
