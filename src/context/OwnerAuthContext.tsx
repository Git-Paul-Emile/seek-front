import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  meOwnerApi,
  refreshOwnerApi,
  logoutOwnerApi,
  type OwnerInfo,
} from "@/api/ownerAuth";

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
  const { pathname } = useLocation();

  // Restaurer la session au montage
  useEffect(() => {
    if (!pathname.startsWith("/owner") && !pathname.startsWith("/proprietaires")) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await meOwnerApi();
        setOwner(data.data);
      } catch {
        try {
          await refreshOwnerApi();
          const { data } = await meOwnerApi();
          setOwner(data.data);
        } catch {
          setOwner(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname]);

  const logout = useCallback(async () => {
    try {
      await logoutOwnerApi();
    } catch {
      // Déconnexion côté client quoi qu'il arrive
    } finally {
      setOwner(null);
    }
  }, []);

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
