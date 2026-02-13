import axios, { type AxiosError } from '@/api/axiosConfig.js';
import type { OwnerRegistrationData } from '@/lib/owner-validation';

// Type Proprietaire
export interface Proprietaire {
  id: string;
  nom_complet: string;
  telephone: string;
  adresse?: string;
  email?: string;
  whatsapp?: string;
  ville?: string;
  type_proprietaire: "PARTICULIER" | "ENTREPRISE";
  raison_sociale?: string;
  profil_complet: boolean;
  taux_completude_profil: number;
  statut: "ACTIF" | "INACTIF" | "SUSPENDU";
  role: "PROPRIETAIRE";
  date_creation: string;
  date_modification: string;
}

// Inscription d'un propriétaire
export async function registerOwner(
  data: OwnerRegistrationData
): Promise<{ success: boolean; owner?: Proprietaire; message?: string; error?: string }> {
  try {
    // Préparer les données avec les noms français
    const { acceptTerms, acceptPrivacy, ...registrationData } = data;
    
    const response = await axios.post(`/proprietaires/inscription`, {
      nom_complet: registrationData.fullName,
      telephone: registrationData.phone,
      adresse: registrationData.address,
      mot_de_passe: registrationData.password,
      accepter_cgus: acceptTerms,
      accepter_confidentialite: acceptPrivacy,
    });
    
    if (response.status === 201) {
      return { 
        success: true, 
        owner: response.data.data,
        message: response.data.message 
      };
    }
    
    return { success: false, error: "Une erreur est survenue lors de l'inscription" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    console.error("Erreur lors de l'inscription:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Connexion d'un propriétaire
export async function loginOwner(
  telephone: string,
  mot_de_passe: string
): Promise<{ success: boolean; owner?: Proprietaire; message?: string; error?: string }> {
  try {
    const response = await axios.post(`/proprietaires/connexion`, { telephone, mot_de_passe });
    
    if (response.status === 200) {
      return { 
        success: true, 
        owner: response.data.data,
        message: response.data.message 
      };
    }
    
    return { success: false, error: "Une erreur est survenue lors de la connexion" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    console.error("Erreur lors de la connexion:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Récupérer le propriétaire actuel (depuis localStorage)
export function getCurrentOwner(): Proprietaire | null {
  try {
    const ownerData = localStorage.getItem("seek_proprietaire");
    if (ownerData) {
      return JSON.parse(ownerData);
    }
  } catch {
    return null;
  }
  return null;
}

// Définir le propriétaire actuel
export function setCurrentOwner(owner: Proprietaire): void {
  localStorage.setItem("seek_proprietaire", JSON.stringify(owner));
}

// Déconnexion
export function logoutOwner(): void {
  localStorage.removeItem("seek_proprietaire");
}
