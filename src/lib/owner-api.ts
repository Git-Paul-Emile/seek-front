import { Owner } from "@/lib/owner-validation";
export type { Owner };
import { preparePasswordForHashing, generateSecureToken } from "@/lib/security";

const DB_PATH = "/data/db.json";

// Simuler un délai réseau
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Type interne avec mot de passe
interface OwnerWithPassword extends Owner {
  password: string;
}

// Lire le fichier db.json
async function readDb(): Promise<{ owners: OwnerWithPassword[] }> {
  try {
    const response = await fetch(DB_PATH);
    if (!response.ok) {
      return { owners: [] };
    }
    return await response.json();
  } catch {
    return { owners: [] };
  }
}

// Écrire dans le fichier db.json
async function writeDb(data: { owners: OwnerWithPassword[] }): Promise<void> {
  await fetch(DB_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data, null, 2),
  });
}

// Générer un ID unique
function generateId(): string {
  return generateSecureToken(16);
}

// Hachage simple du mot de passe (pour simulation)
async function hashPassword(password: string): Promise<string> {
  return preparePasswordForHashing(password);
}

// Inscription d'un propriétaire
export async function registerOwner(
  data: Omit<Owner, "id" | "createdAt" | "updatedAt" | "profileComplete" | "profileCompleteness" | "status" | "role"> & { password: string }
): Promise<{ success: boolean; owner?: Owner; error?: string }> {
  await delay(1000); // Simuler le délai réseau

  try {
    const db = await readDb();
    
    // Vérifier si le téléphone existe déjà
    const existingOwner = db.owners.find((owner) => owner.phone === data.phone);
    if (existingOwner) {
      return { success: false, error: "Un compte existe déjà avec ce numéro de téléphone" };
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    // Créer le nouveau propriétaire
    const now = new Date().toISOString();
    const newOwner: OwnerWithPassword = {
      id: generateId(),
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      email: data.email,
      whatsapp: data.whatsapp,
      city: data.city,
      ownerType: data.ownerType,
      companyName: data.companyName,
      profileComplete: false,
      profileCompleteness: 25,
      status: "ACTIVE",
      role: "PROPRIETAIRE",
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    // Sauvegarder dans la base de données
    db.owners.push(newOwner);
    await writeDb(db);

    // Retourner sans le mot de passe
    const { password: _, ...ownerWithoutPassword } = newOwner;
    return { success: true, owner: ownerWithoutPassword as Owner };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return { success: false, error: "Une erreur est survenue lors de l'inscription" };
  }
}

// Connexion d'un propriétaire
export async function loginOwner(
  phone: string,
  password: string
): Promise<{ success: boolean; owner?: Owner; error?: string }> {
  await delay(500);

  try {
    const db = await readDb();
    const owner = db.owners.find((o) => o.phone === phone);

    if (!owner) {
      return { success: false, error: "Numéro de téléphone ou mot de passe incorrect" };
    }

    const hashedPassword = await hashPassword(password);
    if (owner.password !== hashedPassword) {
      return { success: false, error: "Numéro de téléphone ou mot de passe incorrect" };
    }

    if (owner.status !== "ACTIVE") {
      return { success: false, error: "Votre compte est désactivé. Veuillez contacter le support." };
    }

    // Retourner sans le mot de passe
    const { password: _, ...ownerWithoutPassword } = owner;
    return { success: true, owner: ownerWithoutPassword as Owner };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return { success: false, error: "Une erreur est survenue lors de la connexion" };
  }
}

// Récupérer un propriétaire par ID
export async function getOwnerById(id: string): Promise<Owner | null> {
  try {
    const db = await readDb();
    const owner = db.owners.find((o) => o.id === id);
    if (owner) {
      const { password: _, ...ownerWithoutPassword } = owner;
      return ownerWithoutPassword as Owner;
    }
    return null;
  } catch {
    return null;
  }
}

// Récupérer le propriétaire actuel (depuis localStorage)
export function getCurrentOwner(): Owner | null {
  try {
    const ownerData = localStorage.getItem("seek_owner");
    if (ownerData) {
      return JSON.parse(ownerData);
    }
  } catch {
    return null;
  }
  return null;
}

// Définir le propriétaire actuel
export function setCurrentOwner(owner: Owner): void {
  localStorage.setItem("seek_owner", JSON.stringify(owner));
}

// Déconnexion
export function logoutOwner(): void {
  localStorage.removeItem("seek_owner");
}
