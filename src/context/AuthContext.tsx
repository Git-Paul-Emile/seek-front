import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import axios from "axios";
import { loginApi, logoutApi, meApi, refreshApi, type AdminInfo } from "@/api/auth";

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

  // Tenter de restaurer la session via /me au montage
  useEffect(() => {
    (async () => {
      try {
        const { data } = await meApi();
        setAdmin(data.data);
      } catch {
        // Pas de session active — tenter un refresh silencieux
        try {
          await refreshApi();
          const { data } = await meApi();
          setAdmin(data.data);
        } catch {
          setAdmin(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginApi({ email, password });
    const { data } = await meApi();
    setAdmin(data.data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // On déconnecte quand même côté client
    } finally {
      setAdmin(null);
    }
  }, []);

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
