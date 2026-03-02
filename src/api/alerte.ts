import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface AlertePayload {
  telephone: string;
  typeLogement?: string;
  typeTransaction?: string;
  ville?: string;
  quartier?: string;
  prixMin?: number;
  prixMax?: number;
  canalPrefere?: "SMS" | "WHATSAPP";
}

export const creerAlerte = async (payload: AlertePayload) => {
  const response = await axios.post(`${API_URL}/alertes`, payload);
  return response.data;
};

export const desactiverAlerte = async (telephone: string) => {
  const response = await axios.post(`${API_URL}/alertes/desactiver`, {
    telephone,
  });
  return response.data;
};
