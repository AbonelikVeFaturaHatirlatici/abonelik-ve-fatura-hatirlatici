import type { IsoDate, IsoDateTime } from '../types/api';

/**
 * Mock "bugün". Figma kareleri 27.02.2026 tarihine göre çizildiği için
 * ("28.02.2026 · yarın", "15.03.2026 · 16 gün kaldı") mock veri bu tarihe sabitlenmiştir.
 *
 * S2-06: gerçek API'ye geçerken burası Europe/Istanbul takvimindeki gerçek güne çevrilir.
 */
export const MOCK_TODAY: IsoDate = '2026-02-27';

export function today(): IsoDate {
  return MOCK_TODAY;
}

/** Mock kayıtların `createdAt` değeri: mock günün tarihi + şu anki UTC saati. */
export function nowUtc(): IsoDateTime {
  const timeOfDay = new Date().toISOString().slice(10);
  return `${MOCK_TODAY}${timeOfDay}`;
}
