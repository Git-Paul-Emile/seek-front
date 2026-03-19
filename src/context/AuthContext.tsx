import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import axios from "axios";
import { loginApi, logoutApi, meApi, refreshApi, type AdminInfo } from "@/api/auth";
import { useLocation } from "react-router-dom";

const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  admin: AdminInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Contexte ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshApi();
      } catch {
        setAdmin(null);
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      }
    }, REFRESH_INTERVAL_MS);
  }, []);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const hasInitialized = useRef(false);

  // Tenter de restaurer la session via /me au montage
  useEffect(() => {
    const isFirstRun = !hasInitialized.current;

    if (isFirstRun) {
      hasInitialized.current = true;
    } else if (!pathname.startsWith("/admin")) {
      // Navigations suivantes hors espace admin : ne pas effacer l'état
      return;
    }

    (async () => {
      try {
        const { data } = await meApi();
        setAdmin(data.data);
        startRefreshTimer();
      } catch {
        // Pas de session active — tenter un refresh silencieux
        try {
          await refreshApi();
          const { data } = await meApi();
          setAdmin(data.data);
          startRefreshTimer();
        } catch {
          setAdmin(null);
          stopRefreshTimer();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopRefreshTimer(), [stopRefreshTimer]);

  const login = useCallback(async (email: string, password: string) => {
    await loginApi({ email, password });
    const { data } = await meApi();
    setAdmin(data.data);
    startRefreshTimer();
  }, [startRefreshTimer]);

  const logout = useCallback(async () => {
    stopRefreshTimer();
    try {
      await logoutApi();
    } catch {
      // On déconnecte quand même côté client
    } finally {
      setAdmin(null);
    }
  }, [stopRefreshTimer]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: admin !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}
