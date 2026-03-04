import { useQuery } from "@tanstack/react-query";
import { fetchAnnoncesMiseEnAvant, type AnnonceMiseEnAvant, type MiseEnAvantResponse } from "@/api/promotion";

export const useAnnoncesMiseEnAvant = (limit: number = 6) =>
  useQuery<MiseEnAvantResponse>({
    queryKey: ["annonces-mise-en-avant", limit],
    queryFn: () => fetchAnnoncesMiseEnAvant(limit),
    staleTime: 2 * 60 * 1000, // 2 min
  });

// Type exporté pour utilisation dans les composants
export type { AnnonceMiseEnAvant };
