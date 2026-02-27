import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/owner/locataires`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatutLocataire = "INVITE" | "ACTIF" | "INACTIF";
export type TypePieceIdentite = "CNI" | "PASSEPORT" | "CARTE_CONSULAIRE" | "AUTRE";

export interface BailResume {
  id: string;
  statut: "ACTIF" | "TERMINE" | "RESILIE";
  dateDebutBail: string;
  dateFinBail?: string | null;
  montantLoyer: number;
  bien: { id: string; titre?: string | null; ville?: string | null };
}

export interface Locataire {
  id: string;
  proprietaireId: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  nbOccupants: number;
  presenceEnfants: boolean;
  dateNaissance?: string | null;
  lieuNaissance?: string | null;
  nationalite?: string | null;
  sexe?: string | null;
  numPieceIdentite?: string | null;
  typePiece?: TypePieceIdentite | null;
  dateDelivrance?: string | null;
  dateExpiration?: string | null;
  autoriteDelivrance?: string | null;
  situationProfessionnelle?: string | null;
  statut: StatutLocataire;
  activationToken?: string | null;
  tokenExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  bails?: BailResume[];
}

export interface CreateLocatairePayload {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  nbOccupants?: number;
  presenceEnfants?: boolean;
}

export interface UpdateLocatairePayload {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string | null;
  nbOccupants?: number;
  presenceEnfants?: boolean;
}

export interface LienActivation {
  lien: string;
  statut: StatutLocataire;
  services: { email: null; whatsapp: null; sms: null };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const getLocatairesApi = async (): Promise<Locataire[]> => {
  const { data } = await api.get("/");
  return data.data;
};

export const getLocataireByIdApi = async (id: string): Promise<Locataire> => {
  const { data } = await api.get(`/${id}`);
  return data.data;
};

export const createLocataireApi = async (
  payload: CreateLocatairePayload
): Promise<Locataire> => {
  const { data } = await api.post("/", payload);
  return data.data;
};

export const updateLocataireApi = async (
  id: string,
  payload: UpdateLocatairePayload
): Promise<Locataire> => {
  const { data } = await api.patch(`/${id}`, payload);
  return data.data;
};

export const deleteLocataireApi = async (id: string): Promise<void> => {
  await api.delete(`/${id}`);
};

export const getLienActivationApi = async (
  id: string
): Promise<LienActivation> => {
  const { data } = await api.get(`/${id}/lien`);
  return data.data;
};
