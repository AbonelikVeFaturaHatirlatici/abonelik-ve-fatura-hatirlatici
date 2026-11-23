import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState, type ReactNode } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ConfirmRemoveDialog } from '../components/ConfirmRemoveDialog';
import { EmptyState, ErrorState, SkeletonList } from '../components/StateViews';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useData } from '../context/DataContext';
import { useSnackbar } from '../context/SnackbarContext';
import { isApiRequestError } from '../data/apiError';
import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';
import type { Subscription } from '../types/api';
import type { RootStackParamList } from '../types/navigation';
import { today } from '../utils/clock';
import { strings } from '../utils/strings';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** S2 · Aboneliklerim (UC-04, UC-06; akışlar F3, F4). Başlık ve alt bar MainTabs'tadır. */
export function SubscriptionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { subscriptions, status, isRefreshing, refresh, cancelSubscription } = useData();
  const { showSnackbar } = useSnackbar();
  const [removeTarget, setRemoveTarget] = useState<Subscription | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      void refresh();
    }
  }, [status, refresh]);

  const openAdd = () => navigation.navigate('AddSubscription');
  const openDetail = (id: string) => navigation.navigate('SubscriptionDetail', { id });

  const confirmRemove = async () => {
    if (!removeTarget) {
      return;
    }
    setRemoving(true);
    try {
      await cancelSubscription(removeTarget.id);
      showSnackbar(strings.remove.done);
    } catch (error) {
      // 409 ALREADY_CANCELLED veya 404: mesaj gösterilir, liste tazelenir (akış F4).
      showSnackbar(isApiRequestError(error) ? error.message : strings.common.networkError);
      void refresh();
    } finally {
      setRemoving(false);
      setRemoveTarget(null);
    }
  };

  const currentDay = today();

  let content: ReactNode;
  if (status === 'idle' || status === 'loading') {
    content = (
      <View style={styles.listContent}>
        <SkeletonList />
      </View>
    );
  } else if (status === 'error') {
    content = <ErrorState message={strings.list.error} onRetry={() => void refresh()} />;
  } else if (subscriptions.length === 0) {
    content = (
      <EmptyState
        icon="albums-outline"
        message={strings.list.empty}
        actionLabel={strings.list.emptyAction}
        onAction={openAdd}
      />
    );
  } else {
    content = (
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, styles.listWithFab]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            today={currentDay}
            onPress={() => openDetail(item.id)}
            onRemove={() => setRemoveTarget(item)}
          />
        )}
      />
    );
  }

  const showFab = status === 'ready' && subscriptions.length > 0;

  return (
    <View style={styles.container}>
      {content}

      {showFab ? (
        <Pressable
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={strings.list.add}
          style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
        >
          <Ionicons name="add" size={22} color={colors.onPrimary} />
          <Text style={styles.fabLabel}>{strings.list.add}</Text>
        </Pressable>
      ) : null}

      <ConfirmRemoveDialog
        visible={removeTarget !== null}
        loading={removing}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemove()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  listWithFab: {
    paddingBottom: 96,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: TOUCH_TARGET + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card + 4,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.onPrimary,
  },
});
