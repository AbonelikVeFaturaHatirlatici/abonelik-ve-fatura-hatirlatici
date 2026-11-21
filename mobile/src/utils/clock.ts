import { USE_MOCK_API } from '../config/env';
import type { IsoDate, IsoDateTime } from '../types/api';

/**
 * Mock "bugün". Figma kareleri 27.02.2026 tarihine göre çizildiği için mock veri bu
 * tarihe sabitlenmiştir ("28.02.2026 · yarın"). Yalnızca mock modunda kullanılır.
 */
export const MOCK_TODAY: IsoDate = '2026-02-27';

/** Europe/Istanbul sabit UTC+3'tür (2016'dan beri yaz saati yok; SRS 2.4). */
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Europe/Istanbul takvimine göre bugün (`YYYY-MM-DD`). */
export function istanbulToday(now: Date = new Date()): IsoDate {
  return new Date(now.getTime() + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10);
}

/** Kalan gün ve tarih aralığı hesabında kullanılan "bugün". */
export function today(): IsoDate {
  return USE_MOCK_API ? MOCK_TODAY : istanbulToday();
}

/** Mock kayıtların `createdAt` değeri: mock günün tarihi + şu anki UTC saati. */
export function nowUtc(): IsoDateTime {
  const timeOfDay = new Date().toISOString().slice(10);
  return `${MOCK_TODAY}${timeOfDay}`;
}
