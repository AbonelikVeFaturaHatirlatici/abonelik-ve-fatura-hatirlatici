/**
 * JWT erişim token'ının güvenli saklanması (NFR-S5, FR-14).
 *
 * Token Android Keystore destekli `expo-secure-store`'da tutulur; düz depolamaya
 * (AsyncStorage vb.) yazılmaz. API istemcisi her istekte diske gitmesin diye son değer
 * bellekte de tutulur; uygulama açılışında `load()` ile SecureStore'dan okunur.
 * Çıkışta ve her 401'de `clear()` ile silinir.
 */
import * as SecureStore from 'expo-secure-store';

/** SecureStore anahtarı (yalnızca harf, rakam, ".", "-", "_"). */
const ACCESS_TOKEN_KEY = 'auth.accessToken';

let cachedToken: string | null = null;

export const tokenStorage = {
  /** Bellekteki token; API istemcisi bunu okur. */
  current(): string | null {
    return cachedToken;
  },

  /** Açılışta SecureStore'dan okur. Okunamazsa oturum yok sayılır. */
  async load(): Promise<string | null> {
    try {
      cachedToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      cachedToken = null;
    }
    return cachedToken;
  },

  /**
   * Bellekteki değeri hemen günceller, sonra SecureStore'a yazar.
   * Yazma başarısız olursa hata fırlatır; oturum yine bu açılış boyunca bellekte geçerlidir.
   */
  async save(token: string): Promise<void> {
    cachedToken = token;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  /** Çıkış ve 401: bellekten ve SecureStore'dan siler. */
  async clear(): Promise<void> {
    cachedToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },
};
