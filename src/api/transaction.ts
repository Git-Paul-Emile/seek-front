import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/transactions`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  proprietaireId: string;
  type: string;
  statut: string;
  montant: number;
  devise: string;
  modePaiement: string;
  provider?: string;
  transactionId?: string;
  dateInitiation: string;
  dateConfirmation?: string;
  bienId?: string;
  bailId?: string;
  echeanceId?: string;
  locataireId?: string;
  metadata?: {
    formuleId?: string;
    formuleNom?: string;
    dureeJours?: number;
  };
  bien?: {
    id: string;
    titre: string;
    photos: string[];
  };
  locataire?: {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
  };
}

export interface TransactionPaginatedResponse {
  status: string;
  message: string;
  data: {
    transactions: Transaction[];
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
 * Récupère l'historique des transactions du propriétaire connecté
 */
export const getHistoriqueTransactions = (
  page?: number,
  limit?: number,
  filters?: {
    type?: string;
    statut?: string;
    bienId?: string;
  }
): Promise<{ transactions: Transaction[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> =>
  api
    .get<TransactionPaginatedResponse>("", {
      params: { page, limit, ...filters },
    })
    .then((r) => r.data.data);

// ─── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminTransactionStats {
  totalConfirme: number;
  montantTotal: number;
  montantMois: number;
  montantAnnee: number;
  parType: { type: string; count: number; montant: number }[];
}

export const getAdminHistoriqueTransactions = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  statut?: string;
  proprietaireId?: string;
  dateDebut?: string;
  dateFin?: string;
}): Promise<{ data: Transaction[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> =>
  api
    .get<{ data: { data: Transaction[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>("/admin", { params })
    .then((r) => r.data.data);

export const getAdminStatsTransactions = (): Promise<AdminTransactionStats> =>
  api.get<{ data: AdminTransactionStats }>("/admin/stats").then((r) => r.data.data);
