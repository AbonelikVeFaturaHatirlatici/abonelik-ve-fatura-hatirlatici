import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState, ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SegmentedControl } from '../components/SegmentedControl';
import { MessageBanner } from '../components/StateViews';
import { TextField } from '../components/TextField';
import { useData } from '../context/DataContext';
import { useSnackbar } from '../context/SnackbarContext';
import { isApiRequestError } from '../data/apiError';
import { colors, radius, spacing, TOUCH_TARGET } from '../theme';
import type { Period } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { today } from '../utils/clock';
import { strings } from '../utils/strings';
import {
  maskDateInput,
  parseAmountToKurus,
  parseDisplayDate,
  SERVICE_NAME_MAX_LENGTH,
  validateServiceName,
} from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddSubscription'>;

const PERIOD_OPTIONS = [
  { value: 'monthly', label: strings.period.monthly },
  { value: 'yearly', label: strings.period.yearly },
] as const;

interface FieldErrors {
  serviceName: string | null;
  amount: string | null;
  startDate: string | null;
}

const NO_ERRORS: FieldErrors = { serviceName: null, amount: null, startDate: null };

/** Ad sınıra yaklaşınca karakter sayacı gösterilir (şartname 5.4). */
const COUNTER_THRESHOLD = 80;

/** S4 · Abonelik Ekle (UC-03; akış F2). */
export function AddSubscriptionScreen({ navigation }: Props) {
  const { createSubscription } = useData();
  const { showSnackbar } = useSnackbar();
  const dateInput = useRef<ComponentRef<typeof TextInput>>(null)

  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Period>('monthly');
  const [startDate, setStartDate] = useState('');
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const name = validateServiceName(serviceName);
    const kurus = parseAmountToKurus(amount);
    const date = parseDisplayDate(startDate, today());

    setServerMessage(null);
    setErrors({
      serviceName: name.ok ? null : name.error,
      amount: kurus.ok ? null : kurus.error,
      startDate: date.ok ? null : date.error,
    });
    // Alan hatası varsa hiçbir istek gönderilmez.
    if (!name.ok || !kurus.ok || !date.ok) {
      return;
    }

    setSaving(true);
    try {
      // Para birimi ("TRY") yalnızca etikettir; istekte gönderilmez (UIR-08).
      await createSubscription({
        serviceName: name.value,
        amountKurus: kurus.value,
        period,
        startDate: date.value,
      });
      showSnackbar(strings.add.done);
      navigation.goBack();
    } catch (error) {
      // 400 ve 409: sunucu mesajı bantta gösterilir, girilen veri korunur.
      // 401: DataContext oturumu kapatır, S1 açılır.
      setServerMessage(isApiRequestError(error) ? error.message : strings.common.networkError);
      setSaving(false);
    }
  };

  const nameCounter =
    serviceName.length >= COUNTER_THRESHOLD
      ? `${serviceName.length} / ${SERVICE_NAME_MAX_LENGTH}`
      : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title={strings.add.title} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextField
            label={strings.add.serviceName}
            placeholder={strings.add.serviceNamePlaceholder}
            value={serviceName}
            onChangeText={setServiceName}
            maxLength={SERVICE_NAME_MAX_LENGTH + 20}
            autoCapitalize="words"
            editable={!saving}
            error={errors.serviceName}
            helper={nameCounter}
            returnKeyType="next"
          />

          <TextField
            label={strings.add.amount}
            placeholder={strings.add.amountPlaceholder}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!saving}
            error={errors.amount}
            helper={strings.add.amountHint}
            right={
              <View style={styles.currencyTag}>
                <Text style={styles.currencyText}>{strings.add.currency}</Text>
              </View>
            }
          />

          <View style={styles.periodBlock}>
            <Text style={styles.label}>{strings.add.period}</Text>
            <SegmentedControl
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
              disabled={saving}
            />
          </View>

          <TextField
            ref={dateInput}
            label={strings.add.startDate}
            placeholder={strings.add.startDatePlaceholder}
            value={startDate}
            onChangeText={(text: string) => setStartDate(maskDateInput(text))}
            keyboardType="number-pad"
            maxLength={10}
            editable={!saving}
            error={errors.startDate}
            helper={strings.add.startDateHint}
            right={
              <Pressable
                onPress={() => dateInput.current?.focus()}
                accessibilityRole="button"
                accessibilityLabel={strings.add.startDate}
                style={styles.calendarButton}
              >
                <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
              </Pressable>
            }
          />

          {serverMessage ? <MessageBanner message={serverMessage} /> : null}

          <View style={styles.spacer} />

          <AppButton label={strings.add.save} onPress={() => void save()} loading={saving} />
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  periodBlock: {
    marginBottom: spacing.lg,
  },
  currencyTag: {
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.field - 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  calendarButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.md,
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xxl,
  },
});
