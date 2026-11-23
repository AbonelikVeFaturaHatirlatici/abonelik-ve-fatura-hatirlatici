import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import { strings } from '../utils/strings';
import { AppButton } from './AppButton';

/** Yükleniyor durumu: üç iskelet kart (şartname 5.2). */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View accessibilityLabel={strings.common.loading} accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={[styles.skeletonLine, styles.skeletonTitle]} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, styles.skeletonShort]} />
        </View>
      ))}
    </View>
  );
}

interface EmptyProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.center}>
      <View style={styles.illustration}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.danger} />
      <Text style={styles.message}>{message}</Text>
      <AppButton label={strings.common.retry} onPress={onRetry} style={styles.action} />
    </View>
  );
}

/** Sunucu veya istemci mesajı şeridi (S1 mesaj alanı, S4 hata bandı). */
export function MessageBanner({ message, tone = 'error' }: { message: string; tone?: 'error' | 'info' }) {
  const isError = tone === 'error';
  return (
    <View
      style={[styles.banner, isError ? styles.bannerError : styles.bannerInfo]}
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'information-circle-outline'}
        size={20}
        color={isError ? colors.danger : colors.textSecondary}
      />
      <Text style={[styles.bannerText, isError ? styles.bannerTextError : null]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neutralSoft,
    marginBottom: spacing.sm,
  },
  skeletonTitle: {
    width: '45%',
    height: 16,
  },
  skeletonShort: {
    width: '60%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  illustration: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.field,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerError: {
    backgroundColor: colors.dangerSoft,
  },
  bannerInfo: {
    backgroundColor: colors.neutralSoft,
  },
  bannerText: {
    ...typography.caption,
    flex: 1,
    color: colors.textSecondary,
  },
  bannerTextError: {
    color: colors.danger,
  },
});
