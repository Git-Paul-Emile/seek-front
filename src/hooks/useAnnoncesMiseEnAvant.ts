import { useQuery } from "@tanstack/react-query";
import { fetchAnnoncesMiseEnAvant, type AnnonceMiseEnAvant, type MiseEnAvantResponse } from "@/api/promotion";

// Rotation backend toutes les 30 min - on refetch toutes les 10 min
const REFETCH_INTERVAL_MS = 10 * 60 * 1000;

export const useAnnoncesMiseEnAvant = (limit: number = 6) =>
  useQuery<MiseEnAvantResponse>({
    queryKey: ["annonces-mise-en-avant", limit],
    queryFn: () => fetchAnnoncesMiseEnAvant(limit),
    staleTime: 5 * 60 * 1000, // 5 min
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 1,
  });

// Type exporté pour utilisation dans les composants
export type { AnnonceMiseEnAvant };
