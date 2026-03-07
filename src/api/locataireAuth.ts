import axios from "axios";
import type { TypePieceIdentite } from "./locataire";
import type { Echeance } from "./bail";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/locataire/auth`,
  withCredentials: true,
});

type RefreshGlobal = typeof globalThis & {
  __locataireRefreshPromise?: Promise<void> | null;
};

const refreshGlobal = globalThis as RefreshGlobal;

const refreshSession = async (): Promise<void> => {
  if (!refreshGlobal.__locataireRefreshPromise) {
    refreshGlobal.__locataireRefreshPromise = axios
      .post(`${API_URL}/api/locataire/auth/refresh`, {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshGlobal.__locataireRefreshPromise = null;
      });
  }
  return refreshGlobal.__locataireRefreshPromise;
};

// API pour l'upload de fichiers
const uploadApi = axios.create({
  baseURL: `${API_URL}/api/locataire/auth`,
  withCredentials: true,
  headers: { "Content-Type": "multipart/form-data" },
});

// Intercepteur pour rafraîchir automatiquement le token en cas d'erreur 401
const setupInterceptors = (axiosInstance: typeof api) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
      const requestUrl = String(originalRequest?.url ?? "");
      const isRefreshRequest = requestUrl.includes("/refresh");
      const message = String(error?.response?.data?.message ?? "");
      const isMissingToken = message.toLowerCase().includes("token manquant");
      
      // Si l'erreur est 401 et que ce n'est pas déjà une tentative de rafraîchissement
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isRefreshRequest &&
        !isMissingToken
      ) {
        originalRequest._retry = true;
        
        try {
          // Éviter les refresh concurrents qui invalident le token rotatif
          await refreshSession();
          
          // Réessayer la requête originale
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Si le rafraîchissement échoue, rejeter l'erreur
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Configurer les intercepteurs pour les deux instances
setupInterceptors(api);
setupInterceptors(uploadApi);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocataireInfo {
  id: string;
  nom: string;
  prenom: string;
}

export interface ActiverPayload {
  token: string;
  password: string;
  dateNaissance?: string | null; // Date de naissance
  lieuNaissance?: string | null; // Lieu de naissance
  nationalite?: string | null;
  sexe?: string | null;
  numPieceIdentite?: string | null;
  typePiece?: TypePieceIdentite | null;
  dateDelivrance?: string | null;
  dateExpiration?: string | null; // Date d'expiration de la pièce
  autoriteDelivrance?: string | null;
  situationProfessionnelle?: string | null;
}

export interface LoginLocatairePayload {
  identifiant: string;
  password: string;
}

export interface UpdateProfilLocatairePayload {
  dateNaissance?: string | null; // Date de naissance
  lieuNaissance?: string | null; // Lieu de naissance
  nationalite?: string | null;
  sexe?: string | null;
  numPieceIdentite?: string | null;
  typePiece?: TypePieceIdentite | null;
  dateDelivrance?: string | null;
  dateExpiration?: string | null; // Date d'expiration de la pièce
  autoriteDelivrance?: string | null;
  situationProfessionnelle?: string | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const activerLocataireApi = async (
  payload: ActiverPayload
): Promise<{ locataire: LocataireInfo }> => {
  const { data } = await api.post("/activer", payload);
  return data.data;
};

export const loginLocataireApi = async (
  payload: LoginLocatairePayload
): Promise<{ locataire: LocataireInfo }> => {
  const { data } = await api.post("/login", payload);
  return data.data;
};

export const refreshLocataireApi = async (): Promise<void> => {
  await api.post("/refresh");
};

export const logoutLocataireApi = async (): Promise<void> => {
  await api.post("/logout");
};

export const meLocataireApi = async () => {
  const { data } = await api.get("/me");
  return data.data;
};

export const updateProfilLocataireApi = async (
  payload: UpdateProfilLocatairePayload
) => {
  const { data } = await api.put("/profil", payload);
  return data.data;
};

export const getLocataireEcheancierApi = async (): Promise<Echeance[]> => {
  const { data } = await api.get("/echeancier");
  return data.data;
};

// ─── Types pour le contrat ────────────────────────────────────────────────────

export interface BailInfo {
  id: string;
  typeBail: string | null;
  dateDebutBail: string;
  dateFinBail: string | null;
  montantLoyer: number;
  montantCaution: number | null;
  cautionVersee: boolean;
  jourLimitePaiement: number | null;
  frequencePaiement: string | null;
}

export interface BienInfo {
  id: string;
  titre: string | null;
  adresse: string | null;
  quartier: string | null;
  ville: string | null;
  region: string | null;
}

export interface ModeleInfo {
  id: string;
  titre: string;
  typeBail: string | null;
}

export interface ContratInfo {
  id: string;
  titre: string;
  contenu: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  modele: ModeleInfo;
}

export interface ContratLocataireData {
  bail: BailInfo;
  bien: BienInfo;
  contrat: ContratInfo;
}

// ─── Paiement direct (locataire) ─────────────────────────────────────────────

export interface PayerEcheancesLocatairePayload {
  nombreMois: number;
  datePaiement: string;
  modePaiement: string;
  reference?: string;
  note?: string;
}

export const payerEcheancesLocataireApi = async (
  payload: PayerEcheancesLocatairePayload
): Promise<{ paye: number; ids: string[] }> => {
  const { data } = await api.post("/paiement/payer", payload);
  return data.data;
};

// ─── API pour le contrat ─────────────────────────────────────────────────────

export const getLocataireContratApi = async (): Promise<ContratLocataireData | null> => {
  const { data } = await api.get("/contrat");
  return data.data;
};

// ─── Vérification d'identité du locataire ─────────────────────────────────────

export interface LocataireVerificationStatus {
  locataireId: string;
  statut: "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt: string | null;
  documents?: {
    typePiece: "CNI" | "PASSEPORT";
    pieceIdentiteRecto: string | null;
    pieceIdentiteVerso: string | null;
    selfie: string | null;
    conditionsAcceptees: boolean;
    motifRejet?: string | null;
    traitePar?: string | null;
    dateTraitement?: string | null;
  };
}

export interface SubmitLocataireVerificationPayload {
  typePiece: "CNI" | "PASSEPORT";
  pieceIdentiteRecto: string;
  pieceIdentiteVerso?: string;
  selfie: string;
  conditionsAcceptees: boolean;
}

export const getLocataireVerificationStatusApi = () =>
  api.get<{ status: string; data: LocataireVerificationStatus }>("/verification");

export const submitLocataireVerificationApi = (payload: SubmitLocataireVerificationPayload) =>
  api.post<{ status: string; message: string; data: LocataireVerificationStatus }>(
    "/verification",
    payload
  );

export const cancelLocataireVerificationApi = () =>
  api.delete<{ status: string; message: string; data: LocataireVerificationStatus }>(
    "/verification"
  );

// Upload d'une image de vérification vers Cloudinary
export const uploadLocataireVerificationImageApi = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await uploadApi.post<{ status: string; data: { url: string; publicId: string } }>(
    "/verification/upload",
    formData
  );
  
  return response.data.data.url;
};

// ─── Infos propriétaire pour le locataire ───────────────────────────────────────

export interface ProprietaireInfo {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
}

export interface BienInfo {
  id: string;
  titre: string | null;
  adresse: string | null;
  quartier: string | null;
  ville: string | null;
  region: string | null;
  pays: string | null;
}

export interface ProprietaireLocataireData {
  bien: BienInfo;
  proprietaire: ProprietaireInfo;
}

export const getProprietaireLocataireApi = async (): Promise<ProprietaireLocataireData | null> => {
  const { data } = await api.get("/proprietaire");
  return data.data;
};
