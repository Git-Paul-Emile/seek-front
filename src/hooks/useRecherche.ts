import { useQuery } from "@tanstack/react-query";
import {
  fetchRecherchePublique,
  fetchLieux,
  type RechercheParams,
  type RechercheResult,
  type LieuxData,
} from "@/api/bien";

export const useRecherchePublique = (params: RechercheParams) =>
  useQuery<RechercheResult>({
    queryKey: ["recherche-publique", params],
    queryFn: () => fetchRecherchePublique(params),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useLieux = () =>
  useQuery<LieuxData>({
    queryKey: ["lieux-publics"],
    queryFn: fetchLieux,
    staleTime: 5 * 60 * 1000,
  });
