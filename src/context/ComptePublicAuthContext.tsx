import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  meComptePublicApi,
  logoutComptePublicApi,
  type ComptePublic,
} from "@/api/comptePublicAuth";

interface State {
  compte: ComptePublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface ContextValue extends State {
  setCompte: (c: ComptePublic | null) => void;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const ComptePublicAuthContext = createContext<ContextValue | null>(null);

export function ComptePublicAuthProvider({ children }: { children: ReactNode }) {
  const [compte, setCompte] = useState<ComptePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await meComptePublicApi();
      setCompte(data);
    } catch {
      setCompte(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await logoutComptePublicApi();
    } catch {
      // ignore
    } finally {
      setCompte(null);
    }
  }, []);

  return (
    <ComptePublicAuthContext.Provider
      value={{ compte, isLoading, isAuthenticated: compte !== null, setCompte, logout, refreshMe }}
    >
      {children}
    </ComptePublicAuthContext.Provider>
  );
}

export function useComptePublicAuth(): ContextValue {
  const ctx = useContext(ComptePublicAuthContext);
  if (!ctx) throw new Error("useComptePublicAuth must be used inside <ComptePublicAuthProvider>");
  return ctx;
}
