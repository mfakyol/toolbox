import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import type { AuthUser } from "../api/auth";
import { fetchConfig } from "../api/config";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  // When false, the app is open: no login gate, no admin/users area.
  authRequired: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authRequired, setAuthRequired] = useState(true);
  const [loading, setLoading] = useState(true);

  // Read the runtime config and restore the session on first load.
  useEffect(() => {
    Promise.all([
      fetchConfig()
        .then((c) => setAuthRequired(c.authRequired))
        .catch(() => setAuthRequired(true)),
      authApi
        .fetchMe()
        .then(({ user }) => setUser(user))
        .catch(() => setUser(null)),
    ]).finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const { user } = await authApi.login(email, password, rememberMe);
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    const { user } = await authApi.changePassword(current, next);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, authRequired, login, logout, changePassword }),
    [user, loading, authRequired, login, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider.");
  return ctx;
}
