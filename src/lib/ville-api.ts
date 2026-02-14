import axiosInstance from '@/api/axiosConfig';

export interface Ville {
  id: string;
  nom: string;
  paysId: string;
  date_creation: string;
  date_modification: string;
}

export interface Pays {
  id: string;
  nom: string;
  code: string | null;
  date_creation: string;
  date_modification: string;
  villes?: Ville[];
}

export interface VillesResponse {
  success: boolean;
  data: Ville[];
}

export interface PaysResponse {
  success: boolean;
  data: Pays[];
}

export interface PaysWithVillesResponse {
  success: boolean;
  data: Pays[];
}

/**
 * Récupère toutes les villes du Sénégal
 */
export const getVillesSenegal = async (): Promise<Ville[]> => {
  try {
    const response = await axiosInstance.get<VillesResponse>('/localisation/villes/senegal');
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des villes du Sénégal:', error);
    return [];
  }
};

/**
 * Récupère toutes les villes
 */
export const getAllVilles = async (paysId?: string): Promise<Ville[]> => {
  try {
    const url = paysId 
      ? `/localisation/villes?paysId=${paysId}` 
      : '/localisation/villes';
    const response = await axiosInstance.get<VillesResponse>(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    return [];
  }
};

/**
 * Récupère les villes d'un pays spécifique
 */
export const getVillesByPays = async (paysId: string): Promise<Ville[]> => {
  try {
    const response = await axiosInstance.get<VillesResponse>(`/localisation/villes/pays/${paysId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    return [];
  }
};

/**
 * Récupère tous les pays
 */
export const getAllPays = async (): Promise<Pays[]> => {
  try {
    const response = await axiosInstance.get<PaysResponse>('/localisation/pays');
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    return [];
  }
};

/**
 * Récupère tous les pays avec leurs villes
 */
export const getAllPaysWithVilles = async (): Promise<Pays[]> => {
  try {
    const response = await axiosInstance.get<PaysWithVillesResponse>('/localisation/pays/with-villes');
    return response.data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pays avec villes:', error);
    return [];
  }
};

/**
 * Récupère un pays par son ID
 */
export const getPaysById = async (id: string): Promise<Pays | null> => {
  try {
    const response = await axiosInstance.get<{ success: boolean; data: Pays }>(`/localisation/pays/${id}`);
    return response.data.data || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du pays:', error);
    return null;
  }
};
