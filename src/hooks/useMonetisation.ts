import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConfigApi,
  updateConfigApi,
  getAdminPlansApi,
  createPlanApi,
  updatePlanApi,
  deletePlanApi,
  getAdminAbonnementsApi,
  confirmerAbonnementApi,
  resilierAbonnementApi,
  getAdminMisesEnAvantApi,
  confirmerMiseEnAvantApi,
  getOwnerPlansApi,
  getOwnerAbonnementActifApi,
  getOwnerAbonnementsApi,
  souscrireAbonnementApi,
  getOwnerMisesEnAvantApi,
  demanderMiseEnAvantApi,
} from "@/api/monetisation";

// ─── Config ───────────────────────────────────────────────────────────────────

export function useConfigMonetisation() {
  return useQuery({
    queryKey: ["monetisation-config"],
    queryFn: getConfigApi,
  });
}

export function useUpdateConfigMonetisation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateConfigApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monetisation-config"] });
    },
  });
}

// ─── Plans (admin) ────────────────────────────────────────────────────────────

export function useAdminPlans() {
  return useQuery({
    queryKey: ["admin-plans"],
    queryFn: getAdminPlansApi,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlanApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["owner-plans"] });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePlanApi>[1] }) =>
      updatePlanApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["owner-plans"] });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePlanApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
    },
  });
}

// ─── Abonnements (admin) ──────────────────────────────────────────────────────

export function useAdminAbonnements(params?: { page?: number; limit?: number; statut?: string }) {
  return useQuery({
    queryKey: ["admin-abonnements", params],
    queryFn: () => getAdminAbonnementsApi(params),
  });
}

export function useConfirmerAbonnement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmerAbonnementApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-abonnements"] });
    },
  });
}

export function useResilierAbonnement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resilierAbonnementApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-abonnements"] });
    },
  });
}

// ─── Mises en avant (admin) ───────────────────────────────────────────────────

export function useAdminMisesEnAvant(params?: { page?: number; limit?: number; statut?: string }) {
  return useQuery({
    queryKey: ["admin-mises-en-avant", params],
    queryFn: () => getAdminMisesEnAvantApi(params),
  });
}

export function useConfirmerMiseEnAvant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmerMiseEnAvantApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-mises-en-avant"] });
    },
  });
}

// ─── Owner : plans ────────────────────────────────────────────────────────────

export function useOwnerPlans() {
  return useQuery({
    queryKey: ["owner-plans"],
    queryFn: getOwnerPlansApi,
  });
}

// ─── Owner : abonnement ───────────────────────────────────────────────────────

export function useOwnerAbonnementActif() {
  return useQuery({
    queryKey: ["owner-abonnement-actif"],
    queryFn: getOwnerAbonnementActifApi,
  });
}

export function useOwnerAbonnements() {
  return useQuery({
    queryKey: ["owner-abonnements"],
    queryFn: getOwnerAbonnementsApi,
  });
}

export function useSouscrireAbonnement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: souscrireAbonnementApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-abonnement-actif"] });
      qc.invalidateQueries({ queryKey: ["owner-abonnements"] });
    },
  });
}

// ─── Owner : mises en avant ───────────────────────────────────────────────────

export function useOwnerMisesEnAvant() {
  return useQuery({
    queryKey: ["owner-mises-en-avant"],
    queryFn: getOwnerMisesEnAvantApi,
  });
}

export function useDemanderMiseEnAvant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bienId, data }: { bienId: string; data: Parameters<typeof demanderMiseEnAvantApi>[1] }) =>
      demanderMiseEnAvantApi(bienId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-mises-en-avant"] });
    },
  });
}
