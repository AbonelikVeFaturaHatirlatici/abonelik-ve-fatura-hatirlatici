/**
 * Bellek içi mock sunucu: `ApiClient` arayüzünü sözleşmedeki davranışla uygular.
 * Gerçek ağ çağrısı yapmaz. `EXPO_PUBLIC_USE_MOCK_API=true` ile seçilir (src/data/api.ts);
 * varsayılan istemci src/api/httpApi.ts'tir. Token, HTTP istemcisindeki gibi
 * `getAccessToken` ile token deposundan okunur.
 *
 * Sözleşme davranışları: başkasına ait kayıt → 404, harf duyarsız tekrar → 409,
 * iptal edilmiş kayıt yeniden eklenebilir, liste en yeni önce, hatırlatmalar
 * remindOn azalan + daysBefore artan sırada (FR-13).
 */
import { addDays, nextRenewal } from '../domain/renewal';
import type {
  ApiClient,
  ApiErrorBody,
  Credentials,
  Reminder,
  ReminderSummary,
  Subscription,
  SubscriptionCreate,
  Token,
  User,
  Uuid,
} from '../types/api';
import { nowUtc, today } from '../utils/clock';
import { serverErrors } from '../utils/strings';
import {
  AMOUNT_KURUS_MAX,
  EMAIL_MAX_LENGTH,
  MAX_FUTURE_DAYS,
  MIN_START_DATE,
  PASSWORD_MIN_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
} from '../utils/validation';
import { ApiRequestError } from './apiError';
import {
  seedReminders,
  seedSubscriptions,
  seedUsers,
  type StoredSubscription,
  type StoredUser,
} from './mockData';

const LATENCY_MS = 400;
const TOKEN_PREFIX = 'mock.';

const db = {
  users: seedUsers.map((user) => ({ ...user })),
  subscriptions: seedSubscriptions.map((subscription) => ({ ...subscription })),
  reminders: seedReminders.map((reminder) => ({ ...reminder })),
};

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function fail(status: number, body: ApiErrorBody): never {
  throw new ApiRequestError(status, body);
}

function badRequest(message: string): never {
  return fail(400, serverErrors.validation(message));
}

function newUuid(): Uuid {
  const hex = '0123456789abcdef';
  let digits = '';
  for (let i = 0; i < 32; i += 1) {
    digits += hex[Math.floor(Math.random() * 16)];
  }
  return [
    digits.slice(0, 8),
    digits.slice(8, 12),
    `4${digits.slice(13, 16)}`,
    `a${digits.slice(17, 20)}`,
    digits.slice(20, 32),
  ].join('-');
}

function authenticate(token: string): StoredUser {
  const userId = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : '';
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) {
    return fail(401, serverErrors.unauthorized);
  }
  return user;
}

function validateCredentials(body: Credentials): string {
  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > EMAIL_MAX_LENGTH) {
    badRequest('Geçerli bir e-posta adresi girin.');
  }
  if (body.password.length < PASSWORD_MIN_LENGTH) {
    badRequest('Şifre en az 8 karakter olmalıdır.');
  }
  return email;
}

function toSummary(reminder: Reminder): ReminderSummary {
  return { daysBefore: reminder.daysBefore, remindOn: reminder.remindOn, status: reminder.status };
}

function toSubscription(stored: StoredSubscription): Subscription {
  const reminders = db.reminders
    .filter((reminder) => reminder.subscriptionId === stored.id)
    .sort((a, b) => a.remindOn.localeCompare(b.remindOn))
    .map(toSummary);
  return {
    id: stored.id,
    serviceName: stored.serviceName,
    amountKurus: stored.amountKurus,
    currency: 'TRY',
    period: stored.period,
    startDate: stored.startDate,
    nextRenewalDate: nextRenewal(stored.startDate, stored.period, today()),
    status: stored.status,
    reminders,
    createdAt: stored.createdAt,
    cancelledAt: stored.cancelledAt,
  };
}

function findOwned(user: StoredUser, id: Uuid): StoredSubscription {
  const stored = db.subscriptions.find(
    (subscription) => subscription.id === id && subscription.userId === user.id,
  );
  if (!stored) {
    return fail(404, serverErrors.notFound);
  }
  return stored;
}

function validateCreate(body: SubscriptionCreate): SubscriptionCreate {
  const serviceName = body.serviceName.trim();
  if (serviceName.length === 0) {
    badRequest('serviceName boş olamaz.');
  }
  if (serviceName.length > SERVICE_NAME_MAX_LENGTH) {
    badRequest(`serviceName en fazla ${SERVICE_NAME_MAX_LENGTH} karakter olabilir.`);
  }
  if (!Number.isInteger(body.amountKurus) || body.amountKurus <= 0) {
    badRequest('amountKurus sıfırdan büyük olmalıdır.');
  }
  if (body.amountKurus > AMOUNT_KURUS_MAX) {
    badRequest(`amountKurus en fazla ${AMOUNT_KURUS_MAX} olabilir.`);
  }
  if (body.period !== 'monthly' && body.period !== 'yearly') {
    badRequest('period yalnızca monthly veya yearly olabilir.');
  }
  const latest = addDays(today(), MAX_FUTURE_DAYS);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.startDate) || body.startDate < MIN_START_DATE || body.startDate > latest) {
    badRequest('startDate 2000-01-01 ile bugünden 366 gün sonrası arasında olmalıdır.');
  }
  return { ...body, serviceName };
}

export function createMockApi(getAccessToken: () => string | null): ApiClient {
  const currentUser = (): StoredUser => authenticate(getAccessToken() ?? '');

  return {
    async registerUser(body: Credentials): Promise<User> {
      await delay();
      const email = validateCredentials(body);
      if (db.users.some((user) => user.email === email)) {
        fail(409, serverErrors.emailAlreadyRegistered);
      }
      const user: StoredUser = {
        id: newUuid(),
        email,
        password: body.password,
        createdAt: nowUtc(),
      };
      db.users.push(user);
      return { id: user.id, email: user.email, createdAt: user.createdAt };
    },

    async login(body: Credentials): Promise<Token> {
      await delay();
      const email = validateCredentials(body);
      const user = db.users.find((candidate) => candidate.email === email);
      // Bilinmeyen e-posta ve yanlış şifre aynı mesajı alır (BR-11).
      if (!user || user.password !== body.password) {
        fail(401, serverErrors.invalidCredentials);
      }
      return { accessToken: `${TOKEN_PREFIX}${user.id}`, tokenType: 'bearer' };
    },

    async createSubscription(body: SubscriptionCreate): Promise<Subscription> {
      await delay();
      const user = currentUser();
      const data = validateCreate(body);
      const duplicate = db.subscriptions.some(
        (subscription) =>
          subscription.userId === user.id &&
          subscription.status === 'active' &&
          subscription.period === data.period &&
          subscription.serviceName.toLowerCase() === data.serviceName.toLowerCase(),
      );
      if (duplicate) {
        fail(409, serverErrors.subscriptionAlreadyActive);
      }
      // Hatırlatmaları günlük iş üretir (UC-07); yeni abonelik boş listeyle döner.
      const stored: StoredSubscription = {
        id: newUuid(),
        userId: user.id,
        serviceName: data.serviceName,
        amountKurus: data.amountKurus,
        period: data.period,
        startDate: data.startDate,
        status: 'active',
        createdAt: nowUtc(),
        cancelledAt: null,
      };
      db.subscriptions.push(stored);
      return toSubscription(stored);
    },

    async listSubscriptions(): Promise<Subscription[]> {
      await delay();
      const user = currentUser();
      return db.subscriptions
        .filter((subscription) => subscription.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toSubscription);
    },

    async getSubscription(id: Uuid): Promise<Subscription> {
      await delay();
      const user = currentUser();
      return toSubscription(findOwned(user, id));
    },

    async cancelSubscription(id: Uuid): Promise<Subscription> {
      await delay();
      const user = currentUser();
      const stored = findOwned(user, id);
      if (stored.status === 'cancelled') {
        fail(409, serverErrors.alreadyCancelled);
      }
      stored.status = 'cancelled';
      stored.cancelledAt = nowUtc();
      return toSubscription(stored);
    },

    async listReminders(): Promise<Reminder[]> {
      await delay();
      const user = currentUser();
      const ownIds = new Set(
        db.subscriptions
          .filter((subscription) => subscription.userId === user.id)
          .map((subscription) => subscription.id),
      );
      return db.reminders
        .filter((reminder) => ownIds.has(reminder.subscriptionId))
        .sort((a, b) => b.remindOn.localeCompare(a.remindOn) || a.daysBefore - b.daysBefore)
        .map((reminder) => ({ ...reminder }));
    },
  };
}
