import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/stats`,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteStats {
  annoncesActives: number;
  proprietaires:   number;
  villesCouvertes: number;
}

// ─── Requêtes ─────────────────────────────────────────────────────────────────

export const fetchStats = () =>
  api.get<{ data: SiteStats }>("/").then((r) => r.data.data);
