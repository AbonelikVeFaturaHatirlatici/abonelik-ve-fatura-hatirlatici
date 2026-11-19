import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState, ErrorState, SkeletonList } from '../components/StateViews';
import { ReminderStatusBadge } from '../components/StatusBadge';
import { useData } from '../context/DataContext';
import { colors, radius, spacing, typography } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { formatDate, reminderLine } from '../utils/format';
import { strings } from '../utils/strings';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * S5 · Hatırlatmalar (UC-08): salt okunur düz liste. Sıra API'den geldiği gibidir
 * (remindOn azalan, sonra daysBefore artan); istemci sıralamaz veya süzmez.
 */
export function RemindersScreen() {
  const navigation = useNavigation<Navigation>();
  const { reminders, subscriptions, status, isRefreshing, refresh } = useData();

  useEffect(() => {
    if (status === 'idle') {
      void refresh();
    }
  }, [status, refresh]);

  // listReminders servis adını döndürmez; ad elimizdeki abonelik listesinden çözülür (şartname 5.5).
  const serviceNames = useMemo(
    () => new Map(subscriptions.map((subscription) => [subscription.id, subscription.serviceName])),
    [subscriptions],
  );

  if (status === 'idle' || status === 'loading') {
    return (
      <View style={styles.listContent}>
        <SkeletonList />
      </View>
    );
  }
  if (status === 'error') {
    return <ErrorState message={strings.reminders.error} onRetry={() => void refresh()} />;
  }
  if (reminders.length === 0) {
    return <EmptyState icon="notifications-off-outline" message={strings.reminders.empty} />;
  }

  return (
    <FlatList
      data={reminders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          colors={[colors.primary]}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('SubscriptionDetail', { id: item.subscriptionId })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.entry, pressed ? styles.entryPressed : null]}
        >
          <View style={styles.entryText}>
            <Text style={styles.name} numberOfLines={1}>
              {serviceNames.get(item.subscriptionId) ?? strings.reminders.unknownSubscription}
            </Text>
            <Text style={styles.line}>{reminderLine(item.daysBefore, item.remindOn)}</Text>
            <Text style={styles.secondary}>
              {strings.reminders.renewal(formatDate(item.renewalDate))}
            </Text>
          </View>
          <ReminderStatusBadge status={item.status} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  entryPressed: {
    backgroundColor: colors.background,
  },
  entryText: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  line: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  secondary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
