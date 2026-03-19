/**
 * useFavoris — Favoris stockés en base.
 * Nécessite un compte public (ComptePublic) authentifié.
 * Retourne aussi `isAuthenticated` pour savoir si l'utilisateur est connecté.
 */

import { useState, useEffect, useCallback } from "react";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { getFavoriIdsApi, toggleFavoriApi, removeFavoriApi } from "@/api/favori";
import { useFavorisAuthModal } from "@/context/FavorisAuthModalContext";

export function useFavoris() {
  const { isAuthenticated, isLoading: authLoading } = useComptePublicAuth();
  const { getPendingBienId, clearPendingBienId } = useFavorisAuthModal();
  const [ids, setIds] = useState<string[]>([]);
  const [idsLoaded, setIdsLoaded] = useState(false);

  // Charger les IDs depuis l'API dès que l'auth est connue.
  // Si un bien était en attente (cliqué avant connexion), le toggler d'abord.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIds([]);
      setIdsLoaded(true);
      return;
    }

    const pendingId = getPendingBienId();
    if (pendingId) clearPendingBienId();

    (async () => {
      try {
        if (pendingId) await toggleFavoriApi(pendingId);
        const apiIds = await getFavoriIdsApi();
        setIds(apiIds);
      } catch {
        setIds([]);
      } finally {
        setIdsLoaded(true);
      }
    })();
  }, [isAuthenticated, authLoading, getPendingBienId, clearPendingBienId]);

  const isFavori = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavori = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return; // caller doit gérer la modale d'auth
      const result = await toggleFavoriApi(id);
      setIds((prev) =>
        result.action === "added" ? [...prev, id] : prev.filter((x) => x !== id)
      );
    },
    [isAuthenticated]
  );

  const removeFavori = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      await removeFavoriApi(id);
      setIds((prev) => prev.filter((x) => x !== id));
    },
    [isAuthenticated]
  );

  return {
    ids,
    count: ids.length,
    idsLoaded,
    isAuthenticated,
    isFavori,
    toggleFavori,
    removeFavori,
  };
}
