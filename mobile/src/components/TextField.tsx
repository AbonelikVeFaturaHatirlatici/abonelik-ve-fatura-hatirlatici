import type { ComponentRef, ReactNode, Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, TOUCH_TARGET, typography } from '../theme';

interface Props extends Omit<TextInputProps, 'style'> {
  /** React 19: `ref` sıradan bir prop olarak iletilir. */
  ref?: Ref<ComponentRef<typeof TextInput>>;
  label: string;
  /** Alanın altındaki kırmızı doğrulama mesajı */
  error?: string | null;
  /** Hata yokken gösterilen gri yardımcı metin */
  helper?: string;
  /** Kutunun sağ içindeki öğe (göz ikonu, TRY etiketi, takvim ikonu) */
  right?: ReactNode;
}

export function TextField({
  ref,
  label,
  error,
  helper,
  right,
  editable = true,
  ...inputProps
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          error ? styles.boxError : null,
          editable ? null : styles.boxDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          editable={editable}
          style={styles.input}
          {...inputProps}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  box: {
    minHeight: TOUCH_TARGET + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.field,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  boxError: {
    borderColor: colors.danger,
  },
  boxDisabled: {
    backgroundColor: colors.background,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  right: {
    marginLeft: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helper: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
