import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSignalementsAdmin,
  getSignalementCount,
  getSignalementDetail,
  traiterSignalement,
} from "@/api/signalement";

export function useSignalementsAdmin(params?: {
  statut?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["signalements-admin", params],
    queryFn: () => getSignalementsAdmin(params),
  });
}

export function useSignalementCount() {
  return useQuery({
    queryKey: ["signalement-count"],
    queryFn: getSignalementCount,
    staleTime: 60_000,
    refetchInterval: 10 * 1000,
  });
}

export function useSignalementDetail(id: string) {
  return useQuery({
    queryKey: ["signalement", id],
    queryFn: () => getSignalementDetail(id),
    enabled: !!id,
  });
}

export function useTraiterSignalement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: string;
      note?: string;
    }) => traiterSignalement(id, action, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["signalements-admin"] });
      qc.invalidateQueries({ queryKey: ["signalement", id] });
      qc.invalidateQueries({ queryKey: ["signalement-count"] });
    },
  });
}
