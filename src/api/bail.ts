import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/biens`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatutBail = "ACTIF" | "TERMINE" | "RESILIE";

export interface BailLocataire {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  statut: "INVITE" | "ACTIF" | "INACTIF";
  nbOccupants: number;
  presenceEnfants: boolean;
}

export interface Bail {
  id: string;
  bienId: string;
  locataireId: string;
  proprietaireId: string;
  typeBail?: string | null;
  dateDebutBail: string;
  dateFinBail?: string | null;
  renouvellement: boolean;
  montantLoyer: number;
  montantCaution?: number | null;
  frequencePaiement?: string | null;
  statut: StatutBail;
  createdAt: string;
  updatedAt: string;
  locataire: BailLocataire;
  bien: {
    id: string;
    titre?: string | null;
    ville?: string | null;
    quartier?: string | null;
    prix?: number | null;
    caution?: number | null;
    frequencePaiement?: string | null;
    typeTransaction?: { slug: string } | null;
  };
}

export interface CreateBailPayload {
  locataireId: string;
  typeBail?: string | null;
  dateDebutBail: string;
  dateFinBail?: string | null;
  renouvellement?: boolean;
  montantLoyer: number;
  montantCaution?: number | null;
  frequencePaiement?: string | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const getBailActifApi = async (bienId: string): Promise<Bail | null> => {
  const { data } = await api.get(`/${bienId}/bail`);
  return data.data;
};

export const creerBailApi = async (
  bienId: string,
  payload: CreateBailPayload
): Promise<Bail> => {
  const { data } = await api.post(`/${bienId}/bail`, payload);
  return data.data;
};

export const terminerBailApi = async (
  bienId: string,
  bailId: string
): Promise<Bail> => {
  const { data } = await api.patch(`/${bienId}/bail/${bailId}/terminer`);
  return data.data;
};

export const resilierBailApi = async (
  bienId: string,
  bailId: string
): Promise<Bail> => {
  const { data } = await api.patch(`/${bienId}/bail/${bailId}/resilier`);
  return data.data;
};

export const annulerBailApi = async (
  bienId: string,
  bailId: string
): Promise<void> => {
  await api.delete(`/${bienId}/bail/${bailId}`);
};

export const prolongerBailApi = async (
  bienId: string,
  bailId: string,
  dateFinBail: string
): Promise<Bail> => {
  const { data } = await api.patch(`/${bienId}/bail/${bailId}/prolonger`, {
    dateFinBail,
  });
  return data.data;
};
