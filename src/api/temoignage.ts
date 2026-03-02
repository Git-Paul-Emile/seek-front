import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Temoignage {
  id: string;
  nom: string;
  temoignage: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const fetchTemoignages = (): Promise<Temoignage[]> =>
  api.get<{ data: Temoignage[] }>("/temoignages").then((r) => r.data.data);
