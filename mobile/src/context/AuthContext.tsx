import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { tokenStorage } from '../auth/tokenStorage';
import { api } from '../data/api';
import type { Credentials } from '../types/api';
import { strings } from '../utils/strings';

/**
 * Oturum durumu. Erişim token'ı SecureStore'da saklanır (NFR-S5) ve uygulama açılışında
 * geri yüklenir; çıkışta ve her 401'de silinir (FR-14). Sunucuya çıkış çağrısı yapılmaz.
 */
interface AuthContextValue {
  token: string | null;
  /** Bu açılışta giriş yapılan e-posta; token geri yüklendiğinde `null`. Saklanmaz. */
  email: string | null;
  /** Açılışta SecureStore okunurken `true`; bu sürede hiçbir ekran gösterilmez. */
  isRestoring: boolean;
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

/** Silme başarısız olsa da oturum bellekten kalkar; bir sonraki açılışta 401 yine siler. */
function forgetStoredToken(): void {
  tokenStorage.clear().catch(() => undefined);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    tokenStorage.load().then((stored) => {
      if (active) {
        setToken(stored);
        setIsRestoring(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const result = await api.login(credentials);
    try {
      await tokenStorage.save(result.accessToken);
    } catch {
      // SecureStore'a yazılamadıysa oturum bu açılış boyunca bellekte geçerli kalır.
    }
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
    forgetStoredToken();
    setToken(null);
    setEmail(null);
    setSessionMessage(null);
  }, []);

  const expireSession = useCallback(() => {
    forgetStoredToken();
    setToken(null);
    setEmail(null);
    setSessionMessage(strings.auth.sessionExpired);
  }, []);

  const clearSessionMessage = useCallback(() => setSessionMessage(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      isRestoring,
      sessionMessage,
      signIn,
      register,
      signOut,
      expireSession,
      clearSessionMessage,
    }),
    [
      token,
      email,
      isRestoring,
      sessionMessage,
      signIn,
      register,
      signOut,
      expireSession,
      clearSessionMessage,
    ],
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
