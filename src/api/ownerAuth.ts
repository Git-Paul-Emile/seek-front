import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const ownerAuthApi = axios.create({
  baseURL: `${API_URL}/api/owner/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  prenom: string;
  nom: string;
  sexe: string;      // "" | "homme" | "femme"
  telephone: string;
  email: string;     // "" si non renseigné
  password: string;
}

export interface LoginPayload {
  identifiant: string;  // email ou téléphone
  password: string;
}

export interface OwnerInfo {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  sexe?: string;
}

// ─── Requêtes ─────────────────────────────────────────────────────────────────

export const registerOwnerApi = (payload: RegisterPayload) =>
  ownerAuthApi.post<{ status: string; message: string; data: OwnerInfo }>(
    "/register",
    payload
  );

export const loginOwnerApi = (payload: LoginPayload) =>
  ownerAuthApi.post<{ status: string; message: string; data: OwnerInfo }>(
    "/login",
    payload
  );

export const refreshOwnerApi = () =>
  ownerAuthApi.post<{ status: string; message: string }>("/refresh");

export const logoutOwnerApi = () =>
  ownerAuthApi.post<{ status: string; message: string }>("/logout");

export const meOwnerApi = () =>
  ownerAuthApi.get<{ status: string; message: string; data: OwnerInfo }>("/me");

export interface UpdateProfilePayload {
  prenom?: string;
  nom?: string;
  sexe?: string;
  telephone?: string;
  email?: string;
  password?: string;
}

export const updateProfileApi = (payload: UpdateProfilePayload) =>
  ownerAuthApi.put<{ status: string; message: string; data: OwnerInfo }>(
    "/profile",
    payload
  );

export const deleteProfileApi = () =>
  ownerAuthApi.delete<{ status: string; message: string }>("/profile");
