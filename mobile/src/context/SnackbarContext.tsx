import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../theme';

/** Alt bilgi çubuğu: 4 saniye görünür (şartname bölüm 5.6). */
const DURATION_MS = 4000;
/** Alt gezinme barının üstünde kalsın diye */
const BOTTOM_OFFSET = 88;

interface SnackbarContextValue {
  showSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback((text: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {message ? (
        <View
          pointerEvents="none"
          style={[styles.container, { bottom: BOTTOM_OFFSET + insets.bottom }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.text}>{message}</Text>
        </View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const value = useContext(SnackbarContext);
  if (!value) {
    throw new Error('useSnackbar, SnackbarProvider içinde kullanılmalıdır.');
  }
  return value;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.snackbar,
    borderRadius: radius.field,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.onPrimary,
  },
});
