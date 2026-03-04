import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/premium`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormulePremium {
  id: string;
  nom: string;
  dureeJours: number;
  prix: number;
  accroche: string;
  description: string;
  idealPour: string[];
  populer: boolean;
}

export interface MoyenPaiement {
  id: string;
  nom: string;
  logo: string;
  description: string;
  couleur: string;
}

export interface PaiementResult {
  transactionId: string;
  montant: number;
  modePaiement: string;
  datePaiement: string;
}

export interface PromotionResult {
  bienId: string;
  estMisEnAvant: boolean;
  dateDebutPromotion: string | null;
  dateFinPromotion: string | null;
}

export interface PremiumResponse {
  status: string;
  message: string;
  data: {
    paiement: PaiementResult;
    promotion: PromotionResult;
  };
}

export interface FormulesResponse {
  status: string;
  message: string;
  data: {
    formules: FormulePremium[];
    moyenPaiement: MoyenPaiement[];
  };
}

// Types pour l'historique des promotions
export interface PromotionHistory {
  id: string;
  bienId: string;
  proprietaireId: string;
  transactionId: string | null;
  formuleId: string;
  formuleNom: string;
  dureeJours: number;
  montant: number;
  dateDebut: string;
  dateFin: string;
  dateFinReelle: string | null;
  statut: "ACTIVE" | "TERMINEE" | "ARRETEE" | "EXPIREE";
  motifArret: string | null;
  joursRestants: number | null;
  createdAt: string;
  bien?: {
    id: string;
    titre: string;
    photos: string[];
    ville: string | null;
    quartier: string | null;
  };
}

export interface HistoriqueResponse {
  status: string;
  message: string;
  data: PromotionHistory[];
}

export interface HistoriquePaginatedResponse {
  status: string;
  message: string;
  data: {
    data: PromotionHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Récupère les formules premium et les moyens de paiement disponibles
 */
export const getFormulesPremium = (): Promise<{ formules: FormulePremium[]; moyenPaiement: MoyenPaiement[] }> =>
  api.get<{ status: string; message: string; data: { formules: FormulePremium[]; moyenPaiement: MoyenPaiement[] } }>("/formules").then((r) => r.data.data);

/**
 * Simule le paiement et active la mise en avant premium
 */
export const payerEtActiverPremium = (
  bienId: string,
  formuleId: string,
  modePaiement: string,
  ownerId: string
): Promise<PremiumResponse> =>
  api
    .post<{ data: PremiumResponse }>(`/${bienId}/payer`, {
      formuleId,
      modePaiement,
    }, {
      headers: {
        'x-owner-id': ownerId,
      },
    })
    .then((r) => r.data.data);

/**
 * Récupère les moyens de paiement disponibles
 */
export const getMoyensPaiement = (): Promise<MoyenPaiement[]> =>
  api.get<{ data: MoyenPaiement[] }>("/paiements").then((r) => r.data.data);

/**
 * Arrête la mise en avant d'un bien
 */
export const arreterPremium = (
  bienId: string,
  ownerId: string
): Promise<{ success: boolean; message: string }> =>
  api
    .post<{ data: { success: boolean; message: string } }>(`/${bienId}/arreter`, {}, {
      headers: {
        'x-owner-id': ownerId,
      },
    })
    .then((r) => r.data.data);

/**
 * Récupère l'historique des mises en avant d'un bien
 */
export const getHistoriqueMisesEnAvant = (
  bienId: string,
  ownerId: string
): Promise<PromotionHistory[]> =>
  api
    .get<{ data: PromotionHistory[] }>(`/${bienId}/historique`, {
      headers: {
        'x-owner-id': ownerId,
      },
    })
    .then((r) => r.data.data);

/**
 * Récupère l'historique de tous les paiements premium du propriétaire
 */
export const getHistoriquePaiementsPremium = (
  ownerId: string,
  page?: number,
  limit?: number
): Promise<{ data: PromotionHistory[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> =>
  api
    .get<{ data: { data: PromotionHistory[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>("/historique", {
      params: { page, limit },
      headers: {
        'x-owner-id': ownerId,
      },
    })
    .then((r) => r.data.data);
