import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/promotions`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PromotionStatus {
  bienId: string;
  estMisEnAvant: boolean;
  dateDebutPromotion: string | null;
  dateFinPromotion: string | null;
  positionRotation: number;
  dernierAffichage: string | null;
  joursRestants: number;
}

export interface PromotionStats {
  totalAnnoncesPubliees: number;
  annoncesActualmenteMiseEnAvant: number;
  historiquePromotions: number;
  configuration: {
    nbAnnoncesParPage: number;
    intervalleRotationMinutes: number;
  };
}

export interface PromotionResult {
  success: boolean;
  message: string;
  data: {
    bienId: string;
    titre: string | null;
    estMisEnAvant: boolean;
    dateDebutPromotion: string | null;
    dateFinPromotion: string | null;
    positionRotation: number;
  };
}

export interface DesactivateResult {
  success: boolean;
  message: string;
  data: {
    bienId: string;
    estMisEnAvant: boolean;
  };
}

export interface ExtendResult {
  success: boolean;
  message: string;
  data: {
    nouvelleDateFin: string | null;
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Active la mise en avant d'un bien
 */
export const activatePromotion = (
  bienId: string,
  dureeJours?: number
): Promise<PromotionResult> =>
  api
    .post<{ data: PromotionResult }>(`/${bienId}/activer`, { dureeJours })
    .then((r) => r.data.data);

/**
 * Désactive la mise en avant d'un bien
 */
export const deactivatePromotion = (bienId: string): Promise<DesactivateResult> =>
  api
    .post<{ data: DesactivateResult }>(`/${bienId}/desactiver`)
    .then((r) => r.data.data);

/**
 * Récupère le statut de mise en avant d'un bien
 */
export const getPromotionStatus = (bienId: string): Promise<PromotionStatus> =>
  api.get<{ data: PromotionStatus }>(`/${bienId}/statut`).then((r) => r.data.data);

/**
 * Récupère les statistiques de promotion du propriétaire
 */
export const getPromotionStats = (): Promise<PromotionStats> =>
  api.get<{ data: PromotionStats }>("/stats").then((r) => r.data.data);

/**
 * Prolonge la mise en avant d'un bien
 */
export const extendPromotion = (
  bienId: string,
  joursSupplementaires?: number
): Promise<ExtendResult> =>
  api
    .post<{ data: ExtendResult }>(`/${bienId}/prolonger`, { joursSupplementaires })
    .then((r) => r.data.data);
