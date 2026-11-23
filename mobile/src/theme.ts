/**
 * Tasarım belirteçleri (design tokens): şartname bölüm 7.2.
 * Dokunma hedefleri en az 48 dp, metin kontrastı en az 4,5:1 (NFR-U3).
 */
export const colors = {
  primary: '#3B5BDB',
  primarySoft: '#DBE4FF',
  onPrimary: '#FFFFFF',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212529',
  textSecondary: '#495057',
  placeholder: '#6C757D',
  border: '#ADB5BD',
  divider: '#E9ECEF',
  danger: '#C92A2A',
  dangerSoft: '#FFF5F5',
  success: '#2B8A3E',
  successSoft: '#EBFBEE',
  muted: '#868E96',
  neutralSoft: '#E9ECEF',
  overlay: 'rgba(33, 37, 41, 0.45)',
  snackbar: '#343A40',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  field: 8,
  card: 12,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 20, fontWeight: '500' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
} as const;

export const TOUCH_TARGET = 48;
