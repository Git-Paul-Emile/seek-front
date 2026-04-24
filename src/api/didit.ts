import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const ownerApi = axios.create({
  baseURL: `${API_URL}/api/owner`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const locataireApi = axios.create({
  baseURL: `${API_URL}/api/locataire/auth`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface DiditSessionData {
  sessionId: string;
  verificationUrl: string;
}

export async function createOwnerDiditSessionApi(): Promise<DiditSessionData> {
  const { data } = await ownerApi.post("/verification/didit/session");
  return data.data;
}

export async function createLocataireDiditSessionApi(): Promise<DiditSessionData> {
  const { data } = await locataireApi.post("/verification/didit/session");
  return data.data;
}
