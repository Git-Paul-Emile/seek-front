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
  meLocataireApi,
  logoutLocataireApi,
} from "@/api/locataireAuth";
import type { Locataire } from "@/api/locataire";

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

// ─── Contexte ─────────────────────────────────────────────────────────────────

const LocataireAuthContext = createContext<LocataireAuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocataireAuthProvider({ children }: { children: ReactNode }) {
  const [locataire, setLocataire] = useState<Locataire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();

  // Restaurer la session au montage
  useEffect(() => {
    if (!pathname.startsWith("/locataire")) {
      setLocataire(null);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await meLocataireApi();
        setLocataire(data);
      } catch {
        setLocataire(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [pathname]);

  const logout = useCallback(async () => {
    try {
      await logoutLocataireApi();
    } catch {
      // Déconnexion côté client quoi qu'il arrive
    } finally {
      setLocataire(null);
    }
  }, []);

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
