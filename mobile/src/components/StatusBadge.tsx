import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { ReminderStatus } from '../types/api';
import { strings } from '../utils/strings';

type Tone = 'success' | 'neutral';

interface Props {
  label: string;
  tone?: Tone;
}

export function StatusBadge({ label, tone = 'neutral' }: Props) {
  return (
    <View style={[styles.badge, tone === 'success' ? styles.success : styles.neutral]}>
      <Text style={[styles.text, tone === 'success' ? styles.successText : styles.neutralText]}>
        {label}
      </Text>
    </View>
  );
}

/** sent_mock → yeşil "Hatırlatıldı", created → gri "Bekliyor" (S3, S5) */
export function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
  return status === 'sent_mock' ? (
    <StatusBadge label={strings.reminder.sentMock} tone="success" />
  ) : (
    <StatusBadge label={strings.reminder.created} />
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  neutral: {
    backgroundColor: colors.neutralSoft,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  successText: {
    color: colors.success,
  },
  neutralText: {
    color: colors.textSecondary,
  },
});
