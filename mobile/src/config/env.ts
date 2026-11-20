/**
 * Ortam ayarları. Expo, `EXPO_PUBLIC_` önekli değişkenleri derleme sırasında koda gömer;
 * bu yüzden değişkenler `process.env.EXPO_PUBLIC_...` biçiminde, birebir yazılmalıdır.
 * Değerler `mobile/.env` dosyasından ya da komut satırından gelir (.env.example'a bakın).
 * Bu dosyalara gizli bilgi yazılmaz: `EXPO_PUBLIC_` değerleri uygulama paketine girer.
 */

// Expo/Node global'i; tipi `expo/types` veya `@types/node` yüklü olmasa da derlensin diye
// yalnızca bu modülde bildirilir (çalışma anındaki global `process`'i değiştirmez).
declare const process: { env: Record<string, string | undefined> };

/** Android emülatöründen geliştirme makinesindeki `localhost:8000`'e erişim adresi. */
export const DEFAULT_API_BASE_URL = 'http://10.0.2.2:8000';

function readBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  return (value || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

/** API taban adresi; `EXPO_PUBLIC_API_BASE_URL` ile ezilir. */
export const API_BASE_URL = readBaseUrl();

/**
 * `true` ise uygulama ağ yerine bellek içi mock sunucuyu kullanır (S2-05 davranışı;
 * backend veya Prism olmadan arayüz geliştirmek için).
 */
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API?.trim() === 'true';
