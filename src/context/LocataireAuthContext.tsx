import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  meLocataireApi,
  refreshLocataireApi,
  logoutLocataireApi,
} from "@/api/locataireAuth";
import type { Locataire } from "@/api/locataire";

const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocataireAuthState {
  locataire: Locataire | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LocataireAuthContextValue extends LocataireAuthState {
  setLocataire: (locataire: Locataire | null) => void;
  logout: () => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

// Pages publiques : pas d'appel /me (évite l'interférence avec le flow login)
const PUBLIC_LOCATAIRE_PATHS = ["/locataire/login", "/locataire/activer"];

const isPublicLocatairePage = (pathname: string) =>
  PUBLIC_LOCATAIRE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

// ─── Contexte ─────────────────────────────────────────────────────────────────

const LocataireAuthContext = createContext<LocataireAuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocataireAuthProvider({ children }: { children: ReactNode }) {
  const [locataire, setLocataire] = useState<Locataire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshLocataireApi();
      } catch {
        setLocataire(null);
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

  // Restaurer la session au montage / changement de route
  useEffect(() => {
    const isFirstRun = !hasInitialized.current;

    if (isFirstRun) {
      hasInitialized.current = true;
    } else if (!pathname.startsWith("/locataire") || isPublicLocatairePage(pathname)) {
      return;
    }

    (async () => {
      try {
        const data = await meLocataireApi();
        setLocataire(data);
        startRefreshTimer();
      } catch {
        try {
          await refreshLocataireApi();
          const data = await meLocataireApi();
          setLocataire(data);
          startRefreshTimer();
        } catch {
          setLocataire(null);
          stopRefreshTimer();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopRefreshTimer(), [stopRefreshTimer]);

  const logout = useCallback(async () => {
    stopRefreshTimer();
    try {
      await logoutLocataireApi();
    } catch {
      // Déconnexion côté client quoi qu'il arrive
    } finally {
      setLocataire(null);
    }
  }, [stopRefreshTimer]);

  return (
    <LocataireAuthContext.Provider
      value={{
        locataire,
        isLoading,
        isAuthenticated: locataire !== null,
        setLocataire,
        logout,
      }}
    >
      {children}
    </LocataireAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocataireAuth(): LocataireAuthContextValue {
  const ctx = useContext(LocataireAuthContext);
  if (!ctx)
    throw new Error(
      "useLocataireAuth doit être utilisé dans un <LocataireAuthProvider>"
    );
  return ctx;
}
