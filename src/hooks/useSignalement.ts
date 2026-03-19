import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSignalementCount,
  getBiensSignalesAdmin,
  getBienSignaleDetail,
  rejeterSignalementsApi,
  avertirProprietaireApi,
  sanctionnerAnnonceApi,
  createSignalementApi,
  type PrioriteSignalement,
  type CreateSignalementPayload,
} from "@/api/signalement";
import { toast } from "sonner";

// ─── Badge sidebar ────────────────────────────────────────────────────────────

export const useSignalementCount = () =>
  useQuery({
    queryKey: ["signalement-count"],
    queryFn:  getSignalementCount,
    refetchInterval: 60_000,
  });

// ─── Admin — liste biens signalés ─────────────────────────────────────────────

export const useBiensSignales = (params?: {
  page?:     number;
  limit?:    number;
  priorite?: PrioriteSignalement;
}) =>
  useQuery({
    queryKey: ["biens-signales", params],
    queryFn:  () => getBiensSignalesAdmin(params),
  });

// ─── Admin — détail d'un bien signalé ────────────────────────────────────────

export const useBienSignaleDetail = (bienId: string | null) =>
  useQuery({
    queryKey: ["bien-signale-detail", bienId],
    queryFn:  () => getBienSignaleDetail(bienId!),
    enabled:  !!bienId,
  });

// ─── Admin — rejeter ─────────────────────────────────────────────────────────

export const useRejeterSignalements = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bienId: string) => rejeterSignalementsApi(bienId),
    onSuccess: () => {
      toast.success("Signalements rejetés. Compteur remis à zéro.");
      qc.invalidateQueries({ queryKey: ["biens-signales"] });
      qc.invalidateQueries({ queryKey: ["signalement-count"] });
    },
    onError: () => toast.error("Erreur lors du rejet."),
  });
};

// ─── Admin — avertir ─────────────────────────────────────────────────────────

export const useAvertirProprietaire = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, message }: { bienId: string; message: string }) =>
      avertirProprietaireApi(bienId, message),
    onSuccess: () => {
      toast.success("Avertissement envoyé au propriétaire.");
      qc.invalidateQueries({ queryKey: ["biens-signales"] });
      qc.invalidateQueries({ queryKey: ["bien-signale-detail"] });
    },
    onError: () => toast.error("Erreur lors de l'envoi."),
  });
};

// ─── Admin — sanctionner ─────────────────────────────────────────────────────

export const useSanctionnerAnnonce = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bienId: string) => sanctionnerAnnonceApi(bienId),
    onSuccess: () => {
      toast.success("Annonce supprimée définitivement.");
      qc.invalidateQueries({ queryKey: ["biens-signales"] });
      qc.invalidateQueries({ queryKey: ["signalement-count"] });
    },
    onError: () => toast.error("Erreur lors de la sanction."),
  });
};

// ─── Public — créer un signalement ───────────────────────────────────────────

export const useCreateSignalement = (bienId: string) => {
  return useMutation({
    mutationFn: (payload: CreateSignalementPayload) =>
      createSignalementApi(bienId, payload),
    onSuccess: () => toast.success("Merci, votre signalement est en cours de traitement."),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Erreur lors du signalement.";
      toast.error(msg);
    },
  });
};
