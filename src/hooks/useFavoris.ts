/**
 * useFavoris — Favoris stockés en base.
 * Nécessite un compte public (ComptePublic) authentifié.
 * Retourne aussi `isAuthenticated` pour savoir si l'utilisateur est connecté.
 */

import { useState, useEffect, useCallback } from "react";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import { getFavoriIdsApi, toggleFavoriApi, removeFavoriApi } from "@/api/favori";

export function useFavoris() {
  const { isAuthenticated, isLoading: authLoading } = useComptePublicAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [idsLoaded, setIdsLoaded] = useState(false);

  // Charger les IDs depuis l'API dès que l'auth est connue
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setIds([]);
      setIdsLoaded(true);
      return;
    }

    getFavoriIdsApi()
      .then((apiIds) => { setIds(apiIds); setIdsLoaded(true); })
      .catch(() => { setIds([]); setIdsLoaded(true); });
  }, [isAuthenticated, authLoading]);

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
