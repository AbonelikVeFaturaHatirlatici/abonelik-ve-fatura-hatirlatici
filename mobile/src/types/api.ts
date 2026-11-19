/**
 * api/openapi.yaml şemalarının birebir TypeScript karşılıkları.
 * Alan adları ve tipler sözleşmeyle aynıdır; S2-06'da gerçek API istemcisi aynı tipleri kullanır.
 */

/** `format: uuid` */
export type Uuid = string;
/** `format: date` — saatsiz `YYYY-MM-DD`, Europe/Istanbul takvimi */
export type IsoDate = string;
/** `format: date-time` — UTC zaman damgası */
export type IsoDateTime = string;

/** components.schemas.Error */
export interface ApiErrorBody {
  code: string;
  message: string;
}

/** components.schemas.Credentials */
export interface Credentials {
  email: string;
  password: string;
}

/** components.schemas.User */
export interface User {
  id: Uuid;
  email: string;
  createdAt: IsoDateTime;
}

/** components.schemas.Token */
export interface Token {
  accessToken: string;
  tokenType: 'bearer';
}

/** components.schemas.Period */
export type Period = 'monthly' | 'yearly';

/** components.schemas.SubscriptionCreate */
export interface SubscriptionCreate {
  serviceName: string;
  /** Kuruş cinsinden tamsayı (229,99 TL = 22999) */
  amountKurus: number;
  period: Period;
  startDate: IsoDate;
}

export type SubscriptionStatus = 'active' | 'cancelled';

/** components.schemas.ReminderStatus */
export type ReminderStatus = 'created' | 'sent_mock';

export type DaysBefore = 3 | 1;

/** components.schemas.ReminderSummary */
export interface ReminderSummary {
  daysBefore: DaysBefore;
  remindOn: IsoDate;
  status: ReminderStatus;
}

/** components.schemas.Subscription */
export interface Subscription {
  id: Uuid;
  serviceName: string;
  amountKurus: number;
  currency: 'TRY';
  period: Period;
  startDate: IsoDate;
  nextRenewalDate: IsoDate;
  status: SubscriptionStatus;
  reminders: ReminderSummary[];
  createdAt: IsoDateTime;
  cancelledAt?: IsoDateTime | null;
}

/** components.schemas.Reminder */
export interface Reminder {
  id: Uuid;
  subscriptionId: Uuid;
  renewalDate: IsoDate;
  daysBefore: DaysBefore;
  remindOn: IsoDate;
  status: ReminderStatus;
  createdAt: IsoDateTime;
}

/**
 * Sözleşmedeki 7 işlemin istemci arayüzü (operationId adlarıyla).
 * S2-05'te `data/mockApi.ts` uygular; S2-06'da HTTP istemcisi aynı arayüzü uygular.
 * Hatalar `ApiRequestError` (data/apiError.ts) olarak fırlatılır.
 */
export interface ApiClient {
  registerUser(body: Credentials): Promise<User>;
  login(body: Credentials): Promise<Token>;
  createSubscription(token: string, body: SubscriptionCreate): Promise<Subscription>;
  listSubscriptions(token: string): Promise<Subscription[]>;
  getSubscription(token: string, id: Uuid): Promise<Subscription>;
  cancelSubscription(token: string, id: Uuid): Promise<Subscription>;
  listReminders(token: string): Promise<Reminder[]>;
}
