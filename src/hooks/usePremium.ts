import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFormulesPremium,
  payerEtActiverPremium,
  arreterPremium,
  adminGetFormules,
  adminCreateFormule,
  adminUpdateFormule,
  adminDeleteFormule,
  adminGetHistoriquePromotions,
  adminGetStatsPromotions,
  type FormulePremium,
  type FormulePremiumFull,
  type MoyenPaiement
} from "@/api/premium";
import {
  getHistoriqueTransactions,
  getAdminHistoriqueTransactions,
  getAdminStatsTransactions,
  type Transaction
} from "@/api/transaction";
import { toast } from "sonner";

/**
 * Hook pour récupérer les formules premium et les moyens de paiement
 */
export const useFormulesPremium = () => {
  return useQuery({
    queryKey: ["formules-premium"],
    queryFn: async () => {
      const result = await getFormulesPremium();
      return result;
    },
  });
};

/**
 * Hook pour payer et activer la mise en avant premium
 */
export const usePayerPremium = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bienId, formuleId, modePaiement, ownerId }: { bienId: string; formuleId: string; modePaiement: string; ownerId: string }) =>
      payerEtActiverPremium(bienId, formuleId, modePaiement, ownerId),
    onSuccess: (data) => {
      toast.success("Paiement effectué avec succès ! Votre annonce est maintenant mise en avant.");
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ["biens"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-status"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-stats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du paiement");
    },
  });
};

/**
 * Hook pour arrêter la mise en avant premium
 */
export const useArreterPremium = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bienId, ownerId }: { bienId: string; ownerId: string }) =>
      arreterPremium(bienId, ownerId),
    onSuccess: (data) => {
      toast.success(data.message || "Mise en avant arrêtée avec succès.");
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ["biens"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-status"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-stats"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'arrêt de la mise en avant");
    },
  });
};

/**
 * Hook pour récupérer l'historique de tous les paiements du propriétaire
 */
export const useHistoriqueTransactions = (ownerId: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: ["transactions", ownerId, page, limit],
    queryFn: async () => {
      const result = await getHistoriqueTransactions(ownerId, page, limit);
      return result;
    },
    enabled: !!ownerId,
  });
};

// ─── Admin Formules Premium ───────────────────────────────────────────────────

export const useAdminFormules = () =>
  useQuery({ queryKey: ["admin-formules"], queryFn: adminGetFormules });

export const useAdminCreateFormule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FormulePremiumFull>) => adminCreateFormule(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-formules"] }),
  });
};

export const useAdminUpdateFormule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormulePremiumFull> }) => adminUpdateFormule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-formules"] }),
  });
};

export const useAdminDeleteFormule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteFormule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-formules"] }),
  });
};

// ─── Admin Historique Promotions ──────────────────────────────────────────────

export const useAdminHistoriquePromotions = (params?: {
  page?: number;
  limit?: number;
  statut?: string;
  proprietaireId?: string;
}) =>
  useQuery({
    queryKey: ["admin-historique-promotions", params],
    queryFn: () => adminGetHistoriquePromotions(params),
  });

export const useAdminStatsPromotions = () =>
  useQuery({ queryKey: ["admin-stats-promotions"], queryFn: adminGetStatsPromotions });

// ─── Admin Historique Transactions ────────────────────────────────────────────

export const useAdminHistoriqueTransactions = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  statut?: string;
  proprietaireId?: string;
  dateDebut?: string;
  dateFin?: string;
}) =>
  useQuery({
    queryKey: ["admin-historique-transactions", params],
    queryFn: () => getAdminHistoriqueTransactions(params),
  });

export const useAdminStatsTransactions = () =>
  useQuery({ queryKey: ["admin-stats-transactions"], queryFn: getAdminStatsTransactions });

// Type pour l'affichage
export type { FormulePremium, FormulePremiumFull, MoyenPaiement, Transaction };
