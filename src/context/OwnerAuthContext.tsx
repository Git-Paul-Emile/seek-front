import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  meOwnerApi,
  refreshOwnerApi,
  logoutOwnerApi,
  type OwnerInfo,
} from "@/api/ownerAuth";
import { socketService } from "@/services/socketService";

// Rafraîchir le token 1 minute avant son expiry (15 min - 1 min = 14 min)
const REFRESH_INTERVAL_MS = 14 * 60 * 1000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface OwnerAuthState {
  owner: OwnerInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface OwnerAuthContextValue extends OwnerAuthState {
  setOwner: (owner: OwnerInfo | null) => void;
  logout: () => Promise<void>;
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshOwnerApi();
      } catch {
        // Si le refresh échoue (refresh token expiré), déconnecter silencieusement
        setOwner(null);
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

  // Restaurer la session au montage uniquement
  useEffect(() => {
    (async () => {
      try {
        const { data } = await meOwnerApi();
        setOwner(data.data);
        startRefreshTimer();
      } catch {
        try {
          await refreshOwnerApi();
          const { data } = await meOwnerApi();
          setOwner(data.data);
          startRefreshTimer();
        } catch {
          setOwner(null);
          stopRefreshTimer();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Nettoyer le timer au démontage
  useEffect(() => () => stopRefreshTimer(), [stopRefreshTimer]);

  // Rejoindre / quitter la room socket selon l'état d'auth
  useEffect(() => {
    if (owner) {
      socketService.joinOwner(owner.id);
    }
  }, [owner]);

  const logout = useCallback(async () => {
    stopRefreshTimer();
    try {
      await logoutOwnerApi();
    } catch {
      // Déconnexion côté client quoi qu'il arrive
    } finally {
      setOwner(null);
    }
  }, [stopRefreshTimer]);

  return (
    <OwnerAuthContext.Provider
      value={{
        owner,
        isLoading,
        isAuthenticated: owner !== null,
        setOwner,
        logout,
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOwnerAuth(): OwnerAuthContextValue {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx)
    throw new Error("useOwnerAuth doit être utilisé dans un <OwnerAuthProvider>");
  return ctx;
}
