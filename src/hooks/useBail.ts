import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBailActifApi,
  creerBailApi,
  terminerBailApi,
  resilierBailApi,
  prolongerBailApi,
  type CreateBailPayload,
} from "@/api/bail";

const QK = "bail";
const QK_BIENS = "biens";

export const useBailActif = (bienId: string) =>
  useQuery({
    queryKey: [QK, bienId],
    queryFn: () => getBailActifApi(bienId),
    enabled: !!bienId,
    staleTime: 2 * 60 * 1000,
  });

export const useCreerBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, payload }: { bienId: string; payload: CreateBailPayload }) =>
      creerBailApi(bienId, payload),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS] });
    },
  });
};

export const useTerminerBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      terminerBailApi(bienId, bailId),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS] });
    },
  });
};

export const useResilierBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      resilierBailApi(bienId, bailId),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS] });
    },
  });
};

export const useProlongerBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId,
      bailId,
      dateFinBail,
    }: {
      bienId: string;
      bailId: string;
      dateFinBail: string;
    }) => prolongerBailApi(bienId, bailId, dateFinBail),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
    },
  });
};
