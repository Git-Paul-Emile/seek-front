import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import FavorisAuthModal from "@/components/FavorisAuthModal";

interface ContextValue {
  openModal: (onSuccess?: () => void) => void;
}

const FavorisAuthModalContext = createContext<ContextValue | null>(null);

export function FavorisAuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(undefined);

  const openModal = useCallback((successCb?: () => void) => {
    setOnSuccess(() => successCb);
    setOpen(true);
  }, []);

  return (
    <FavorisAuthModalContext.Provider value={{ openModal }}>
      {children}
      {open && (
        <FavorisAuthModal
          onClose={() => setOpen(false)}
          onSuccess={() => { onSuccess?.(); setOpen(false); }}
        />
      )}
    </FavorisAuthModalContext.Provider>
  );
}

export function useFavorisAuthModal(): ContextValue {
  const ctx = useContext(FavorisAuthModalContext);
  if (!ctx) throw new Error("useFavorisAuthModal must be used inside <FavorisAuthModalProvider>");
  return ctx;
}
