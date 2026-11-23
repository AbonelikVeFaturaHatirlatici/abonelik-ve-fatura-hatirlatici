import { createHttpApi } from '../api/httpApi';
import { tokenStorage } from '../auth/tokenStorage';
import { API_BASE_URL, USE_MOCK_API } from '../config/env';
import type { ApiClient } from '../types/api';
import { createMockApi } from './mockApi';

/**
 * Uygulamanın kullandığı tek API istemcisi. Ekranlar ve context'ler yalnızca bunu kullanır.
 *
 * - Varsayılan: sözleşmeden tiplenen HTTP istemcisi (`API_BASE_URL`; backend veya Prism).
 * - `EXPO_PUBLIC_USE_MOCK_API=true`: bellek içi mock sunucu (ağ gerekmez).
 *
 * Her iki istemci de erişim token'ını aynı depodan (SecureStore destekli) okur.
 */
export const api: ApiClient = USE_MOCK_API
  ? createMockApi(tokenStorage.current)
  : createHttpApi({ baseUrl: API_BASE_URL, getAccessToken: tokenStorage.current });
