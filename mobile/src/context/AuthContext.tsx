import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { api } from '../data/api';
import type { Credentials } from '../types/api';
import { strings } from '../utils/strings';

/**
 * Oturum durumu. S2-05'te token yalnızca bellekte tutulur;
 * S2-06'da Expo SecureStore'a yazılır (NFR-S5) ve uygulama açılışında okunur.
 */
interface AuthContextValue {
  token: string | null;
  email: string | null;
  /** S1'de nötr renkte gösterilen "Oturumunuz sona erdi." mesajı (FR-14) */
  sessionMessage: string | null;
  signIn: (credentials: Credentials) => Promise<void>;
  /** Kayıt olur, ardından aynı bilgilerle otomatik giriş yapar (akış F1). */
  register: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
  /** Herhangi bir çağrı 401 döndüğünde çağrılır. */
  expireSession: () => void;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const signIn = useCallback(async (credentials: Credentials) => {
    const result = await api.login(credentials);
    setSessionMessage(null);
    setEmail(credentials.email.trim().toLowerCase());
    setToken(result.accessToken);
  }, []);

  const register = useCallback(
    async (credentials: Credentials) => {
      await api.registerUser(credentials);
      await signIn(credentials);
    },
    [signIn],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setEmail(null);
    setSessionMessage(null);
  }, []);

  const expireSession = useCallback(() => {
    setToken(null);
    setEmail(null);
    setSessionMessage(strings.auth.sessionExpired);
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      sessionMessage,
      signIn,
      register,
      signOut,
      expireSession,
      clearSessionMessage,
    }),
    [token, email, sessionMessage, signIn, register, signOut, expireSession, clearSessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.');
  }
  return value;
}
