import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/monetisation`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfigMonetisation {
  id: string;
  miseEnAvantActive: boolean;
  commissionActive: boolean;
  abonnementActive: boolean;
  tauxCommission: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanAbonnement {
  id: string;
  nom: string;
  prix: number;
  maxAnnonces: number | null;
  actif: boolean;
  ordre: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StatutAbonnement = "EN_ATTENTE" | "ACTIF" | "EXPIRE" | "RESILIE";

export interface AbonnementProprietaire {
  id: string;
  proprietaireId: string;
  planId: string;
  statut: StatutAbonnement;
  dateDebut: string;
  dateFin: string;
  montant: number;
  modePaiement: string | null;
  reference: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  plan: PlanAbonnement;
  proprietaire?: {
    id: string;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string;
  };
}

export type StatutPromotion = "EN_ATTENTE" | "ACTIVE" | "TERMINEE" | "ARRETEE" | "EXPIREE";

export interface MiseEnAvant {
  id: string;
  bienId: string;
  proprietaireId: string;
  formuleId: string;
  formuleNom: string;
  dureeJours: number;
  montant: number;
  dateDebut: string;
  dateFin: string;
  statut: StatutPromotion;
  modePaiement: string | null;
  reference: string | null;
  note: string | null;
  confirmeParAdmin: boolean;
  dateConfirmation: string | null;
  createdAt: string;
  updatedAt: string;
  bien?: { id: string; titre: string | null; ville: string | null };
  proprietaire?: { id: string; nom: string; prenom: string; email: string | null };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const getConfigApi = async (): Promise<ConfigMonetisation> => {
  const res = await api.get("/admin/config");
  return res.data.data;
};

export const updateConfigApi = async (data: Partial<Pick<ConfigMonetisation,
  "miseEnAvantActive" | "commissionActive" | "abonnementActive" | "tauxCommission"
>>): Promise<ConfigMonetisation> => {
  const res = await api.put("/admin/config", data);
  return res.data.data;
};

// ─── Plans (admin) ────────────────────────────────────────────────────────────

export const getAdminPlansApi = async (): Promise<PlanAbonnement[]> => {
  const res = await api.get("/admin/plans");
  return res.data.data;
};

export const createPlanApi = async (data: {
  nom: string;
  prix: number;
  maxAnnonces?: number | null;
  actif?: boolean;
  ordre?: number;
  description?: string | null;
}): Promise<PlanAbonnement> => {
  const res = await api.post("/admin/plans", data);
  return res.data.data;
};

export const updatePlanApi = async (id: string, data: {
  nom?: string;
  prix?: number;
  maxAnnonces?: number | null;
  actif?: boolean;
  ordre?: number;
  description?: string | null;
}): Promise<PlanAbonnement> => {
  const res = await api.put(`/admin/plans/${id}`, data);
  return res.data.data;
};

export const deletePlanApi = async (id: string): Promise<void> => {
  await api.delete(`/admin/plans/${id}`);
};

// ─── Abonnements (admin) ──────────────────────────────────────────────────────

export const getAdminAbonnementsApi = async (params?: {
  page?: number;
  limit?: number;
  statut?: string;
}): Promise<PaginatedResponse<AbonnementProprietaire>> => {
  const res = await api.get("/admin/abonnements", { params });
  return { data: res.data.data, meta: res.data.meta };
};

export const confirmerAbonnementApi = async (id: string): Promise<AbonnementProprietaire> => {
  const res = await api.patch(`/admin/abonnements/${id}/confirmer`);
  return res.data.data;
};

export const resilierAbonnementApi = async (id: string): Promise<AbonnementProprietaire> => {
  const res = await api.patch(`/admin/abonnements/${id}/resilier`);
  return res.data.data;
};

// ─── Mises en avant (admin) ───────────────────────────────────────────────────

export const getAdminMisesEnAvantApi = async (params?: {
  page?: number;
  limit?: number;
  statut?: string;
}): Promise<PaginatedResponse<MiseEnAvant>> => {
  const res = await api.get("/admin/mises-en-avant", { params });
  return { data: res.data.data, meta: res.data.meta };
};

export const confirmerMiseEnAvantApi = async (id: string): Promise<MiseEnAvant> => {
  const res = await api.patch(`/admin/mises-en-avant/${id}/confirmer`);
  return res.data.data;
};

// ─── Owner : plans ────────────────────────────────────────────────────────────

export const getOwnerPlansApi = async (): Promise<PlanAbonnement[]> => {
  const res = await api.get("/owner/plans");
  return res.data.data;
};

// ─── Owner : abonnement ───────────────────────────────────────────────────────

export const getOwnerAbonnementActifApi = async (): Promise<AbonnementProprietaire | null> => {
  const res = await api.get("/owner/abonnement");
  return res.data.data;
};

export const getOwnerAbonnementsApi = async (): Promise<AbonnementProprietaire[]> => {
  const res = await api.get("/owner/abonnements");
  return res.data.data;
};

export const souscrireAbonnementApi = async (data: {
  planId: string;
  modePaiement: string;
  reference: string;
  note?: string;
}): Promise<AbonnementProprietaire> => {
  const res = await api.post("/owner/abonnement/souscrire", data);
  return res.data.data;
};

// ─── Owner : mises en avant ───────────────────────────────────────────────────

export const getOwnerMisesEnAvantApi = async (): Promise<MiseEnAvant[]> => {
  const res = await api.get("/owner/mises-en-avant");
  return res.data.data;
};

export const demanderMiseEnAvantApi = async (bienId: string, data: {
  formuleId: string;
  modePaiement: string;
  reference: string;
  note?: string;
}): Promise<MiseEnAvant> => {
  const res = await api.post(`/owner/biens/${bienId}/mise-en-avant`, data);
  return res.data.data;
};
