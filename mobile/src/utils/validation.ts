/**
 * İstemci doğrulaması (UIR-04, FR-15, BR-10). Sunucu yine son karar vericidir;
 * bu kontroller yalnızca gereksiz istek göndermeyi önler.
 */
import { addDays, isValidCalendarDate, toIsoDate } from '../domain/renewal';
import type { IsoDate } from '../types/api';
import { strings } from './strings';

export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const SERVICE_NAME_MAX_LENGTH = 100;
/** PostgreSQL INTEGER üst sınırı (backend ile aynı) */
export const AMOUNT_KURUS_MAX = 2_147_483_647;
export const MIN_START_DATE: IsoDate = '2000-01-01';
export const MAX_FUTURE_DAYS = 366;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = <T>(error: string): ParseResult<T> => ({ ok: false, error });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!EMAIL_PATTERN.test(value) || value.length > EMAIL_MAX_LENGTH) {
    return strings.auth.errEmail;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  return password.length < PASSWORD_MIN_LENGTH ? strings.auth.errPassword : null;
}

export function validateServiceName(name: string): ParseResult<string> {
  const value = name.trim();
  if (value.length === 0) {
    return fail(strings.add.errName);
  }
  if (value.length > SERVICE_NAME_MAX_LENGTH) {
    return fail(strings.add.errNameLength);
  }
  return { ok: true, value };
}

/**
 * Lira cinsinden girilen tutarı yuvarlamadan kuruşa çevirir (FR-15).
 * Ondalık ayırıcı virgül veya nokta olabilir: "229,99" ve "229.99" → 22999.
 * Virgül varsa nokta binlik ayırıcı sayılır: "1.499,00" → 149900.
 */
export function parseAmountToKurus(input: string): ParseResult<number> {
  const text = input.replace(/\s/g, '');
  if (text.length === 0) {
    return fail(strings.add.errAmount);
  }
  if (text.startsWith('-')) {
    return fail(strings.add.errAmountZero);
  }

  let normalized = text;
  if (/^\d{1,3}(\.\d{3})+,\d*$/.test(normalized)) {
    normalized = normalized.replace(/\./g, '');
  }
  normalized = normalized.replace(',', '.');

  const match = /^(\d+)(?:\.(\d*))?$/.exec(normalized);
  if (!match) {
    return fail(strings.add.errAmount);
  }
  const lira = match[1];
  const fraction = match[2] ?? '';
  if (fraction.length > 2) {
    return fail(strings.add.errAmountDecimals);
  }

  const kurus = Number(`${lira}${fraction.padEnd(2, '0')}`);
  if (!Number.isSafeInteger(kurus) || kurus > AMOUNT_KURUS_MAX) {
    return fail(strings.add.errAmount);
  }
  if (kurus === 0) {
    return fail(strings.add.errAmountZero);
  }
  return { ok: true, value: kurus };
}

/** Yazarken "31012026" → "31.01.2026" biçimine getirir. */
export function maskDateInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

/** "31.01.2026" → "2026-01-31"; izinli aralık 01.01.2000 – bugün + 366 gün (BR-10). */
export function parseDisplayDate(input: string, today: IsoDate): ParseResult<IsoDate> {
  const text = input.trim();
  if (text.length === 0) {
    return fail(strings.add.errDate);
  }
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
  if (!match) {
    return fail(strings.add.errDateFormat);
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!isValidCalendarDate(year, month, day)) {
    return fail(strings.add.errDateFormat);
  }
  const iso = toIsoDate(year, month, day);
  if (iso < MIN_START_DATE || iso > addDays(today, MAX_FUTURE_DAYS)) {
    return fail(strings.add.errDateRange);
  }
  return { ok: true, value: iso };
}
