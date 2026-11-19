import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { IsoDate, ReminderSummary, Subscription } from '../types/api';
import {
  daysLeftLabel,
  formatDate,
  formatKurus,
  periodSuffix,
  reminderLine,
} from '../utils/format';
import { strings } from '../utils/strings';
import { AppButton } from './AppButton';
import { StatusBadge } from './StatusBadge';

interface Props {
  subscription: Subscription;
  today: IsoDate;
  onPress: () => void;
  onRemove: () => void;
}

/** "Son hatırlatma": remindOn değeri en geç olan hatırlatma (şartname 5.2). */
export function latestReminder(reminders: ReminderSummary[]): ReminderSummary | null {
  return reminders.reduce<ReminderSummary | null>(
    (latest, reminder) => (!latest || reminder.remindOn > latest.remindOn ? reminder : latest),
    null,
  );
}

export function SubscriptionCard({ subscription, today, onPress, onRemove }: Props) {
  const removed = subscription.status === 'cancelled';
  const last = latestReminder(subscription.reminders);
  const amount = `${formatKurus(subscription.amountKurus)} ${periodSuffix(subscription.period)}`;
  const reminderText = last
    ? strings.card.lastReminder(reminderLine(last.daysBefore, last.remindOn))
    : strings.card.noReminder;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subscription.serviceName}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, removed ? styles.mutedText : null]} numberOfLines={2}>
          {subscription.serviceName}
        </Text>
        <Text style={[styles.amount, removed ? styles.mutedText : null]}>{amount}</Text>
      </View>

      {removed ? (
        <View style={styles.badgeRow}>
          <StatusBadge label={strings.card.removedBadge} />
        </View>
      ) : (
        <Text style={styles.line}>
          {strings.card.nextRenewal(
            formatDate(subscription.nextRenewalDate),
            daysLeftLabel(subscription.nextRenewalDate, today),
          )}
        </Text>
      )}

      <Text style={[styles.line, removed ? styles.mutedText : null]}>{reminderText}</Text>

      {removed ? null : (
        <AppButton
          label={strings.remove.button}
          variant="danger"
          block={false}
          onPress={onRemove}
          style={styles.removeButton}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.body,
    flex: 1,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.md,
  },
  amount: {
    ...typography.body,
    color: colors.text,
  },
  badgeRow: {
    marginBottom: spacing.sm,
  },
  line: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mutedText: {
    color: colors.muted,
  },
  removeButton: {
    marginTop: spacing.sm,
  },
});
