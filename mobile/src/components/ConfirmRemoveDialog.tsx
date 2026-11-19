import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';
import { strings } from '../utils/strings';

interface Props {
  visible: boolean;
  /** İstek sürerken butonlar devre dışı kalır. */
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Takipten çıkarma onayı (D-03, UIR-03). Ayrı sayfa değil, ekranın üstünde açılan diyalog.
 * "Vazgeç" hiçbir istek göndermez.
 */
export function ConfirmRemoveDialog({ visible, loading = false, onCancel, onConfirm }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Android geri tuşu: istek sürerken diyalog kapanmaz.
      onRequestClose={loading ? () => undefined : onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityViewIsModal accessibilityRole="alert">
          <Text style={styles.title}>{strings.remove.dialogTitle}</Text>
          <Text style={styles.body}>{strings.remove.warning}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, pressed ? styles.actionPressed : null]}
            >
              <Text style={styles.cancelLabel}>{strings.remove.cancel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ busy: loading }}
              style={({ pressed }) => [
                styles.action,
                styles.confirm,
                pressed ? styles.confirmPressed : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.confirmLabel}>{strings.remove.button}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.card + 4,
    padding: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    minHeight: TOUCH_TARGET,
    minWidth: 96,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    backgroundColor: colors.background,
  },
  confirm: {
    backgroundColor: colors.danger,
  },
  confirmPressed: {
    opacity: 0.85,
  },
  cancelLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.primary,
  },
  confirmLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.onPrimary,
  },
});
