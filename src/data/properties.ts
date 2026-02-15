// Types pour les filtres visiteur
export type PropertyType = "appartement" | "maison" | "villa" | "studio" | "terrain" | "bureau";
export type PropertyStatus = 
  | "libre" 
  | "loué" 
  | "partiellement loué" 
  | "en maintenance"
  | "à vendre"
  | "vendu";

export type RentalMode = "classique" | "colocation";
export type PropertyCategory = "logement_entier" | "chambre"; // Pour les visiteurs
export type FurnishedStatus = "meublé" | "non_meublé" | "tous";
export type AvailabilityType = "immediate" | "future" | "tous";

export type RoomStatus = "libre" | "occupée" | "en maintenance" | "réservée";

export type EquipmentType = 
  | "climatisation"
  | "ventilateur"
  | "meuble"
  | "cuisine_equipee"
  | "douche"
  | "baignoire"
  | "balcon"
  | "terrasse"
  | "garde_robe"
  | "bureau"
  | "internet"
  | "tv"
  | "refrigerateur"
  | "lave_linge"
  | "eau"
  | "electricite"
  | "piscine"
  | "garage"
  | "jardin"
  | "parking"
  | "autre";

export type ContractType = "bail_mois" | "bail_annee" | "saisonnier" | "cdi";
export type ChargeType = "compris" | "non_compris" | "partiel";

export interface ColocationRules {
  allowed: string[];
  forbidden: string[];
  genderPreference?: "homme" | "femme" | "mixte";
  petsAllowed: boolean;
  smokingAllowed: boolean;
  noiseRules?: string;
  visitorRules?: string;
  cleaningSchedule?: string;
  commonSpaceRules?: string;
  targetProfile?: "etudiant" | "salarie" | "stagiaire" | "jeune_professionnel" | "tous"; // Profil type recherché
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: "contrat" | "acte" | "diagnostic" | "photo" | "autre";
  uploadedAt: string;
}

export interface RoomOccupant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  startDate: string;
  endDate?: string;
  status: "actuel" | "ancien";
  rentPaid: boolean;
  notes?: string;
}

export interface RoomHistory {
  id: string;
  occupantName: string;
  occupantPhone: string;
  startDate: string;
  endDate: string;
  reason?: string;
  rentAmount: number;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  price: number;
  status: RoomStatus;
  area: number;
  equipment: EquipmentType[];
  images: string[];
  currentOccupant?: RoomOccupant;
  history: RoomHistory[];
  createdAt: string;
  updatedAt: string;
  disabled: boolean;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  status: PropertyStatus;
  rentalMode?: RentalMode;
  furnished?: boolean;
  description: string;
  coverImage: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: {
    city: string;
    address: string;
    neighborhood: string; // Quartier uniquement pour les visiteurs
    lat: number;
    lng: number;
  };
  proximity: {
    hospital: number;
    police: number;
    supermarket: number;
    school: number;
  };
  featured: boolean;
  archived: boolean;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
  availableFrom?: string;
  documents: PropertyDocument[];
  rooms?: Room[];
  // Champs pour la fiche annonce visiteur
  securityDeposit?: number; // Caution
  charges?: {
    type: ChargeType;
    amount?: number; // Montant si non compris ou partiel
  };
  contractType?: ContractType;
  equipment?: EquipmentType[];
  colocationRules?: ColocationRules;
  minStayMonths?: number; // Durée minimum de location
  maxOccupants?: number; // Nombre maximum d'occupants
  keyFeatures?: string[]; // Points forts du bien
  commonAreas?: string[]; // Parties communes disponibles
}

export const propertyTypes: PropertyType[] = ["appartement", "maison", "villa", "studio", "terrain", "bureau"];
export const propertyStatuses: PropertyStatus[] = ["libre", "loué", "partiellement loué", "en maintenance", "à vendre", "vendu"];
export const rentalModes: RentalMode[] = ["classique", "colocation"];
export const roomStatuses: RoomStatus[] = ["libre", "occupée", "en maintenance", "réservée"];
export const equipmentTypes: EquipmentType[] = [
  "climatisation", "ventilateur", "meuble", "cuisine_equipee", 
  "douche", "baignoire", "balcon", "terrasse", "garde_robe", 
  "bureau", "internet", "tv", "refrigerateur", "lave_linge", "autre"
];

// Villes du Sénégal
export const cities = ["Dakar", "Thies", "Saint-Louis", "Ziguinchor", "Kaolack", "Tambacounda", "Louga", "Diourbel", "Fatick", "Kolda", "Rufisque", "Mbour", "Dakar-Plateau", "Pikine", "Guédiawaye"];

export const neighborhoods: Record<string, string[]> = {
  Dakar: ["Plateau", "Fann", "Mermoz", "Sacre Coeur", "HLM", "Biscuiterie", "Grand Dakar", "Liberté", "Dieuppeul", "Derklé", "Point E", "Cité Fongs", "Ouakam", "Yoff", "Ngor", "Almadies", "Mamelles", "Patte d'Oie", "Cité Avé Maria", "Sicap Liberté", "Sicap Sacré Coeur"],
  Thies: ["Thies-Ville", "Thies-Nord", "Thies-Sud", "Kébémer", "Mbour", "Tivaouane", "Dakar", "Mbour", "Sey", "Koul", "Koulougounda"],
  "Saint-Louis": ["Saint-Louis-Ville", "Sor", "Ndar-Tout", "Goxu-Mbacc", "Boquery", "Medina", "Bokhol", "Mpal"],
  Ziguinchor: ["Ziguinchor-Ville", "Sandy", "Bignona", "Boudouti", "Kafounta", "Niaguis", "Diembéring"],
  Kaolack: ["Kaolack-Ville", "Keur-Massar", "Sokone", "Bambey", "Fatick", "Foundiougne"],
  Tambacounda: ["Tambacounda-Ville", "Kolda", "Vélingara", "Kédougou", "Saraya", "Mali"],
  Louga: ["Louga-Ville", "Linguère", "Dahra", "Nguidile", "Sokone"],
  Diourbel: ["Diourbel-Ville", "Diakhao", "Mbacké", "Tamba", "Bambey"],
  Fatick: ["Fatick-Ville", "Sokone", "Foundiougne", "Gossas", "Fimela"],
  Kolda: ["Kolda-Ville", "Vélingara", "Saraya", "Médina Yoro Foulah"],
  Rufisque: ["Rufisque-Ville", "Bargny", "Sendou", "Dakar", "Pout"],
  Mbour: ["Mbour-Ville", "Saly", "Somone", "Nguékokh", "Sindia"],
  "Dakar-Plateau": ["Plateau", "Médina", "Garage", "Boulvard", "Rue 10"],
  Pikine: ["Pikine-Ville", "Pikine-Est", "Pikine-Ouest", "Thiaroye", "Guédiawaye"],
  Guédiawaye: ["Guédiawaye-Ville", "Sam Notaire", "Wakhinane", "Ndiarème", "Cité Police"]
};

export const getNeighborhoodsForCity = (city: string): string[] => {
  return neighborhoods[city] || [];
};

export const typeLabels: Record<PropertyType, string> = {
  appartement: "Appartement",
  maison: "Maison",
  villa: "Villa",
  studio: "Studio",
  terrain: "Terrain",
  bureau: "Bureau",
};

export const statusLabels: Record<PropertyStatus, string> = {
  libre: "Libre",
  loué: "Louée",
  "partiellement loué": "Partiellement louée",
  "en maintenance": "En maintenance",
  "à vendre": "À vendre",
  vendu: "Vendue",
};

export const roomStatusLabels: Record<RoomStatus, string> = {
  libre: "Libre",
  occupée: "Occupée",
  "en maintenance": "En maintenance",
  réservée: "Réservée",
};

export const equipmentLabels: Record<EquipmentType, string> = {
  climatisation: "Climatisation",
  ventilateur: "Ventilateur",
  meuble: "Meublée",
  cuisine_equipee: "Cuisine équipée",
  douche: "Douche",
  baignoire: "Baignoire",
  balcon: "Balcon",
  terrasse: "Terrasse",
  garde_robe: "Garde-robe",
  bureau: "Bureau",
  internet: "Internet",
  tv: "TV",
  refrigerateur: "Réfrigérateur",
  lave_linge: "Lave-linge",
  eau: "Eau incluse",
  electricite: "Électricité incluse",
  piscine: "Piscine",
  garage: "Garage",
  jardin: "Jardin",
  parking: "Parking",
  autre: "Autre",
};

export const rentalModeLabels: Record<RentalMode, string> = {
  classique: "Location classique",
  colocation: "Colocation",
};

export const contractTypeLabels: Record<ContractType, string> = {
  bail_mois: "Bail mensuel",
  bail_annee: "Bail annuel",
  saisonnier: "Location saisonnière",
  cdi: "Contrat à durée indéterminée",
};

export const chargeTypeLabels: Record<ChargeType, string> = {
  compris: "Charges incluses",
  non_compris: "Charges non incluses",
  partiel: "Charges partiellement incluses",
};

export const propertyCategoryLabels: Record<PropertyCategory, string> = {
  logement_entier: "Logement entier",
  chambre: "Chambre",
};

export const furnishedLabels: Record<FurnishedStatus, string> = {
  meublé: "Meublé",
  non_meublé: "Non meublé",
  tous: "Tous",
};

export const availabilityLabels: Record<AvailabilityType, string> = {
  immediate: "Disponible immédiatement",
  future: "Date future",
  tous: "Tous",
};

export const targetProfileLabels: Record<string, string> = {
  etudiant: "Étudiant",
  salarie: "Salarié",
  stagiaire: "Stagiaire",
  jeune_professionnel: "Jeune professionnel",
  tous: "Tous profils",
};

export const formatPrice = (price: number, status: PropertyStatus, rentalMode?: RentalMode): string => {
  const formatted = new Intl.NumberFormat("fr-FR").format(price);
  if (status === "à vendre" || status === "vendu") {
    return `${formatted} FCFA`;
  }
  if (rentalMode === "colocation") {
    return `${formatted} FCFA/chambre/mois`;
  }
  return `${formatted} FCFA/mois`;
};

export const formatRoomPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat("fr-FR").format(price);
  return `${formatted} FCFA/mois`;
};

// Mock rooms data
export const mockRooms: Room[] = [
  {
    id: "room-1",
    propertyId: "7",
    name: "Chambre 1 - Master",
    description: "Grande chambre avec balcon et salle de bain privative",
    price: 75000,
    status: "occupée",
    area: 25,
    equipment: ["climatisation", "meuble", "douche", "balcon", "garde_robe"],
    images: [],
    currentOccupant: {
      id: "occupant-1",
      name: "Marie Ngo",
      phone: "+237 6 99 88 77 66",
      email: "marie.ngo@email.com",
      startDate: "2025-09-01",
      status: "actuel",
      rentPaid: true,
    },
    history: [
      {
        id: "history-1",
        occupantName: "Pierre Kamga",
        occupantPhone: "+237 6 11 22 33 44",
        startDate: "2024-01-01",
        endDate: "2025-08-31",
        rentAmount: 70000,
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2025-09-01",
    disabled: false,
  },
  {
    id: "room-2",
    propertyId: "7",
    name: "Chambre 2",
    description: "Chambre spacieuse avec vue sur jardin",
    price: 55000,
    status: "libre",
    area: 18,
    equipment: ["ventilateur", "meuble", "douche", "garde_robe"],
    images: [],
    currentOccupant: undefined,
    history: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    disabled: false,
  },
  {
    id: "room-3",
    propertyId: "7",
    name: "Chambre 3",
    description: "Chambre confortable avec balcon",
    price: 55000,
    status: "occupée",
    area: 18,
    equipment: ["climatisation", "meuble", "douche", "balcon", "garde_robe"],
    images: [],
    currentOccupant: {
      id: "occupant-2",
      name: "Jean Paul",
      phone: "+237 6 55 44 33 22",
      startDate: "2025-11-01",
      status: "actuel",
      rentPaid: false,
    },
    history: [
      {
        id: "history-2",
        occupantName: "Anne-Marie",
        occupantPhone: "+237 6 77 88 99 00",
        startDate: "2025-03-01",
        endDate: "2025-10-31",
        rentAmount: 55000,
      },
    ],
    createdAt: "2024-01-01",
    updatedAt: "2025-11-01",
    disabled: false,
  },
  {
    id: "room-4",
    propertyId: "7",
    name: "Chambre 4",
    description: "Chambre économique",
    price: 45000,
    status: "en maintenance",
    area: 15,
    equipment: ["ventilateur", "meuble", "douche", "garde_robe"],
    images: [],
    history: [],
    createdAt: "2024-01-01",
    updatedAt: "2025-12-01",
    disabled: false,
  },
];

// Mock properties avec données Sénégal
export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Villa Moderne avec Piscine aux Almadies",
    type: "villa",
    price: 3500000,
    status: "libre",
    furnished: true,
    description: "Magnifique villa moderne de 5 chambres avec piscine, jardin paysagé et vue panoramique. Finitions haut de gamme, cuisine équipée, double garage et système de sécurité. Idéale pour une famille recherchant confort et élégance aux Almadies.",
    coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    ],
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    location: { city: "Dakar", address: "Almadies, Rue des Almadies", neighborhood: "Almadies", lat: 14.7155, lng: -17.4636 },
    proximity: { hospital: 2.5, police: 1.8, supermarket: 0.5, school: 1.2 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Mamadou Diop",
    ownerPhone: "+221 77 123 45 67",
    ownerEmail: "mamadou.diop@email.com",
    createdAt: "2025-12-15",
    updatedAt: "2025-12-15",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 3500000,
    charges: { type: "non_compris", amount: 150000 },
    contractType: "bail_annee",
    equipment: ["climatisation", "eau", "electricite", "internet", "piscine", "garage", "jardin"],
    minStayMonths: 12,
    maxOccupants: 6,
    keyFeatures: ["Piscine privée", "Vue panoramique", "Sécurité 24h/24", "Garage double"],
  },
  {
    id: "2",
    title: "Appartement Standing au Plateau",
    type: "appartement",
    price: 1500000,
    status: "libre",
    furnished: true,
    description: "Superbe appartement de 3 chambres dans le quartier du Plateau. Spacieux séjour, balcon avec vue, parking sécurisé. Proximité administrations et commodités.",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    location: { city: "Dakar", address: "Plateau, Avenue Lamine Gueye", neighborhood: "Plateau", lat: 14.6928, lng: -17.4469 },
    proximity: { hospital: 1.0, police: 0.5, supermarket: 0.3, school: 1.0 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Fatou Seck",
    ownerPhone: "+221 77 234 56 78",
    ownerEmail: "fatou.seck@email.com",
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 1500000,
    charges: { type: "compris" },
    contractType: "bail_annee",
    equipment: ["climatisation", "eau", "electricite", "internet", "balcon", "parking"],
    minStayMonths: 12,
    maxOccupants: 4,
    keyFeatures: ["Balcon avec vue", "Parking sécurisé", "Proche administrations"],
  },
  {
    id: "3",
    title: "Studio Meublé à Fann",
    type: "studio",
    price: 250000,
    status: "libre",
    furnished: true,
    description: "Studio entièrement meublé et équipé à Fann. Parfait pour jeune professionnel. Eau chaude, climatisation, internet haut débit inclus.",
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    location: { city: "Dakar", address: "Fann, Rue de Fann", neighborhood: "Fann", lat: 14.6920, lng: -17.4600 },
    proximity: { hospital: 1.0, police: 0.5, supermarket: 0.2, school: 0.8 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Alioune Ndiaye",
    ownerPhone: "+221 77 345 67 89",
    ownerEmail: "alioune.ndiaye@email.com",
    createdAt: "2026-01-25",
    updatedAt: "2026-01-25",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 500000,
    charges: { type: "compris" },
    contractType: "bail_mois",
    equipment: ["climatisation", "eau", "electricite", "internet", "meuble", "cuisine_equipee", "refrigerateur"],
    minStayMonths: 3,
    maxOccupants: 1,
    keyFeatures: ["Meublé complet", "Internet fibre", "Proche UCAD"],
  },
  {
    id: "4",
    title: "Maison Familiale à Mermoz",
    type: "maison",
    price: 1200000,
    status: "libre",
    furnished: false,
    description: "Belle maison familiale de 4 chambres avec grand jardin arboré. Quartier calme et résidentiel, proche des écoles et commerces. Garage double, terrasse couverte.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    location: { city: "Dakar", address: "Mermoz, Rue 10", neighborhood: "Mermoz", lat: 14.6980, lng: -17.4650 },
    proximity: { hospital: 2.0, police: 1.5, supermarket: 0.5, school: 0.5 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Ousmane Kane",
    ownerPhone: "+221 77 456 78 90",
    ownerEmail: "ousmane.kane@email.com",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
    availableFrom: "2025-03-01",
    documents: [],
    rooms: [],
    securityDeposit: 2400000,
    charges: { type: "non_compris", amount: 50000 },
    contractType: "bail_annee",
    equipment: ["ventilateur", "jardin", "garage", "terrasse"],
    minStayMonths: 12,
    maxOccupants: 6,
    keyFeatures: ["Grand jardin", "Garage double", "Quartier résidentiel"],
  },
  {
    id: "5",
    title: "Chambre en Colocation à Sacré Coeur",
    type: "appartement",
    price: 100000,
    status: "libre",
    rentalMode: "colocation",
    furnished: true,
    description: "Chambre spacieuse en colocation dans un appartement moderne. Salon commun, cuisine équipée. Proche transports et commerces.",
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    area: 18,
    location: { city: "Dakar", address: "Sacre Coeur, Rue 30", neighborhood: "Sacré Coeur", lat: 14.7050, lng: -17.4550 },
    proximity: { hospital: 1.5, police: 1.0, supermarket: 0.3, school: 0.8 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Marieme Fall",
    ownerPhone: "+221 77 567 89 01",
    ownerEmail: "marieme.fall@email.com",
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 200000,
    charges: { type: "compris" },
    contractType: "bail_mois",
    equipment: ["climatisation", "eau", "electricite", "internet", "cuisine_equipee", "balcon", "lave_linge"],
    minStayMonths: 6,
    maxOccupants: 4,
    colocationRules: {
      allowed: ["Inviter des amis occasionnellement", "Recevoir de la famille"],
      forbidden: ["Fêtes bruyantes après 23h", "Animaux non autorisés", "Fumer à l'intérieur"],
      genderPreference: "mixte",
      petsAllowed: false,
      smokingAllowed: false,
      noiseRules: "Calme obligatoire après 23h",
      visitorRules: "Visites autorisées jusqu'à 23h",
      cleaningSchedule: "Nettoyage commun chaque samedi",
      commonSpaceRules: "Salle de bain partagée - respect du planning",
      targetProfile: "jeune_professionnel",
    },
    keyFeatures: ["Cuisine équipée", "Proche transports", "Colocation calme"],
    commonAreas: ["Salon spacieux", "Cuisine équipée", "Salle de bain partagée", "Terrasse", "Buanderie"],
  },
  {
    id: "6",
    title: "Appartement Non Meublé à Liberté 6",
    type: "appartement",
    price: 600000,
    status: "libre",
    furnished: false,
    description: "Bel appartement de 3 chambres non meublé à Liberté 6. Idéal pour ceux qui apportent leurs propres meubles. Quartier vivant avec toutes les commodités.",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    location: { city: "Dakar", address: "Liberté 6, Villa 45", neighborhood: "Liberté", lat: 14.7100, lng: -17.4450 },
    proximity: { hospital: 2.0, police: 1.0, supermarket: 0.5, school: 1.0 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Ibrahima Traore",
    ownerPhone: "+221 77 678 90 12",
    ownerEmail: "ibrahima.traore@email.com",
    createdAt: "2026-01-05",
    updatedAt: "2026-01-05",
    availableFrom: "2025-02-01",
    documents: [],
    rooms: [],
    securityDeposit: 1200000,
    charges: { type: "non_compris", amount: 35000 },
    contractType: "bail_annee",
    equipment: ["ventilateur", "douche", "garde_robe"],
    minStayMonths: 12,
    maxOccupants: 4,
    keyFeatures: ["Grand séjour", "Quartier animé", "Proche commerces"],
  },
  {
    id: "7",
    title: "Villa à Mbour Saly",
    type: "villa",
    price: 2500000,
    status: "libre",
    furnished: true,
    description: "Superbe villa meublée à Saly Station. Idéale pour les vacances ou la location saisonnière. Vue mer, piscine privée, jardin tropical.",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    location: { city: "Mbour", address: "Saly, Boulevard de la Plage", neighborhood: "Saly", lat: 14.4175, lng: -16.9668 },
    proximity: { hospital: 3.0, police: 2.0, supermarket: 1.0, school: 2.0 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Pierre",
    ownerPhone: "+221 77 789 01 23",
    ownerEmail: "jean.pierre@email.com",
    createdAt: "2026-01-20",
    updatedAt: "2026-01-20",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 5000000,
    charges: { type: "partiel", amount: 50000 },
    contractType: "saisonnier",
    equipment: ["climatisation", "eau", "electricite", "internet", "piscine", "jardin", "balcon", "terrasse", "tv", "refrigerateur", "lave_linge"],
    minStayMonths: 1,
    maxOccupants: 8,
    keyFeatures: ["Vue mer", "Piscine privée", "Jardin tropical", "Proche plage"],
  },
  {
    id: "8",
    title: "Studio Meublé au Centre de Thiès",
    type: "studio",
    price: 150000,
    status: "libre",
    furnished: true,
    description: "Studio meublé et équipé au centre de Thiès. Proche gare et commodités. Idéal pour étudiant ou jeune professionnel.",
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    area: 30,
    location: { city: "Thies", address: "Thies-Ville, Rue 10", neighborhood: "Thies-Ville", lat: 14.7879, lng: -16.9173 },
    proximity: { hospital: 1.5, police: 0.5, supermarket: 0.3, school: 0.8 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Aminata Diouf",
    ownerPhone: "+221 77 890 12 34",
    ownerEmail: "aminata.diouf@email.com",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
    availableFrom: "2025-01-15",
    documents: [],
    rooms: [],
    securityDeposit: 300000,
    charges: { type: "compris" },
    contractType: "bail_mois",
    equipment: ["ventilateur", "eau", "electricite", "internet", "meuble", "cuisine_equipee", "refrigerateur"],
    minStayMonths: 3,
    maxOccupants: 1,
    keyFeatures: ["Centre-ville", "Proche gare", "Prix étudiant"],
  },
  {
    id: "9",
    title: "Maison Non Meublée à Ouakam",
    type: "maison",
    price: 800000,
    status: "libre",
    furnished: false,
    description: "Grande maison familiale de 4 chambres à Ouakam. Non meublée, idéal pour une famille qui apporte ses propres meubles. Quartier résidentiel calme.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
    ],
    bedrooms: 4,
    bathrooms: 2,
    area: 200,
    location: { city: "Dakar", address: "Ouakam, Rue 15", neighborhood: "Ouakam", lat: 14.7300, lng: -17.4800 },
    proximity: { hospital: 3.0, police: 2.0, supermarket: 1.0, school: 1.5 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Moussa Sarr",
    ownerPhone: "+221 77 901 23 45",
    ownerEmail: "moussa.sarr@email.com",
    createdAt: "2026-02-08",
    updatedAt: "2026-02-08",
    availableFrom: "2025-04-01",
    documents: [],
    rooms: [],
    securityDeposit: 1600000,
    charges: { type: "non_compris", amount: 40000 },
    contractType: "bail_annee",
    equipment: ["ventilateur", "garage", "jardin", "terrasse"],
    minStayMonths: 12,
    maxOccupants: 6,
    keyFeatures: ["Grand terrain", "Quartier calme", "Proche aéroport"],
  },
  {
    id: "10",
    title: "Appartement 2 Chambres à Guédiawaye",
    type: "appartement",
    price: 400000,
    status: "libre",
    furnished: false,
    description: "Bel appartement de 2 chambres à Guédiawaye. Non meublé, proche de toutes les commodités. Excellent rapport qualité-prix.",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    location: { city: "Guédiawaye", address: "Guédiawaye-Ville, Cité Police", neighborhood: "Guédiawaye-Ville", lat: 14.7590, lng: -17.3950 },
    proximity: { hospital: 2.0, police: 1.0, supermarket: 0.5, school: 0.8 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Yacine Diop",
    ownerPhone: "+221 77 012 34 56",
    ownerEmail: "yacine.diop@email.com",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
    availableFrom: "2025-01-01",
    documents: [],
    rooms: [],
    securityDeposit: 800000,
    charges: { type: "non_compris", amount: 25000 },
    contractType: "bail_annee",
    equipment: ["ventilateur", "douche", "balcon"],
    minStayMonths: 12,
    maxOccupants: 3,
    keyFeatures: ["Prix accessible", "Quartier animé", "Proche marché"],
  },
  {
    id: "11",
    title: "Chambre en Colocation à Yoff",
    type: "appartement",
    price: 80000,
    status: "libre",
    rentalMode: "colocation",
    furnished: true,
    description: "Chambre lumineuse en colocation à Yoff. Proche aéroport et plage. Environnement calme et sécurisé.",
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    area: 15,
    location: { city: "Dakar", address: "Yoff, Rue 30", neighborhood: "Yoff", lat: 14.7480, lng: -17.5050 },
    proximity: { hospital: 3.0, police: 2.0, supermarket: 1.0, school: 1.5 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Ndeye Diop",
    ownerPhone: "+221 77 123 45 67",
    ownerEmail: "ndeye.diop@email.com",
    createdAt: "2026-02-12",
    updatedAt: "2026-02-12",
    availableFrom: "2025-02-20",
    documents: [],
    rooms: [],
    securityDeposit: 160000,
    charges: { type: "compris" },
    contractType: "bail_mois",
    equipment: ["climatisation", "eau", "electricite", "internet", "balcon"],
    minStayMonths: 3,
    maxOccupants: 3,
    colocationRules: {
      allowed: ["Inviter des amis"],
      forbidden: ["Fumer dans les chambres", "Animaux"],
      genderPreference: "femme",
      petsAllowed: false,
      smokingAllowed: false,
      noiseRules: "Calme après 22h",
      commonSpaceRules: "Respect mutuel requis",
      targetProfile: "etudiant",
    },
    keyFeatures: ["Proche aéroport", "Environnement calme", "Colocation féminine"],
    commonAreas: ["Salon commun", "Cuisine équipée", "Balcon partagé", "Espace de travail"],
  },
];
