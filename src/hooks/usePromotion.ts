import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activatePromotion,
  deactivatePromotion,
  extendPromotion,
  getPromotionStats,
  getPromotionStatus,
} from "@/api/promotion";
import { toast } from "sonner";

/**
 * Hook pour récupérer le statut de promotion d'un bien
 */
export const usePromotionStatus = (bienId: string) => {
  return useQuery({
    queryKey: ["promotion-status", bienId],
    queryFn: () => getPromotionStatus(bienId),
    enabled: !!bienId,
  });
};

/**
 * Hook pour récupérer les statistiques de promotion du propriétaire
 */
export const usePromotionStats = () => {
  return useQuery({
    queryKey: ["promotion-stats"],
    queryFn: getPromotionStats,
  });
};

/**
 * Hook pour activer la promotion d'un bien
 */
export const useActivatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bienId, dureeJours }: { bienId: string; dureeJours?: number }) =>
      activatePromotion(bienId, dureeJours),
    onSuccess: () => {
      toast.success("Annonce mise en avant avec succès !");
      queryClient.invalidateQueries({ queryKey: ["biens"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'activation de la promotion");
    },
  });
};

/**
 * Hook pour désactiver la promotion d'un bien
 */
export const useDeactivatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bienId: string) => deactivatePromotion(bienId),
    onSuccess: () => {
      toast.success("Promotion désactivée");
      queryClient.invalidateQueries({ queryKey: ["biens"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la désactivation de la promotion");
    },
  });
};

/**
 * Hook pour prolonger la promotion d'un bien
 */
export const useExtendPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bienId, joursSupplementaires }: { bienId: string; joursSupplementaires?: number }) =>
      extendPromotion(bienId, joursSupplementaires),
    onSuccess: () => {
      toast.success("Promotion prolongée avec succès !");
      queryClient.invalidateQueries({ queryKey: ["promotion-status"] });
      queryClient.invalidateQueries({ queryKey: ["promotion-stats"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la prolongation de la promotion");
    },
  });
};
