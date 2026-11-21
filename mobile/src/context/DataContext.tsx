import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { api } from '../data/api';
import { isApiRequestError } from '../data/apiError';
import type { Reminder, Subscription, SubscriptionCreate, Uuid } from '../types/api';
import { useAuth } from './AuthContext';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface DataContextValue {
  subscriptions: Subscription[];
  reminders: Reminder[];
  status: LoadStatus;
  isRefreshing: boolean;
  /** Abonelikleri ve hatırlatmaları yeniden yükler (açılış, Tekrar Dene, aşağı çekme). */
  refresh: () => Promise<void>;
  /** S3: tek kaydı `getSubscription` ile tazeler; hata (404 dahil) çağırana fırlatılır. */
  loadSubscription: (id: Uuid) => Promise<Subscription>;
  createSubscription: (body: SubscriptionCreate) => Promise<Subscription>;
  cancelSubscription: (id: Uuid) => Promise<Subscription>;
}

const DataContext = createContext<DataContextValue | null>(null);

function upsert(list: Subscription[], item: Subscription): Subscription[] {
  const exists = list.some((subscription) => subscription.id === item.id);
  if (!exists) {
    return [item, ...list];
  }
  return list.map((subscription) => (subscription.id === item.id ? item : subscription));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { token, expireSession } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Oturum değişince (giriş, çıkış, 401) önceki kullanıcının verisi bellekte kalmaz.
  // Sıfırlama render sırasında yapılır; böylece ekranların ilk yüklemesiyle çakışmaz.
  const [sessionToken, setSessionToken] = useState(token);
  if (sessionToken !== token) {
    setSessionToken(token);
    setSubscriptions([]);
    setReminders([]);
    setStatus('idle');
    setIsRefreshing(false);
  }

  /**
   * 401 her ekranda aynı ele alınır: token silinir, S1 açılır (FR-14).
   * Token'ı istemci kendisi ekler (src/data/api.ts); burada yalnızca oturum varlığı denetlenir.
   */
  const run = useCallback(
    async <T,>(call: () => Promise<T>): Promise<T> => {
      if (!token) {
        expireSession();
        throw new Error('Oturum yok.');
      }
      try {
        return await call();
      } catch (error) {
        if (isApiRequestError(error) && error.status === 401) {
          expireSession();
        }
        throw error;
      }
    },
    [token, expireSession],
  );

  const refresh = useCallback(async () => {
    setStatus((current) => (current === 'ready' ? current : 'loading'));
    setIsRefreshing(true);
    try {
      const [nextSubscriptions, nextReminders] = await Promise.all([
        run(() => api.listSubscriptions()),
        run(() => api.listReminders()),
      ]);
      setSubscriptions(nextSubscriptions);
      setReminders(nextReminders);
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'ready' ? current : 'error'));
    } finally {
      setIsRefreshing(false);
    }
  }, [run]);

  const loadSubscription = useCallback(
    async (id: Uuid) => {
      const subscription = await run(() => api.getSubscription(id));
      setSubscriptions((list) => upsert(list, subscription));
      return subscription;
    },
    [run],
  );

  const createSubscription = useCallback(
    async (body: SubscriptionCreate) => {
      const subscription = await run(() => api.createSubscription(body));
      setSubscriptions((list) => upsert(list, subscription));
      return subscription;
    },
    [run],
  );

  const cancelSubscription = useCallback(
    async (id: Uuid) => {
      const subscription = await run(() => api.cancelSubscription(id));
      setSubscriptions((list) => upsert(list, subscription));
      return subscription;
    },
    [run],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      subscriptions,
      reminders,
      status,
      isRefreshing,
      refresh,
      loadSubscription,
      createSubscription,
      cancelSubscription,
    }),
    [
      subscriptions,
      reminders,
      status,
      isRefreshing,
      refresh,
      loadSubscription,
      createSubscription,
      cancelSubscription,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) {
    throw new Error('useData, DataProvider içinde kullanılmalıdır.');
  }
  return value;
}
