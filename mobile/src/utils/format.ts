import { daysBetween } from '../domain/renewal';
import type { IsoDate, Period } from '../types/api';
import { strings } from './strings';

/** 22999 → "229,99 ₺", 149900 → "1.499,00 ₺" */
export function formatKurus(amountKurus: number): string {
  const lira = Math.floor(amountKurus / 100);
  const kurus = amountKurus % 100;
  const grouped = String(lira).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${String(kurus).padStart(2, '0')} ₺`;
}

/** "2026-02-28" → "28.02.2026" (UIR-07) */
export function formatDate(value: IsoDate): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

export function periodLabel(period: Period): string {
  return period === 'monthly' ? strings.period.monthly : strings.period.yearly;
}

export function periodSuffix(period: Period): string {
  return period === 'monthly' ? strings.card.perMonth : strings.card.perYear;
}

/** "yarın" veya "16 gün kaldı" */
export function daysLeftLabel(target: IsoDate, today: IsoDate): string {
  const days = daysBetween(today, target);
  return days === 1 ? strings.card.tomorrow : strings.card.daysLeft(days);
}

/** "28.02.2026 · yarın" */
export function renewalWithDaysLeft(target: IsoDate, today: IsoDate): string {
  return `${formatDate(target)} · ${daysLeftLabel(target, today)}`;
}

/** "3 gün kala · 25.02.2026" */
export function reminderLine(daysBefore: number, remindOn: IsoDate): string {
  return strings.reminder.line(daysBefore, formatDate(remindOn));
}
