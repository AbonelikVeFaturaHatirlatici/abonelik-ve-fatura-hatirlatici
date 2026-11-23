import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../components/AppButton';
import { ConfirmRemoveDialog } from '../components/ConfirmRemoveDialog';
import { ScreenHeader } from '../components/ScreenHeader';
import { ErrorState } from '../components/StateViews';
import { ReminderStatusBadge } from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import { useSnackbar } from '../context/SnackbarContext';
import { isApiRequestError } from '../data/apiError';
import { colors, radius, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { today } from '../utils/clock';
import {
  formatDate,
  formatKurus,
  periodLabel,
  reminderLine,
  renewalWithDaysLeft,
} from '../utils/format';
import { strings } from '../utils/strings';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionDetail'>;

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

/** S3 · Abonelik Detayı (UC-05, UC-06). Veri listeden gelir, getSubscription ile tazelenir. */
export function SubscriptionDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const { subscriptions, loadSubscription, cancelSubscription } = useData();
  const { showSnackbar } = useSnackbar();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const subscription = subscriptions.find((item) => item.id === id);

  useEffect(() => {
    let mounted = true;
    setLoadFailed(false);
    loadSubscription(id).catch((error: unknown) => {
      if (!mounted) {
        return;
      }
      if (isApiRequestError(error) && error.status === 404) {
        // Başkasına ait veya olmayan kayıt (akış F3): mesaj + S2'ye dönüş.
        showSnackbar(strings.notFound);
        navigation.goBack();
        return;
      }
      setLoadFailed(true);
    });
    return () => {
      mounted = false;
    };
  }, [id, attempt, loadSubscription, navigation, showSnackbar]);

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await cancelSubscription(id);
      setDialogVisible(false);
      showSnackbar(strings.remove.done);
      navigation.goBack();
    } catch (error) {
      setDialogVisible(false);
      showSnackbar(isApiRequestError(error) ? error.message : strings.common.networkError);
      void loadSubscription(id).catch(() => undefined);
    } finally {
      setRemoving(false);
    }
  };

  const goBack = () => navigation.goBack();

  if (!subscription) {
    // Liste henüz yüklenmediyse kayıt getSubscription ile gelir; gelmezse tekrar denenir.
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader title={strings.detail.title} onBack={goBack} />
        {loadFailed ? (
          <ErrorState
            message={strings.common.networkError}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const active = subscription.status === 'active';
  const reminders = [...subscription.reminders].sort((a, b) =>
    a.remindOn.localeCompare(b.remindOn),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title={subscription.serviceName} onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Row label={strings.detail.amount} value={formatKurus(subscription.amountKurus)} />
          <Row label={strings.detail.period} value={periodLabel(subscription.period)} />
          <Row label={strings.detail.firstPayment} value={formatDate(subscription.startDate)} />
          {active ? (
            <Row
              label={strings.detail.nextRenewal}
              value={renewalWithDaysLeft(subscription.nextRenewalDate, today())}
            />
          ) : null}
          <Row
            label={strings.detail.status}
            value={active ? strings.status.active : strings.status.cancelled}
            valueColor={active ? colors.success : colors.muted}
          />
        </View>

        <Text style={styles.sectionTitle} accessibilityRole="header">
          {strings.detail.reminders}
        </Text>
        <View style={styles.card}>
          {reminders.length === 0 ? (
            <Text style={styles.emptyReminders}>{strings.detail.noReminders}</Text>
          ) : (
            reminders.map((reminder) => (
              <View key={`${reminder.remindOn}-${reminder.daysBefore}`} style={styles.reminderRow}>
                <Text style={styles.reminderText}>
                  {reminderLine(reminder.daysBefore, reminder.remindOn)}
                </Text>
                <ReminderStatusBadge status={reminder.status} />
              </View>
            ))
          )}
        </View>

        {active ? (
          <View style={styles.removeArea}>
            <AppButton
              label={strings.remove.button}
              variant="danger"
              onPress={() => setDialogVisible(true)}
            />
            <Text style={styles.warning}>{strings.remove.warning}</Text>
          </View>
        ) : null}
      </ScrollView>

      <ConfirmRemoveDialog
        visible={dialogVisible}
        loading={removing}
        onCancel={() => setDialogVisible(false)}
        onConfirm={() => void confirmRemove()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    ...typography.title,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  reminderRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  reminderText: {
    ...typography.body,
    color: colors.text,
    flexShrink: 1,
  },
  emptyReminders: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
  removeArea: {
    alignItems: 'stretch',
  },
  warning: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
