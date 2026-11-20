/**
 * Prism mock sunucusuna karşı kayıt + giriş akışını uygulamanın kullandığı tipli
 * istemciyle (src/api/httpApi.ts) uçtan uca doğrular.
 *
 *   1. terminal:  npm run mock:api        (Prism, api/openapi.yaml, port 8000)
 *   2. terminal:  npm run test:prism
 *
 * Adres `PRISM_URL` ile değiştirilebilir (varsayılan http://127.0.0.1:8000).
 * Gerçek backend'e karşı da çalışır; o durumda her çalıştırmada yeni bir e-posta kullanılır.
 */
import { createHttpApi } from '../src/api/httpApi';
import { isApiNetworkError, isApiRequestError } from '../src/data/apiError';

// Node global'i; @types/node gerekmeden derlensin diye yalnızca bu modülde bildirilir.
declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

const BASE_URL = process.env.PRISM_URL ?? 'http://127.0.0.1:8000';

let accessToken: string | null = null;
const api = createHttpApi({ baseUrl: BASE_URL, getAccessToken: () => accessToken });

let failures = 0;

async function check(name: string, step: () => Promise<void>): Promise<void> {
  try {
    await step();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}\n    ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectApiError(call: Promise<unknown>, status: number, code: string) {
  try {
    await call;
  } catch (error) {
    assert(isApiRequestError(error), `ApiRequestError bekleniyordu, gelen: ${String(error)}`);
    assert(error.status === status, `durum ${status} bekleniyordu, gelen ${error.status}`);
    assert(error.code === code, `kod ${code} bekleniyordu, gelen ${error.code}`);
    assert(error.message.length > 0, 'hata mesajı boş');
    return;
  }
  throw new Error(`${status} ${code} bekleniyordu ama istek başarılı oldu`);
}

async function main(): Promise<void> {
  console.log(`Prism/API adresi: ${BASE_URL}\n`);
  const credentials = {
    email: `s206-${Date.now()}@example.com`,
    password: 'strong-password-123',
  };

  await check('registerUser → 201, User şeması', async () => {
    const user = await api.registerUser(credentials);
    assert(typeof user.id === 'string' && user.id.length > 0, 'User.id yok');
    assert(typeof user.email === 'string', 'User.email yok');
    assert(typeof user.createdAt === 'string', 'User.createdAt yok');
  });

  await check('registerUser kısa şifre → 400 VALIDATION_ERROR ({code, message})', () =>
    expectApiError(
      api.registerUser({ email: credentials.email, password: 'kisa' }),
      400,
      'VALIDATION_ERROR',
    ),
  );

  await check('login → 200, Token şeması', async () => {
    const token = await api.login(credentials);
    assert(token.tokenType === 'bearer', `tokenType "bearer" değil: ${token.tokenType}`);
    assert(token.accessToken.length > 0, 'accessToken boş');
    accessToken = token.accessToken;
  });

  await check('korumalı uç token ile → 200 (Authorization başlığı eklendi)', async () => {
    assert(accessToken !== null, 'önceki adımda token alınamadı');
    const subscriptions = await api.listSubscriptions();
    assert(Array.isArray(subscriptions), 'Subscription[] dönmedi');
  });

  await check('korumalı uç token olmadan → 401 UNAUTHORIZED', async () => {
    const saved = accessToken;
    accessToken = null;
    try {
      await expectApiError(api.listSubscriptions(), 401, 'UNAUTHORIZED');
    } finally {
      accessToken = saved;
    }
  });

  await check('sunucuya ulaşılamıyor → ApiNetworkError', async () => {
    const offline = createHttpApi({
      baseUrl: 'http://127.0.0.1:1',
      getAccessToken: () => null,
      timeoutMs: 2000,
    });
    try {
      await offline.login(credentials);
    } catch (error) {
      assert(isApiNetworkError(error), `ApiNetworkError bekleniyordu: ${String(error)}`);
      return;
    }
    throw new Error('bağlantı hatası bekleniyordu');
  });

  console.log(failures === 0 ? '\nTüm kontroller geçti.' : `\n${failures} kontrol başarısız.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

void main();
