import axios from 'axios';
import type { AxiosError } from 'axios';
import axiosInstance, { clearAuthCookies } from '@/api/axiosConfig';
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
    const { acceptTerms, acceptPrivacy, ...registrationData } = data;
    
    const response = await axiosInstance.post(`/proprietaires/inscription`, {
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
    const response = await axiosInstance.post(`/proprietaires/connexion`, { telephone, mot_de_passe });
    
    if (response.status === 200) {
      // Stocker le profil dans localStorage (sans les tokens - protégés par cookies)
      if (response.data.data?.owner) {
        localStorage.setItem('seek_proprietaire', JSON.stringify(response.data.data.owner));
      }
      
      return { 
        success: true, 
        owner: response.data.data?.owner,
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

// Déconnexion d'un propriétaire
export async function logoutOwner(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await clearAuthCookies();
    localStorage.removeItem('seek_proprietaire');
    
    return { success: true, message: "Déconnexion réussie" };
  } catch (err) {
    // Même en cas d'erreur, on déconnecte localement
    localStorage.removeItem('seek_proprietaire');
    return { success: true, message: "Déconnexion réussie (locale)" };
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

// Définir le propriétaire actuel dans localStorage
export function setCurrentOwner(owner: Proprietaire | null): void {
  try {
    if (owner) {
      localStorage.setItem("seek_proprietaire", JSON.stringify(owner));
    } else {
      localStorage.removeItem("seek_proprietaire");
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du propriétaire:", error);
  }
}

// Rafraîchir le profil depuis le serveur
export async function refreshOwnerProfile(): Promise<{ success: boolean; owner?: Proprietaire; error?: string }> {
  try {
    const response = await axiosInstance.get(`/proprietaires/auth/moi`);
    
    if (response.status === 200 && response.data.data) {
      // Mettre à jour localStorage
      localStorage.setItem('seek_proprietaire', JSON.stringify(response.data.data));
      return { success: true, owner: response.data.data };
    }
    
    return { success: false, error: "Impossible de récupérer le profil" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}

// Demander la réinitialisation du mot de passe par email
export async function forgotPasswordByEmail(
  email: string
): Promise<{ success: boolean; devCode?: string; message?: string; error?: string }> {
  try {
    const response = await axiosInstance.post(`/proprietaires/auth/mot-de-passe-oublie/email`, { email });
    
    if (response.status === 200) {
      return { 
        success: true, 
        devCode: response.data.devCode,
        message: response.data.message 
      };
    }
    
    return { success: false, error: "Une erreur est survenue" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}

// Demander la réinitialisation du mot de passe par SMS
export async function forgotPasswordBySms(
  telephone: string
): Promise<{ success: boolean; devCode?: string; message?: string; error?: string }> {
  try {
    const response = await axiosInstance.post(`/proprietaires/auth/mot-de-passe-oublie/sms`, { telephone });
    
    if (response.status === 200) {
      return { 
        success: true, 
        devCode: response.data.devCode,
        message: response.data.message 
      };
    }
    
    return { success: false, error: "Une erreur est survenue" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}

// Réinitialiser le mot de passe avec code email
export async function resetPasswordByEmail(
  code: string,
  mot_de_passe: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await axiosInstance.post(`/proprietaires/auth/reset-mot-de-passe/email`, { code, mot_de_passe });
    
    if (response.status === 200) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, error: "Une erreur est survenue" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}

// Réinitialiser le mot de passe avec code SMS
export async function resetPasswordBySms(
  code: string,
  mot_de_passe: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await axiosInstance.post(`/proprietaires/auth/reset-mot-de-passe/sms`, { code, mot_de_passe });
    
    if (response.status === 200) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, error: "Une erreur est survenue" };
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue";
    return { success: false, error: errorMessage };
  }
}
