import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { MessageBanner } from '../components/StateViews';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { isApiRequestError } from '../data/apiError';
import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';
import { strings } from '../utils/strings';
import { validateEmail, validatePassword } from '../utils/validation';

type Mode = 'login' | 'register';

const MODE_OPTIONS = [
  { value: 'login', label: strings.auth.tabLogin },
  { value: 'register', label: strings.auth.tabRegister },
] as const;

interface FieldErrors {
  email: string | null;
  password: string | null;
}

interface ServerMessage {
  code: string;
  message: string;
}

const NO_FIELD_ERRORS: FieldErrors = { email: null, password: null };

/** S1 · Giriş / Kayıt (UC-01, UC-02; akış F1). */
export function AuthScreen() {
  const { signIn, register, sessionMessage, clearSessionMessage } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_FIELD_ERRORS);
  const [serverMessage, setServerMessage] = useState<ServerMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';
  const submitLabel = isRegister ? strings.auth.tabRegister : strings.auth.tabLogin;

  /** Mod değişince yazılan e-posta korunur, mesajlar temizlenir (şartname 5.1). */
  const changeMode = (next: Mode) => {
    setMode(next);
    setFieldErrors(NO_FIELD_ERRORS);
    setServerMessage(null);
    clearSessionMessage();
  };

  const submit = async () => {
    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setServerMessage(null);
    clearSessionMessage();
    if (errors.email || errors.password) {
      return;
    }

    const credentials = { email: email.trim(), password };
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(credentials);
      } else {
        await signIn(credentials);
      }
      // Başarılı olunca kök navigasyon S2'ye geçer; bu ekran kapanır.
    } catch (error) {
      setServerMessage(
        isApiRequestError(error)
          ? { code: error.code, message: error.message }
          : { code: 'NETWORK_ERROR', message: strings.common.networkError },
      );
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo} accessibilityElementsHidden importantForAccessibility="no">
              <Text style={styles.logoText}>₺</Text>
            </View>
            <Text style={styles.appTitle} accessibilityRole="header">
              {strings.app.title}
            </Text>
          </View>

          <SegmentedControl
            options={MODE_OPTIONS}
            value={mode}
            onChange={changeMode}
            disabled={submitting}
          />

          <View style={styles.form}>
            <TextField
              label={strings.auth.email}
              placeholder={strings.auth.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!submitting}
              error={fieldErrors.email}
            />
            <TextField
              label={strings.auth.password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              editable={!submitting}
              error={fieldErrors.password}
              helper={isRegister ? strings.auth.passwordHelper : undefined}
              onSubmitEditing={submit}
              right={
                <Pressable
                  onPress={() => setShowPassword((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? strings.auth.hidePassword : strings.auth.showPassword
                  }
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.textSecondary}
                  />
                </Pressable>
              }
            />

            {sessionMessage ? <MessageBanner message={sessionMessage} tone="info" /> : null}
            {serverMessage ? <MessageBanner message={serverMessage.message} /> : null}
            {serverMessage?.code === 'EMAIL_ALREADY_REGISTERED' ? (
              <Pressable
                onPress={() => changeMode('login')}
                accessibilityRole="link"
                style={styles.linkButton}
              >
                <Text style={styles.link}>{strings.auth.goToLogin}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.spacer} />

          <AppButton label={submitLabel} onPress={submit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + spacing.xs,
    paddingTop: spacing.xxl + spacing.xl,
    paddingBottom: spacing.xxl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: radius.card + 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '400',
    color: colors.text,
  },
  form: {
    marginTop: spacing.lg,
  },
  eyeButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.md,
  },
  linkButton: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxl,
  },
});
