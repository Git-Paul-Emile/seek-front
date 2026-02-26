import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/stats`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteStats {
  annoncesActives: number;
  proprietaires:   number;
  villesCouvertes: number;
}

export interface AdminStats {
  annoncesByStatut: { statut: string; count: number }[];
  annoncesByTypeLogement: { nom: string; count: number }[];
  annoncesByTypeTransaction: { nom: string; count: number }[];
  topVilles: { ville: string; count: number }[];
  totalProprietaires: number;
  totalBiens: number;
  recentEnAttente: {
    id: string;
    titre: string | null;
    ville: string | null;
    proprietaire: { prenom: string | null; nom: string | null } | null;
    createdAt: string;
    hasPendingRevision: boolean;
  }[];
}

// ─── Requêtes ─────────────────────────────────────────────────────────────────

export const fetchStats = () =>
  api.get<{ data: SiteStats }>("/").then((r) => r.data.data);

export const fetchAdminStats = () =>
  api.get<{ data: AdminStats }>("/admin").then((r) => r.data.data);
