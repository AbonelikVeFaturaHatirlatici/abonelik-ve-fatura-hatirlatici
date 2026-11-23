import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';

type Variant = 'primary' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** `true`: tam genişlik (form butonları); `false`: içerik kadar (kart butonu) */
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Primary: dolu mavi (Giriş Yap, Kaydet). Danger: kırmızı çerçeveli (Takipten Çıkar).
 * İstek sürerken buton devre dışı kalır ve ilerleme göstergesi gösterir (S1, S4).
 */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  block = true,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        block ? styles.block : styles.inline,
        isPrimary ? styles.primary : styles.danger,
        pressed && !inactive ? (isPrimary ? styles.primaryPressed : styles.dangerPressed) : null,
        inactive ? styles.inactive : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.danger} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.dangerLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_TARGET,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  block: {
    alignSelf: 'stretch',
  },
  inline: {
    alignSelf: 'flex-end',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    opacity: 0.85,
  },
  danger: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  dangerPressed: {
    backgroundColor: colors.dangerSoft,
  },
  inactive: {
    opacity: 0.6,
  },
  label: {
    ...typography.body,
    fontWeight: '500',
  },
  primaryLabel: {
    color: colors.onPrimary,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
