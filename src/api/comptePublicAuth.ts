import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/public/auth`,
  withCredentials: true,
});

export interface ComptePublic {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  password: string;
}

export const registerComptePublicApi = async (data: RegisterData): Promise<ComptePublic> => {
  const res = await api.post("/register", data);
  return res.data.data;
};

export const loginComptePublicApi = async (telephone: string, password: string): Promise<ComptePublic> => {
  const res = await api.post("/login", { telephone, password });
  return res.data.data;
};

export const refreshComptePublicApi = async (): Promise<ComptePublic> => {
  const res = await api.post("/refresh");
  return res.data.data;
};

export const logoutComptePublicApi = async (): Promise<void> => {
  await api.post("/logout");
};

export const meComptePublicApi = async (): Promise<ComptePublic> => {
  const res = await api.get("/me");
  return res.data.data;
};
