import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type MotifSignalement =
  | "ARNAQUE_SUSPECTEE"
  | "PHOTOS_NON_CONFORMES"
  | "LOGEMENT_INSALUBRE"
  | "INFORMATIONS_ERRONEES"
  | "PRIX_INCORRECT"
  | "DOUBLON"
  | "AUTRE";

export type StatutSignalement = "ACTIF" | "TRAITE";
export type PrioriteSignalement = "HAUTE" | "BASSE";

export interface SignalementItem {
  id:              string;
  motif:           MotifSignalement;
  justification:   string | null;
  signaleParNom:   string | null;
  signaleParTel:   string;
  signaleParEmail: string | null;
  statut:          StatutSignalement;
  createdAt:       string;
}

export interface BienSignale {
  id:                  string;
  titre:               string | null;
  ville:               string | null;
  quartier:            string | null;
  reportCount:         number;
  statutAnnonce:       string;
  actif:               boolean;
  priorite:            PrioriteSignalement;
  dernierMotif:        MotifSignalement | null;
  dernierSignalementAt: string | null;
  proprietaire: {
    id:               string;
    prenom:           string;
    nom:              string;
    telephone:        string;
    email:            string | null;
    nbAvertissements: number;
  };
}

export interface BienSignaleDetail {
  id:                  string;
  titre:               string | null;
  ville:               string | null;
  quartier:            string | null;
  photos:              string[];
  reportCount:         number;
  statutAnnonce:       string;
  actif:               boolean;
  proprietaire: {
    id:               string;
    prenom:           string;
    nom:              string;
    telephone:        string;
    email:            string | null;
    nbAvertissements: number;
    estRestreint:     boolean;
    estSuspendu:      boolean;
  };
  signalements:        SignalementItem[];
  adminAvertissements: { message: string; createdAt: string }[];
}

export interface BiensSignalesResponse {
  data:  BienSignale[];
  total: number;
  page:  number;
  limit: number;
}

export interface CreateSignalementPayload {
  motif:           MotifSignalement;
  justification?:  string;
  signaleParNom?:  string;
  signaleParTel:   string;
  signaleParEmail?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

// Public — signaler une annonce
export const createSignalementApi = (
  bienId: string,
  payload: CreateSignalementPayload
): Promise<void> =>
  api
    .post(`/signalements/annonce/${bienId}`, payload)
    .then(() => undefined);

// Admin — badge count
export const getSignalementCount = (): Promise<number> =>
  api
    .get<{ data: { count: number } }>("/signalements/admin/count")
    .then((r) => r.data.data.count);

// Admin — liste biens signalés
export const getBiensSignalesAdmin = (params?: {
  page?:     number;
  limit?:    number;
  priorite?: PrioriteSignalement;
}): Promise<BiensSignalesResponse> =>
  api
    .get<{ data: BiensSignalesResponse }>("/signalements/admin", { params })
    .then((r) => r.data.data);

// Admin — détail d'un bien signalé
export const getBienSignaleDetail = (bienId: string): Promise<BienSignaleDetail> =>
  api
    .get<{ data: BienSignaleDetail }>(`/signalements/admin/${bienId}`)
    .then((r) => r.data.data);

// Admin — rejeter (abusif, reset compteur)
export const rejeterSignalementsApi = (bienId: string): Promise<void> =>
  api.post(`/signalements/admin/${bienId}/rejeter`).then(() => undefined);

// Admin — avertir le propriétaire
export const avertirProprietaireApi = (bienId: string, message: string): Promise<void> =>
  api.post(`/signalements/admin/${bienId}/avertir`, { message }).then(() => undefined);

// Admin — sanctionner (suppression définitive)
export const sanctionnerAnnonceApi = (bienId: string): Promise<void> =>
  api.post(`/signalements/admin/${bienId}/sanctionner`).then(() => undefined);
