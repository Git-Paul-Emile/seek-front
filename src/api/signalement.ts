import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/signalements`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeSignalement = "ANNONCE" | "PROPRIETAIRE" | "LOCATAIRE";
export type StatutSignalement = "EN_ATTENTE" | "EN_COURS" | "TRAITE" | "REJETE";

export interface Signalement {
  id: string;
  type: TypeSignalement;
  motif: string;
  description: string | null;
  statut: StatutSignalement;
  signalePar: string;
  signaleParType: string | null;
  signaleParNom: string | null;
  signaleParEmail: string | null;
  signaleParTel: string | null;
  signaleParProprietaireId: string | null;
  signaleParLocataireId: string | null;
  bienId: string | null;
  proprietaireSignaleId: string | null;
  locataireSignaleId: string | null;
  noteAdmin: string | null;
  createdAt: string;
  updatedAt: string;
  bien?: {
    id: string;
    titre: string | null;
    ville: string | null;
    photos: string[];
  } | null;
  proprietaireSignale?: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string;
    email: string | null;
  } | null;
  locataireSignale?: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string;
  } | null;
}

export interface SignalementListResponse {
  items: Signalement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SignalementDetail extends Signalement {
  historique?: Signalement[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const getSignalementsAdmin = (params?: {
  statut?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<SignalementListResponse> =>
  api
    .get<{ data: SignalementListResponse }>("/admin", { params })
    .then((r) => r.data.data);

export const getSignalementCount = (): Promise<number> =>
  api
    .get<{ data: { count: number } }>("/admin/count")
    .then((r) => r.data.data.count);

export const getSignalementDetail = (id: string): Promise<SignalementDetail> =>
  api
    .get<{ data: SignalementDetail }>(`/admin/${id}`)
    .then((r) => r.data.data);

export const traiterSignalement = (
  id: string,
  action: string,
  note?: string
): Promise<Signalement> =>
  api
    .patch<{ data: Signalement }>(`/admin/${id}/traiter`, { action, note })
    .then((r) => r.data.data);
