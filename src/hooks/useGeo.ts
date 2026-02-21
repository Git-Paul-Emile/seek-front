import { useQuery } from "@tanstack/react-query";
import { fetchPays, fetchVilles } from "@/api/geo";

export const usePays = () =>
  useQuery({ queryKey: ["pays"], queryFn: fetchPays, staleTime: 10 * 60 * 1000 });

export const useVilles = (paysId: string | null) =>
  useQuery({
    queryKey: ["villes", paysId],
    queryFn: () => fetchVilles(paysId!),
    enabled: !!paysId,
    staleTime: 10 * 60 * 1000,
  });
