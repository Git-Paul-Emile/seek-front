import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAnnoncesPendingCount,
  fetchAnnoncesAdmin,
  fetchAnnoncesStatusCounts,
  validerAnnonce,
  deleteAnnonceAdmin,
  type StatutAnnonce,
} from "@/api/bien";

const QK_COUNT = "annonces-pending-count";
const QK_COUNTS = "annonces-status-counts";
const QK_LIST = "annonces-admin";

export const useAnnoncesPendingCount = () =>
  useQuery({
    queryKey: [QK_COUNT],
    queryFn: fetchAnnoncesPendingCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

export const useAnnoncesStatusCounts = () =>
  useQuery({
    queryKey: [QK_COUNTS],
    queryFn: fetchAnnoncesStatusCounts,
    staleTime: 30 * 1000,
  });

export const useAnnoncesAdmin = (params?: {
  statut?: StatutAnnonce;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: [QK_LIST, params],
    queryFn: () => fetchAnnoncesAdmin(params),
    staleTime: 30 * 1000,
  });

export const useValiderAnnonce = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "APPROUVER" | "REJETER" | "REVISION";
      note?: string;
    }) => validerAnnonce(id, action, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK_LIST] });
      qc.invalidateQueries({ queryKey: [QK_COUNT] });
      qc.invalidateQueries({ queryKey: [QK_COUNTS] });
    },
  });
};

export const useDeleteAnnonceAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnnonceAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK_LIST] });
      qc.invalidateQueries({ queryKey: [QK_COUNT] });
      qc.invalidateQueries({ queryKey: [QK_COUNTS] });
    },
  });
};
