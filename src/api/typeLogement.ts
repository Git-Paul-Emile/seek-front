import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/types-logement`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TypeLogement {
  id: string;
  nom: string;
  slug: string;
  image: string | null;
  actif: boolean;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTypeLogementPayload {
  nom: string;
  image?: string;
  ordre?: number;
}

export interface UpdateTypeLogementPayload {
  nom?: string;
  image?: string;
  actif?: boolean;
  ordre?: number;
}

// ─── Requêtes ─────────────────────────────────────────────────────────────────

/** Types actifs — public */
export const fetchTypesLogement = () =>
  api.get<{ data: TypeLogement[] }>("/").then((r) => r.data.data);

/** Tous les types (actifs + inactifs) — admin */
export const fetchTypesLogementAdmin = () =>
  api.get<{ data: TypeLogement[] }>("/admin").then((r) => r.data.data);

export const createTypeLogement = (payload: CreateTypeLogementPayload) =>
  api.post<{ data: TypeLogement }>("/", payload).then((r) => r.data.data);

export const updateTypeLogement = (id: string, payload: UpdateTypeLogementPayload) =>
  api.put<{ data: TypeLogement }>(`/${id}`, payload).then((r) => r.data.data);

export const deleteTypeLogement = (id: string) => api.delete(`/${id}`);
