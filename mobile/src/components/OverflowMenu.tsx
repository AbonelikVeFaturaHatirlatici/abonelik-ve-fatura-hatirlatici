import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';
import { strings } from '../utils/strings';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

/** Üst bardaki üç nokta menüsü: "Çıkış Yap" (akış F6). */
export function OverflowMenu({ visible, onClose, onLogout }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={strings.common.menu}>
        <View style={[styles.menu, { top: insets.top + spacing.xl + spacing.xl }]}>
          <Pressable
            onPress={() => {
              onClose();
              onLogout();
            }}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
          >
            <Text style={styles.itemLabel}>{strings.menu.logout}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: spacing.sm,
    minWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.field,
    paddingVertical: spacing.xs,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  itemLabel: {
    ...typography.body,
    color: colors.text,
  },
});
