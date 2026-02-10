// Utilitaires de sécurité pour l'authentification et la protection des données
// Ces fonctions sont destinées à être utilisées côté client pour les interactions de sécurité

// Génération d'un token de session sécurisé
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Hachage du mot de passe côté client (préparation pour Argon2)
// Note: Le hachage réel doit être effectué côté serveur pour plus de sécurité
export async function preparePasswordForHashing(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Validation de la force du mot de passe
export interface PasswordStrengthResult {
  score: number;
  label: "Faible" | "Moyen" | "Bon" | "Excellent";
  suggestions: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  // Longueur
  if (password.length >= 8) {
    score += 25;
  } else {
    suggestions.push("Utilisez au moins 8 caractères");
  }

  // Majuscules
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    suggestions.push("Ajoutez des majuscules");
  }

  // Minuscules
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    suggestions.push("Ajoutez des minuscules");
  }

  // Chiffres
  if (/[0-9]/.test(password)) {
    score += 25;
  } else {
    suggestions.push("Ajoutez des chiffres");
  }

  // Caractères spéciaux
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 10;
  } else {
    suggestions.push("Ajoutez des caractères spéciaux");
  }

  // Labels
  let label: "Faible" | "Moyen" | "Bon" | "Excellent";
  if (score <= 25) label = "Faible";
  else if (score <= 50) label = "Moyen";
  else if (score <= 75) label = "Bon";
  else label = "Excellent";

  return { score: Math.min(score, 100), label, suggestions };
}

// Nettoyage et sanitization des données utilisateur
export function sanitizeOwnerData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      // Supprime les caractères de contrôle et trim
      // eslint-disable-next-line no-control-regex
      sanitized[key] = value.replace(/[\x00-\x1F\x7F]/g, "").trim();
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Validation du format de téléphone français
export function validateFrenchPhoneNumber(phone: string): boolean {
  const frenchPhoneRegex = /^0[1-9]\d{8}$/;
  return frenchPhoneRegex.test(phone);
}

// Formatage du numéro pour E.164
export function formatToE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return `+33${cleaned.slice(1)}`;
  }
  return `+${cleaned}`;
}

// Gestion des sessions côté client
export const SessionManager = {
  // Stocker le token de session
  setSession(token: string, expiresInDays: number = 30): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    localStorage.setItem("session_token", token);
    localStorage.setItem("session_expires", expiresAt.toISOString());
  },

  // Récupérer le token de session
  getToken(): string | null {
    const token = localStorage.getItem("session_token");
    const expiresAt = localStorage.getItem("session_expires");

    if (!token || !expiresAt) {
      return null;
    }

    if (new Date(expiresAt) < new Date()) {
      this.clearSession();
      return null;
    }

    return token;
  },

  // Vérifier si la session est valide
  isValid(): boolean {
    return this.getToken() !== null;
  },

  // Effacer la session
  clearSession(): void {
    localStorage.removeItem("session_token");
    localStorage.removeItem("session_expires");
    localStorage.removeItem("owner_data");
  },

  // Rafraîchir la session (prolonger l'expiration)
  refreshSession(): void {
    const token = this.getToken();
    if (token) {
      this.setSession(token, 30);
    }
  },
};

// Métriques de suivi
export interface OwnerMetrics {
  registrationStartTime: number | null;
  registrationEndTime: number | null;
  currentStep: number;
  completedSteps: number[];
}

export const MetricsTracker = {
  // Démarrer le suivi de l'inscription
  startRegistration(): void {
    sessionStorage.setItem("registration_start", Date.now().toString());
    sessionStorage.setItem("registration_step", "1");
  },

  // Enregistrer la fin de l'inscription
  endRegistration(): number | null {
    const startTime = sessionStorage.getItem("registration_start");
    if (startTime) {
      const duration = Date.now() - parseInt(startTime, 10);
      sessionStorage.removeItem("registration_start");
      return duration;
    }
    return null;
  },

  // Mettre à jour l'étape actuelle
  setCurrentStep(step: number): void {
    sessionStorage.setItem("registration_step", step.toString());
  },

  // Récupérer la durée d'inscription estimée
  getEstimatedRegistrationTime(): number {
    // Simulation basée sur des données moyennes
    return Math.floor(Math.random() * 30) + 30; // 30-60 secondes
  },
};

// Canal d'acquisition
export function trackAcquisitionChannel(source: string): void {
  const channels: Record<string, string> = {
    HOMEPAGE: "HOMEPAGE_HERO",
    SEARCH: "SEARCH_ENGINE",
    SOCIAL: "SOCIAL_MEDIA",
    REFERRAL: "REFERRAL",
    DIRECT: "DIRECT_LINK",
  };

  const channel = channels[source] || "OTHER";
  localStorage.setItem("acquisition_channel", channel);
  console.log(`Canal d'acquisition: ${channel}`);
}

export function getAcquisitionChannel(): string | null {
  return localStorage.getItem("acquisition_channel");
}
