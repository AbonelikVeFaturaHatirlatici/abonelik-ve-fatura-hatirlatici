import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, TOUCH_TARGET } from '../theme';
import type { MainTab } from '../types/navigation';
import { strings } from '../utils/strings';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ITEMS: readonly { tab: MainTab; label: string; icon: IconName; activeIcon: IconName }[] = [
  { tab: 'subscriptions', label: strings.nav.subscriptions, icon: 'menu', activeIcon: 'menu' },
  {
    tab: 'reminders',
    label: strings.nav.reminders,
    icon: 'notifications-outline',
    activeIcon: 'notifications',
  },
];

interface Props {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

/** Yalnızca S2 ve S5'te görünen iki sekmeli alt gezinme. */
export function BottomNav({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      accessibilityRole="tablist"
    >
      {ITEMS.map((item) => {
        const selected = item.tab === active;
        return (
          <Pressable
            key={item.tab}
            onPress={() => onChange(item.tab)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            style={styles.item}
          >
            <View style={[styles.indicator, selected ? styles.indicatorActive : null]}>
              <Ionicons
                name={selected ? item.activeIcon : item.icon}
                size={22}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.label, selected ? styles.labelActive : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 60,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  indicatorActive: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.text,
    fontWeight: '500',
  },
});
