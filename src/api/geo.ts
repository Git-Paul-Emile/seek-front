import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({ baseURL: `${API_URL}/api/geo`, withCredentials: true });

export interface Pays {
  id: string;
  nom: string;
  code: string;
}

export interface Ville {
  id: string;
  nom: string;
  paysId: string;
}

export const fetchPays = (): Promise<Pays[]> =>
  api.get<{ data: Pays[] }>("/pays").then((r) => r.data.data);

export const fetchVilles = (paysId: string): Promise<Ville[]> =>
  api.get<{ data: Ville[] }>(`/pays/${paysId}/villes`).then((r) => r.data.data);
