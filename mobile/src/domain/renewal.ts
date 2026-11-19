/**
 * Takvim tarihi yardımcıları ve yenileme hesabı (backend/app/domain/renewal.py ile aynı kural).
 *
 * Bu ekranda yenileme tarihi istemcide hesaplanmaz; `nextRenewalDate` API'den gelir.
 * Bu fonksiyonlar yalnızca mock sunucu (data/mockApi.ts), kalan gün sayısı ve tarih
 * aralığı doğrulaması için kullanılır. Tüm hesaplar saat dilimsiz takvim günleriyle yapılır.
 */
import type { IsoDate, Period } from '../types/api';

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseIsoDate(value: IsoDate): DateParts {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
}

export function toIsoDate(year: number, month: number, day: number): IsoDate {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** `month` 1–12 */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) &&
    year >= 1 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

function toUtcMs(value: IsoDate): number {
  const { year, month, day } = parseIsoDate(value);
  return Date.UTC(year, month - 1, day);
}

/** `to - from` gün farkı */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

export function addDays(value: IsoDate, days: number): IsoDate {
  const date = new Date(toUtcMs(value) + days * MS_PER_DAY);
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Ay ekler; hedef ayda o gün yoksa ayın son günü (31 Ocak → 28 Şubat). */
export function addMonths(start: IsoDate, months: number): IsoDate {
  const { year, month, day } = parseIsoDate(start);
  const index = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(index / 12);
  const targetMonth = (index % 12) + 1;
  return toIsoDate(targetYear, targetMonth, Math.min(day, daysInMonth(targetYear, targetMonth)));
}

/** `after` tarihinden SONRAKİ ilk yenileme; her zaman başlangıç tarihinden hesaplanır (FR-06). */
export function nextRenewal(start: IsoDate, period: Period, after: IsoDate): IsoDate {
  const step = period === 'monthly' ? 1 : 12;
  for (let k = 1; ; k += 1) {
    const candidate = addMonths(start, k * step);
    if (candidate > after) {
      return candidate;
    }
  }
}
