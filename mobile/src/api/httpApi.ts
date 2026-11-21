/**
 * Sözleşmeden üretilen tiplerle (src/api/schema.d.ts) çalışan HTTP istemcisi.
 *
 * - İstek gövdesi ve başarılı yanıt tipleri `operations[...]`'tan türetilir; sözleşme
 *   değişip tipler yeniden üretildiğinde uyumsuz kullanım derlemede yakalanır.
 * - Korumalı uçlara `Authorization: Bearer <token>` otomatik eklenir; token
 *   `getAccessToken` ile okunur (uygulamada SecureStore destekli depo).
 * - Başarısız yanıtlar src/data/apiError.ts'te tek noktada `ApiRequestError`'a,
 *   bağlantı/zaman aşımı hataları `ApiNetworkError`'a çevrilir.
 *
 * Bu modül Expo/React Native'e bağlı değildir; Node'da da çalışır (Prism doğrulaması).
 */
import { ApiNetworkError, toApiRequestError } from '../data/apiError';
import type { ApiClient } from '../types/api';
import type { operations, paths } from './schema';

type OperationId = keyof operations;

/** Bir işlemin JSON istek gövdesi tipi. */
type RequestBody<K extends OperationId> = operations[K] extends {
  requestBody: { content: { 'application/json': infer Body } };
}
  ? Body
  : never;

/** Bir işlemin belirtilen başarı kodundaki JSON yanıt tipi. */
type SuccessBody<K extends OperationId, Status extends keyof operations[K]['responses']> =
  operations[K]['responses'][Status] extends { content: { 'application/json': infer Body } }
    ? Body
    : never;

type HttpMethod = 'GET' | 'POST';

interface RequestSpec {
  method: HttpMethod;
  /** Sözleşmedeki path şablonu; derleyici yalnızca tanımlı path'lere izin verir. */
  path: keyof paths;
  pathParams?: Record<string, string>;
  body?: unknown;
  /** `security: []` olan uçlar (register, login) için `false`. */
  authenticated: boolean;
}

export interface HttpApiOptions {
  /** Ör. `http://10.0.2.2:8000` (sonda `/` olmadan da, olarak da verilebilir). */
  baseUrl: string;
  /** Korumalı uçlarda eklenecek erişim token'ı; yoksa `null`. */
  getAccessToken: () => string | null;
  /** İstek zaman aşımı (ms). Aşılırsa `ApiNetworkError`. */
  timeoutMs?: number;
  /** Testlerde değiştirilebilir; varsayılan küresel `fetch`. */
  fetchFn?: typeof fetch;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function buildUrl(baseUrl: string, path: string, params: Record<string, string> = {}): string {
  const filled = path.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = params[name];
    if (value === undefined) {
      throw new Error(`Eksik path parametresi: ${name}`);
    }
    return encodeURIComponent(value);
  });
  return `${baseUrl.replace(/\/+$/, '')}${filled}`;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createHttpApi(options: HttpApiOptions): ApiClient {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));

  async function send<T>(spec: RequestSpec): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (spec.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (spec.authenticated) {
      const token = options.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetchFn(buildUrl(options.baseUrl, spec.path, spec.pathParams), {
        method: spec.method,
        headers,
        body: spec.body === undefined ? undefined : JSON.stringify(spec.body),
        signal: controller.signal,
      });
    } catch (error) {
      throw new ApiNetworkError(error);
    } finally {
      clearTimeout(timer);
    }

    let payload: unknown;
    try {
      payload = await readJson(response);
    } catch (error) {
      throw new ApiNetworkError(error);
    }
    if (!response.ok) {
      throw toApiRequestError(response.status, payload);
    }
    return payload as T;
  }

  return {
    registerUser: (body: RequestBody<'registerUser'>) =>
      send<SuccessBody<'registerUser', 201>>({
        method: 'POST',
        path: '/auth/register',
        body,
        authenticated: false,
      }),

    login: (body: RequestBody<'login'>) =>
      send<SuccessBody<'login', 200>>({
        method: 'POST',
        path: '/auth/login',
        body,
        authenticated: false,
      }),

    createSubscription: (body: RequestBody<'createSubscription'>) =>
      send<SuccessBody<'createSubscription', 201>>({
        method: 'POST',
        path: '/subscriptions',
        body,
        authenticated: true,
      }),

    listSubscriptions: () =>
      send<SuccessBody<'listSubscriptions', 200>>({
        method: 'GET',
        path: '/subscriptions',
        authenticated: true,
      }),

    getSubscription: (id) =>
      send<SuccessBody<'getSubscription', 200>>({
        method: 'GET',
        path: '/subscriptions/{id}',
        pathParams: { id },
        authenticated: true,
      }),

    cancelSubscription: (id) =>
      send<SuccessBody<'cancelSubscription', 200>>({
        method: 'POST',
        path: '/subscriptions/{id}/cancel',
        pathParams: { id },
        authenticated: true,
      }),

    listReminders: () =>
      send<SuccessBody<'listReminders', 200>>({
        method: 'GET',
        path: '/reminders',
        authenticated: true,
      }),
  };
}
