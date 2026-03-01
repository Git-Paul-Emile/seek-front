import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBailActifApi,
  creerBailApi,
  annulerBailApi,
  terminerBailApi,
  resilierBailApi,
  prolongerBailApi,
  getEcheancierApi,
  payerEcheanceApi,
  payerMoisMultiplesApi,
  getCautionApi,
  restituerCautionApi,
  getMobileMoneyApi,
  getSoldeApi,
  mettreEnPreavisApi,
  mettreEnRenouvellementApi,
  archiverBailApi,
  getBailAArchiverApi,
  prolongerEcheancesAnneeApi,
  type CreateBailPayload,
  type PayerEcheancePayload,
  type PayerMoisMultiplesPayload,
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

export const useAnnulerBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      annulerBailApi(bienId, bailId),
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

// ─── Échéancier ───────────────────────────────────────────────────────────────

export const useEcheancier = (bienId: string, bailId: string) =>
  useQuery({
    queryKey: ["echeancier", bailId],
    queryFn: () => getEcheancierApi(bienId, bailId),
    enabled: !!bienId && !!bailId,
    staleTime: 60 * 1000,
  });

export const usePayerEcheance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId, bailId, echeanceId, payload,
    }: { bienId: string; bailId: string; echeanceId: string; payload: PayerEcheancePayload }) =>
      payerEcheanceApi(bienId, bailId, echeanceId, payload),
    onSuccess: (_data, { bailId }) => {
      qc.invalidateQueries({ queryKey: ["echeancier", bailId] });
    },
  });
};

// ─── Caution ──────────────────────────────────────────────────────────────────

export const useCaution = (bienId: string, bailId: string) =>
  useQuery({
    queryKey: ["caution", bailId],
    queryFn: () => getCautionApi(bienId, bailId),
    enabled: !!bienId && !!bailId,
    staleTime: 2 * 60 * 1000,
  });

export const useRestituerCaution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId, bailId, payload,
    }: { bienId: string; bailId: string; payload: { montantRestitue: number; motifRetenue?: string; dateRestitution?: string } }) =>
      restituerCautionApi(bienId, bailId, payload),
    onSuccess: (_data, { bailId }) => {
      qc.invalidateQueries({ queryKey: ["caution", bailId] });
    },
  });
};

// ─── Mobile Money ─────────────────────────────────────────────────────────────

export const useMobileMoney = (bienId: string) =>
  useQuery({
    queryKey: ["mobile-money", bienId],
    queryFn: () => getMobileMoneyApi(bienId),
    enabled: !!bienId,
    staleTime: 10 * 60 * 1000,
  });

// ─── Solde ────────────────────────────────────────────────────────────────────

export const useSolde = (bienId: string, bailId: string) =>
  useQuery({
    queryKey: ["solde", bailId],
    queryFn: () => getSoldeApi(bienId, bailId),
    enabled: !!bienId && !!bailId,
    staleTime: 60 * 1000,
  });

export const usePayerEcheanceAvecInvalidation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId, bailId, echeanceId, payload,
    }: { bienId: string; bailId: string; echeanceId: string; payload: PayerEcheancePayload }) =>
      payerEcheanceApi(bienId, bailId, echeanceId, payload),
    onSuccess: (_data, { bailId }) => {
      qc.invalidateQueries({ queryKey: ["echeancier", bailId] });
      qc.invalidateQueries({ queryKey: ["solde", bailId] });
    },
  });
};

export const usePayerMoisMultiples = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bienId, bailId, payload,
    }: { bienId: string; bailId: string; payload: PayerMoisMultiplesPayload }) =>
      payerMoisMultiplesApi(bienId, bailId, payload),
    onSuccess: (_data, { bailId }) => {
      qc.invalidateQueries({ queryKey: ["echeancier", bailId] });
      qc.invalidateQueries({ queryKey: ["solde", bailId] });
    },
  });
};

// ─── Fin de bail ──────────────────────────────────────────────────────────────

export const useBailAArchiver = (bienId: string) =>
  useQuery({
    queryKey: [QK + "_a_archiver", bienId],
    queryFn: () => getBailAArchiverApi(bienId),
    enabled: !!bienId,
    staleTime: 60 * 1000,
  });

export const useMettreEnPreavis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      mettreEnPreavisApi(bienId, bailId),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
    },
  });
};

export const useMettreEnRenouvellement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      mettreEnRenouvellementApi(bienId, bailId),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
    },
  });
};

export const useProlongerEcheancesAnnee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId, anneeActuelle }: { bienId: string; bailId: string; anneeActuelle: number }) =>
      prolongerEcheancesAnneeApi(bienId, bailId, anneeActuelle),
    onSuccess: (_data, { bailId }) => {
      qc.invalidateQueries({ queryKey: ["echeancier", bailId] });
      qc.invalidateQueries({ queryKey: ["solde", bailId] });
    },
  });
};

export const useArchiverBail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, bailId }: { bienId: string; bailId: string }) =>
      archiverBailApi(bienId, bailId),
    onSuccess: (_data, { bienId }) => {
      qc.invalidateQueries({ queryKey: [QK, bienId] });
      qc.invalidateQueries({ queryKey: [QK + "_a_archiver", bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS, bienId] });
      qc.invalidateQueries({ queryKey: [QK_BIENS] });
    },
  });
};
