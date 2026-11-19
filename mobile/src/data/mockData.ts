/**
 * Mock başlangıç verisi: Figma kareleriyle aynı üç abonelik (mock bugün: 27.02.2026).
 *
 * Bu dosya mock SUNUCUNUN veritabanını temsil eder; `nextRenewalDate` ve `reminders`
 * özetleri burada tutulmaz, gerçek sunucudaki gibi mockApi.ts tarafından üretilir.
 * Şifre yalnızca mock içindir; gerçek sunucu şifreyi argon2 özeti olarak saklar.
 */
import type { IsoDateTime, Period, Reminder, SubscriptionStatus, Uuid } from '../types/api';

export interface StoredUser {
  id: Uuid;
  email: string;
  password: string;
  createdAt: IsoDateTime;
}

export interface StoredSubscription {
  id: Uuid;
  userId: Uuid;
  serviceName: string;
  amountKurus: number;
  period: Period;
  startDate: string;
  status: SubscriptionStatus;
  createdAt: IsoDateTime;
  cancelledAt: IsoDateTime | null;
}

export const DEMO_USER_ID = '6f1c2a54-3b8e-4d27-9a61-0e5b7c9d4f12';
const NETFLIX_ID = 'b2e4c6a8-1d3f-4b5a-8c7e-9f0a1b2c3d4e';
const YOUTUBE_ID = 'c3f5d7b9-2e4a-4c6b-9d8f-0a1b2c3d4e5f';
const SPOTIFY_ID = 'd4a6e8c0-3f5b-4d7c-8e9a-1b2c3d4e5f60';

export const seedUsers: StoredUser[] = [
  {
    id: DEMO_USER_ID,
    email: 'ayse@example.com',
    password: 'strong-password-123',
    createdAt: '2025-11-10T08:00:00Z',
  },
];

/** Sıra: en yeni `createdAt` önce (Figma: Netflix, YouTube Premium, Spotify). */
export const seedSubscriptions: StoredSubscription[] = [
  {
    id: NETFLIX_ID,
    userId: DEMO_USER_ID,
    serviceName: 'Netflix',
    amountKurus: 22999,
    period: 'monthly',
    startDate: '2026-01-31',
    status: 'active',
    createdAt: '2026-02-01T09:12:00Z',
    cancelledAt: null,
  },
  {
    id: YOUTUBE_ID,
    userId: DEMO_USER_ID,
    serviceName: 'YouTube Premium',
    amountKurus: 149900,
    period: 'yearly',
    startDate: '2025-03-15',
    status: 'active',
    createdAt: '2026-01-20T17:45:00Z',
    cancelledAt: null,
  },
  {
    id: SPOTIFY_ID,
    userId: DEMO_USER_ID,
    serviceName: 'Spotify',
    amountKurus: 5999,
    period: 'monthly',
    startDate: '2025-11-13',
    status: 'cancelled',
    createdAt: '2025-11-13T10:30:00Z',
    cancelledAt: '2026-02-12T18:30:00Z',
  },
];

export const seedReminders: Reminder[] = [
  // Netflix: 28.02.2026 yenilemesi (3 gün önce gönderildi, 1 gün önce bekliyor)
  {
    id: 'e5b7f9d1-4a6c-4e8d-9fa0-2c3d4e5f6071',
    subscriptionId: NETFLIX_ID,
    renewalDate: '2026-02-28',
    daysBefore: 3,
    remindOn: '2026-02-25',
    status: 'sent_mock',
    createdAt: '2026-02-25T06:00:04Z',
  },
  {
    id: 'f6c8a0e2-5b7d-4f9e-a0b1-3d4e5f607182',
    subscriptionId: NETFLIX_ID,
    renewalDate: '2026-02-28',
    daysBefore: 1,
    remindOn: '2026-02-27',
    status: 'created',
    createdAt: '2026-02-27T06:00:03Z',
  },
  // Spotify: iptalden önce üretilen hatırlatmalar listede kalır (FR-12)
  {
    id: 'a7d9b1f3-6c8e-4a0f-b1c2-4e5f60718293',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2025-12-13',
    daysBefore: 3,
    remindOn: '2025-12-10',
    status: 'sent_mock',
    createdAt: '2025-12-10T06:00:02Z',
  },
  {
    id: 'b8e0c2a4-7d9f-4b1a-82d3-5f60718293a4',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2025-12-13',
    daysBefore: 1,
    remindOn: '2025-12-12',
    status: 'sent_mock',
    createdAt: '2025-12-12T06:00:02Z',
  },
  {
    id: 'c9f1d3b5-8e0a-4c2b-93e4-60718293a4b5',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2026-01-13',
    daysBefore: 3,
    remindOn: '2026-01-10',
    status: 'sent_mock',
    createdAt: '2026-01-10T06:00:03Z',
  },
  {
    id: 'd0a2e4c6-9f1b-4d3c-a4f5-718293a4b5c6',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2026-01-13',
    daysBefore: 1,
    remindOn: '2026-01-12',
    status: 'sent_mock',
    createdAt: '2026-01-12T06:00:02Z',
  },
  {
    id: 'e1b3f5d7-0a2c-4e4d-b5a6-8293a4b5c6d7',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2026-02-13',
    daysBefore: 3,
    remindOn: '2026-02-10',
    status: 'sent_mock',
    createdAt: '2026-02-10T06:00:04Z',
  },
  {
    id: 'f2c4a6e8-1b3d-4f5e-86b7-93a4b5c6d7e8',
    subscriptionId: SPOTIFY_ID,
    renewalDate: '2026-02-13',
    daysBefore: 1,
    remindOn: '2026-02-12',
    status: 'sent_mock',
    createdAt: '2026-02-12T06:00:03Z',
  },
];
