import { z } from "zod";

// Schéma d'inscription simplifiée - Champs minimaux pour réduction de friction
export const ownerRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
  phone: z
    .string()
    .regex(/^7[0-9]{8}$/, "Veuillez entrer un numéro de téléphone sénégalais valide (9 chiffres commençant par 7)"),
  address: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(200, "L'adresse ne doit pas dépasser 200 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "Vous devez prendre connaissance de la politique de confidentialité",
  }),
});

export type OwnerRegistrationData = z.infer<typeof ownerRegistrationSchema>;

// Schéma de connexion propriétaire
export const ownerLoginSchema = z.object({
  phone: z
    .string()
    .regex(/^7[0-9]{8}$/, "Veuillez entrer un numéro de téléphone sénégalais valide (9 chiffres commençant par 7)"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

export type OwnerLoginData = z.infer<typeof ownerLoginSchema>;

// Schéma de complétion du profil - Champs optionnels avec recommandations
export const ownerProfileSchema = z.object({
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .regex(/^0[1-9]\d{8}$/, "Veuillez entrer un numéro de téléphone français valide")
    .optional(),
  city: z
    .string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(100, "La ville ne doit pas dépasser 100 caractères")
    .optional(),
  ownerType: z.enum(["PARTICULAR", "COMPANY"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de propriétaire" }),
  }),
  companyName: z
    .string()
    .min(2, "La raison sociale doit contenir au moins 2 caractères")
    .max(200, "La raison sociale ne doit pas dépasser 200 caractères")
    .optional(),
});

export type OwnerProfileData = z.infer<typeof ownerProfileSchema>;

// Type complet du propriétaire
export interface Owner {
  id: string;
  fullName: string;
  phone: string;
  address?: string;
  email?: string;
  whatsapp?: string;
  city?: string;
  ownerType: "PARTICULAR" | "COMPANY";
  companyName?: string;
  profileComplete: boolean;
  profileCompleteness: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  role: "PROPRIETAIRE";
  createdAt: string;
  updatedAt: string;
}

// Métriques de suivi
export interface OwnerMetrics {
  registrationConversionRate: number;
  averageRegistrationTime: number;
  profileCompletionRate: number;
  returnUserRate: number;
}

// Canal d'acquisition
export type AcquisitionChannel = 
  | "HOMEPAGE_HERO"
  | "PROPERTY_SEARCH"
  | "DIRECT_LINK"
  | "REFERRAL"
  | "SOCIAL_MEDIA"
  | "SEARCH_ENGINE"
  | "OTHER";
