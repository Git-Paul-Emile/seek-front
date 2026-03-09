import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/biens`,
  withCredentials: true,
});

export type TypeEtatDesLieux = "ENTREE" | "SORTIE";
export type StatutEtatDesLieux = "BROUILLON" | "VALIDE";
export type EtatElement = "NEUF" | "BON" | "MOYEN" | "MAUVAIS" | "HS";

export interface EtatDesLieuxPhoto {
  id: string;
  itemId: string;
  url: string;
  nom: string | null;
  taille: number | null;
  uploadedBy: "PROPRIETAIRE" | "LOCATAIRE";
  createdAt: string;
}

export interface EtatDesLieuxItem {
  id: string;
  etatDesLieuxId: string;
  piece: string;
  element: string;
  etat: EtatElement;
  commentaire: string | null;
  ordre: number;
  photos: EtatDesLieuxPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface EtatDesLieux {
  id: string;
  bailId: string;
  bienId: string;
  type: TypeEtatDesLieux;
  statut: StatutEtatDesLieux;
  dateEtat: string;
  commentaireGlobal: string | null;
  signeParProprioAt: string | null;
  signeParLocataireAt: string | null;
  items: EtatDesLieuxItem[];
  createdAt: string;
  updatedAt: string;
}

export const getEtatsDesLieuxApi = async (bienId: string, bailId: string): Promise<EtatDesLieux[]> => {
  const { data } = await api.get(`/${bienId}/bail/${bailId}/etat-des-lieux`);
  return data.data;
};

export const createEtatDesLieuxApi = async (
  bienId: string,
  bailId: string,
  payload: { type: TypeEtatDesLieux; dateEtat?: string; commentaireGlobal?: string | null }
): Promise<EtatDesLieux> => {
  const { data } = await api.post(`/${bienId}/bail/${bailId}/etat-des-lieux`, payload);
  return data.data;
};

export const updateEtatDesLieuxApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  payload: { dateEtat?: string; commentaireGlobal?: string | null; statut?: StatutEtatDesLieux }
): Promise<EtatDesLieux> => {
  const { data } = await api.patch(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}`,
    payload
  );
  return data.data;
};

export const signerEtatDesLieuxOwnerApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string
): Promise<EtatDesLieux> => {
  const { data } = await api.patch(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/signer`
  );
  return data.data;
};

export const addEtatDesLieuxItemApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  payload: { piece: string; element: string; etat: EtatElement; commentaire?: string; ordre?: number }
): Promise<EtatDesLieuxItem> => {
  const { data } = await api.post(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/items`,
    payload
  );
  return data.data;
};

export const updateEtatDesLieuxItemApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  itemId: string,
  payload: Partial<{ piece: string; element: string; etat: EtatElement; commentaire: string; ordre: number }>
): Promise<EtatDesLieuxItem> => {
  const { data } = await api.patch(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/items/${itemId}`,
    payload
  );
  return data.data;
};

export const deleteEtatDesLieuxItemApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  itemId: string
): Promise<void> => {
  await api.delete(`/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/items/${itemId}`);
};

export const addEtatDesLieuxPhotoApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  itemId: string,
  photo: File
): Promise<EtatDesLieuxPhoto> => {
  const form = new FormData();
  form.append("photo", photo);
  const { data } = await api.post(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/items/${itemId}/photos`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};

export const deleteEtatDesLieuxPhotoApi = async (
  bienId: string,
  bailId: string,
  etatDesLieuxId: string,
  itemId: string,
  photoId: string
): Promise<void> => {
  await api.delete(
    `/${bienId}/bail/${bailId}/etat-des-lieux/${etatDesLieuxId}/items/${itemId}/photos/${photoId}`
  );
};
