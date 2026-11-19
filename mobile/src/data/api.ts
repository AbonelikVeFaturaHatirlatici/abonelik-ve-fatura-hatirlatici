import type { ApiClient } from '../types/api';
import { mockApi } from './mockApi';

/**
 * Uygulamanın kullandığı tek API istemcisi.
 * S2-06: burası `mockApi` yerine HTTP istemcisini döndürecek; ekranlar ve context'ler değişmez.
 */
export const api: ApiClient = mockApi;
