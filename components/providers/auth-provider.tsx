"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  UNAUTHORIZED_EVENT,
  getCurrentUser,
  getErrorStatus,
  hasToken,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
} from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  /** اطلاعات کاربر؛ اگر توکن معتبر باشد اما دریافت پروفایل ناموفق بوده، null است. */
  user: AuthUser | null;
  status: AuthStatus;
  /** کاربر در همین نشست مرورگر عمداً از حساب خارج شده است (نه انقضای توکن). */
  loggedOut: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!hasToken()) {
        setUser(null);
        setStatus("guest");
        return;
      }

      try {
        const current = await getCurrentUser();

        if (cancelled) return;

        setUser(current);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) return;

        if (getErrorStatus(error) === 401 || !hasToken()) {
          setUser(null);
          setStatus("guest");
          return;
        }

        // خطای شبکه یا سرور: توکن معتبر فرض می‌شود تا کاربر بی‌دلیل خارج نشود.
        setUser(null);
        setStatus("authenticated");
      }
    }

    function handleUnauthorized() {
      setUser(null);
      setStatus("guest");
    }

    // همگام‌سازی ورود و خروج بین تب‌های مختلف مرورگر.
    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === "token") {
        void restoreSession();
      }
    }

    void restoreSession();

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginUser(username, password);
    setUser(result.user ?? null);
    setLoggedOut(false);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const result = await registerUser(username, password);
    setUser(result.user ?? null);
    setLoggedOut(false);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setLoggedOut(true);
    setStatus("guest");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, loggedOut, login, register, logout }),
    [user, status, loggedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth باید داخل AuthProvider استفاده شود.");
  }

  return context;
}
