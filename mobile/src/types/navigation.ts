import type { Uuid } from './api';

/** Kök yığın (stack). Ekran kimlikleri şartnamedeki S1–S5 ile eşleşir. */
export type RootStackParamList = {
  /** S1 Giriş / Kayıt */
  Auth: undefined;
  /** S2 Aboneliklerim ve S5 Hatırlatmalar (alt gezinme barlı ana ekran) */
  Main: undefined;
  /** S3 Abonelik Detayı */
  SubscriptionDetail: { id: Uuid };
  /** S4 Abonelik Ekle */
  AddSubscription: undefined;
};

/** Ana ekrandaki iki sekme (yalnızca S2 ve S5'te görünür). */
export type MainTab = 'subscriptions' | 'reminders';
