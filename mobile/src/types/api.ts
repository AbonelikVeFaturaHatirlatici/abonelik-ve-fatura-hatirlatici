/**
 * API tipleri: api/openapi.yaml'dan `npm run generate:api` ile üretilen
 * src/api/schema.d.ts'ten türetilir. Burada alan elle tanımlanmaz; sözleşme
 * değişirse tipler yeniden üretilir ve uyumsuz kod `npm run typecheck`'te yakalanır.
 *
 * Ekranlar ve context'ler bu adları kullanır (S2-05 ile aynı adlar).
 */
import type { components } from '../api/schema';

type Schemas = components['schemas'];

/** `format: uuid` */
export type Uuid = string;
/** `format: date` — saatsiz `YYYY-MM-DD`, Europe/Istanbul takvimi */
export type IsoDate = string;
/** `format: date-time` — UTC zaman damgası */
export type IsoDateTime = string;

export type ApiErrorBody = Schemas['Error'];
export type Credentials = Schemas['Credentials'];
export type User = Schemas['User'];
export type Token = Schemas['Token'];
export type Period = Schemas['Period'];
export type SubscriptionCreate = Schemas['SubscriptionCreate'];
export type Subscription = Schemas['Subscription'];
export type SubscriptionStatus = Subscription['status'];
export type ReminderSummary = Schemas['ReminderSummary'];
export type ReminderStatus = Schemas['ReminderStatus'];
export type Reminder = Schemas['Reminder'];
export type DaysBefore = Reminder['daysBefore'];

/**
 * Sözleşmedeki 7 işlemin istemci arayüzü (operationId adlarıyla).
 *
 * Erişim token'ı parametre olarak geçilmez: korumalı uçlarda istemci onu
 * token deposundan (src/auth/tokenStorage.ts) kendisi okuyup ekler.
 * Uygulamalar: src/api/httpApi.ts (gerçek API / Prism) ve src/data/mockApi.ts.
 * Hatalar `ApiRequestError` ({code, message}) veya `ApiNetworkError` olarak fırlatılır
 * (src/data/apiError.ts).
 */
export interface ApiClient {
  registerUser(body: Credentials): Promise<User>;
  login(body: Credentials): Promise<Token>;
  createSubscription(body: SubscriptionCreate): Promise<Subscription>;
  listSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: Uuid): Promise<Subscription>;
  cancelSubscription(id: Uuid): Promise<Subscription>;
  listReminders(): Promise<Reminder[]>;
}
