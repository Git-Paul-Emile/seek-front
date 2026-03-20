import axios from "axios";
import type { Bien } from "./bien";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/public/favoris`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Changements {
  prixChange: boolean;
  nouveauPrix: number | null;
  prixAncienSnapshot: number | null;
  statutChange: boolean;
  nouveauStatut: string | null;
  bienSuppr: boolean;
}

export interface FavoriItem {
  id: string;
  bienId: string;
  createdAt: string;
  prixSnapshot: number | null;
  statutSnapshot: string | null;
  actifSnapshot: boolean;
  bien: Bien;
  changements: Changements;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Liste des favoris avec changements détectés */
export const getFavorisApi = async (): Promise<FavoriItem[]> => {
  const { data } = await api.get("/");
  return data.data;
};

/** IDs uniquement (pour init rapide) */
export const getFavoriIdsApi = async (): Promise<string[]> => {
  const { data } = await api.get("/ids");
  return data.data;
};

/** Toggle favori - retourne { action: "added" | "removed" } */
export const toggleFavoriApi = async (bienId: string): Promise<{ action: "added" | "removed" }> => {
  const { data } = await api.post(`/${bienId}/toggle`);
  return data.data;
};

/** Supprimer un favori */
export const removeFavoriApi = async (bienId: string): Promise<void> => {
  await api.delete(`/${bienId}`);
};

/** Marquer les changements d'un favori comme vus (reset snapshot) */
export const syncSnapshotApi = async (bienId: string): Promise<void> => {
  await api.patch(`/${bienId}/snapshot`);
};
