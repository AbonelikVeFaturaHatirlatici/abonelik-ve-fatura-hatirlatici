/**
 * Merkezi API hata katmanı. Sözleşmedeki tek hata şeması `{ code, message }` yalnızca
 * burada ayrıştırılır; ekranlar ve context'ler yalnızca bu sınıfları görür.
 *
 * - `ApiRequestError`: sunucu yanıt verdi ama başarısız (4xx/5xx). `message` kullanıcıya
 *   olduğu gibi gösterilir (D-19, UIR-02).
 * - `ApiNetworkError`: yanıt hiç alınamadı (bağlantı yok, zaman aşımı).
 */
import type { ApiErrorBody } from '../types/api';
import { strings } from '../utils/strings';

/** Sözleşmedeki `{ code, message }` hata gövdesini HTTP durum koduyla taşır. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = body.code;
  }
}

/** Sunucuya ulaşılamadı veya istek zaman aşımına uğradı. */
export class ApiNetworkError extends Error {
  /** Asıl hata (TypeError, AbortError vb.); hata ayıklama içindir, kullanıcıya gösterilmez. */
  readonly originalError: unknown;

  constructor(originalError: unknown) {
    super(strings.common.networkError);
    this.name = 'ApiNetworkError';
    this.originalError = originalError;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function isApiNetworkError(error: unknown): error is ApiNetworkError {
  return error instanceof ApiNetworkError;
}

/** Gövde sözleşmedeki `Error` şemasına uyuyorsa onu, uymuyorsa `null` döndürür. */
export function parseErrorBody(value: unknown): ApiErrorBody | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { code, message } = value as Record<string, unknown>;
  if (typeof code !== 'string' || typeof message !== 'string' || !code || !message) {
    return null;
  }
  return { code, message };
}

/**
 * Sözleşme dışı gövdeler için (405/404 gövdesi sözleşme garantisinde değil,
 * proxy/HTML hata sayfaları vb.) durum koduna göre Türkçe yedek mesaj.
 */
function fallbackBody(status: number): ApiErrorBody {
  if (status === 401) {
    return { code: 'UNAUTHORIZED', message: strings.apiErrors.unauthorized };
  }
  if (status === 404) {
    return { code: 'NOT_FOUND', message: strings.apiErrors.notFound };
  }
  if (status >= 500) {
    return { code: 'SERVER_ERROR', message: strings.apiErrors.server };
  }
  return { code: `HTTP_${status}`, message: strings.apiErrors.generic };
}

/** HTTP durum kodu ve (ayrıştırılmış ya da ham) gövdeden tipli hata üretir. */
export function toApiRequestError(status: number, body: unknown): ApiRequestError {
  return new ApiRequestError(status, parseErrorBody(body) ?? fallbackBody(status));
}
