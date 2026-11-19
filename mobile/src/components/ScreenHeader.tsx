import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, TOUCH_TARGET, typography } from '../theme';
import { strings } from '../utils/strings';

interface Props {
  title: string;
  /** Verilirse solda geri oku gösterilir (S3, S4). */
  onBack?: () => void;
  /** Verilirse sağda üç nokta menüsü gösterilir (S2, S5). */
  onMenu?: () => void;
}

export function ScreenHeader({ title, onBack, onMenu }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={strings.common.back}
          hitSlop={4}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <Text
        style={[styles.title, onBack ? styles.titleWithBack : null]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {onMenu ? (
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel={strings.common.menu}
          hitSlop={4}
          style={styles.iconButton}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    flex: 1,
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
  titleWithBack: {
    paddingHorizontal: spacing.xs,
  },
});
