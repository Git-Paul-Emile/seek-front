import axios from "axios";
import type { TypePieceIdentite } from "./locataire";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/locataire/auth`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocataireInfo {
  id: string;
  nom: string;
  prenom: string;
}

export interface ActiverPayload {
  token: string;
  password: string;
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
}

export interface LoginLocatairePayload {
  identifiant: string;
  password: string;
}

export interface UpdateProfilLocatairePayload {
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
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const activerLocataireApi = async (
  payload: ActiverPayload
): Promise<{ locataire: LocataireInfo }> => {
  const { data } = await api.post("/activer", payload);
  return data.data;
};

export const loginLocataireApi = async (
  payload: LoginLocatairePayload
): Promise<{ locataire: LocataireInfo }> => {
  const { data } = await api.post("/login", payload);
  return data.data;
};

export const refreshLocataireApi = async (): Promise<void> => {
  await api.post("/refresh");
};

export const logoutLocataireApi = async (): Promise<void> => {
  await api.post("/logout");
};

export const meLocataireApi = async () => {
  const { data } = await api.get("/me");
  return data.data;
};

export const updateProfilLocataireApi = async (
  payload: UpdateProfilLocatairePayload
) => {
  const { data } = await api.put("/profil", payload);
  return data.data;
};
