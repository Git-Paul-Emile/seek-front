export type PropertyType = "appartement" | "maison" | "villa" | "studio" | "terrain" | "bureau";

export type PropertyStatus = 
  | "libre" 
  | "loué" 
  | "partiellement loué" 
  | "en maintenance"
  | "à vendre"
  | "vendu";

export type RentalMode = "classique" | "colocation";

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
  | "autre";

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
  description: string;
  coverImage: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: {
    city: string;
    address: string;
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
  virtualTourUrl?: string;
  documents: PropertyDocument[];
  rooms?: Room[];
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

export const cities = ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Bertoua", "Kribi", "Limbé", "Buéa"];

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
  autre: "Autre",
};

export const rentalModeLabels: Record<RentalMode, string> = {
  classique: "Location classique",
  colocation: "Colocation",
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

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Villa Moderne avec Piscine",
    type: "villa",
    price: 250000000,
    status: "libre",
    description: "Magnifique villa moderne de 5 chambres avec piscine, jardin paysagé et vue panoramique. Finitions haut de gamme, cuisine équipée, double garage et système de sécurité. Idéale pour une famille recherchant confort et élégance.",
    coverImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    location: { city: "Douala", address: "Bonapriso, Rue des Palmiers", lat: 4.0435, lng: 9.6966 },
    proximity: { hospital: 2.5, police: 1.8, supermarket: 0.5, school: 1.2 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2025-12-15",
    updatedAt: "2025-12-15",
    virtualTourUrl: "https://example.com/tour/1",
    documents: [],
    rooms: [],
  },
  {
    id: "2",
    title: "Appartement Standing Bastos",
    type: "appartement",
    price: 85000000,
    status: "libre",
    description: "Superbe appartement de 3 chambres dans le quartier résidentiel de Bastos. Spacieux séjour, balcon avec vue, parking souterrain. Sécurité 24/7, proximité ambassades.",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    location: { city: "Yaoundé", address: "Bastos, Avenue Kennedy", lat: 3.8780, lng: 11.5021 },
    proximity: { hospital: 3.0, police: 1.5, supermarket: 0.8, school: 2.0 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
    documents: [],
    rooms: [],
  },
  {
    id: "3",
    title: "Studio Meublé Centre-Ville",
    type: "studio",
    price: 150000,
    status: "loué",
    rentalMode: "classique",
    description: "Studio entièrement meublé et équipé au cœur de Douala. Parfait pour jeune professionnel. Eau chaude, climatisation, internet haut débit inclus.",
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ],
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    location: { city: "Douala", address: "Akwa, Boulevard de la Liberté", lat: 4.0511, lng: 9.7679 },
    proximity: { hospital: 1.0, police: 0.5, supermarket: 0.2, school: 1.5 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-01-25",
    updatedAt: "2026-01-25",
    documents: [],
    rooms: [],
  },
  {
    id: "4",
    title: "Maison Familiale avec Jardin",
    type: "maison",
    price: 120000000,
    status: "libre",
    description: "Belle maison familiale de 4 chambres avec grand jardin arboré. Quartier calme et résidentiel, proche des écoles et commerces. Garage double, terrasse couverte.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    location: { city: "Yaoundé", address: "Omnisport, Rue 1.234", lat: 3.8480, lng: 11.5221 },
    proximity: { hospital: 4.0, police: 2.0, supermarket: 1.0, school: 0.5 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-01",
    documents: [],
    rooms: [],
  },
  {
    id: "5",
    title: "Terrain Constructible Kribi",
    type: "terrain",
    price: 15000000,
    status: "libre",
    description: "Terrain de 1000m² constructible en bordure de route bitumée à Kribi. Titre foncier disponible, zone résidentielle en plein essor. Idéal pour projet immobilier.",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    ],
    bedrooms: 0,
    bathrooms: 0,
    area: 1000,
    location: { city: "Kribi", address: "Route de Londji", lat: 2.9393, lng: 9.9073 },
    proximity: { hospital: 5.0, police: 3.0, supermarket: 2.0, school: 4.0 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2025-11-20",
    updatedAt: "2025-11-20",
    documents: [],
    rooms: [],
  },
  {
    id: "6",
    title: "Bureau Moderne Bonanjo",
    type: "bureau",
    price: 500000,
    status: "libre",
    description: "Espace de bureau moderne de 120m² à Bonanjo, quartier des affaires de Douala. Open space modulable, salle de réunion, réception. Parking disponible.",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    ],
    bedrooms: 0,
    bathrooms: 2,
    area: 120,
    location: { city: "Douala", address: "Bonanjo, Rue Joss", lat: 4.0470, lng: 9.6930 },
    proximity: { hospital: 1.5, police: 0.3, supermarket: 0.5, school: 2.0 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-01-05",
    updatedAt: "2026-01-05",
    documents: [],
    rooms: [],
  },
  {
    id: "7",
    title: "Grand Appartement Colocation",
    type: "appartement",
    price: 200000,
    status: "partiellement loué",
    rentalMode: "colocation",
    description: "Grand appartement de 120m² idéal pour la colocation. 4 chambres spacieuses, salon commun, cuisine équipée. Proche transports et commerces.",
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ],
    bedrooms: 4,
    bathrooms: 2,
    area: 120,
    location: { city: "Douala", address: "Bali, Rue des Cocotiers", lat: 4.0610, lng: 9.7800 },
    proximity: { hospital: 2.0, police: 1.0, supermarket: 0.3, school: 0.8 },
    featured: true,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-01-15",
    updatedAt: "2026-01-15",
    documents: [],
    rooms: mockRooms.filter(r => r.propertyId === "7"),
  },
  {
    id: "8",
    title: "Villa en Rénovation",
    type: "villa",
    price: 180000000,
    status: "en maintenance",
    description: "Villa de 6 chambres en cours de rénovation complète. Travaux de modernisation en cours. Potentiel exceptionnel pour une rénovation haut de gamme.",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    bedrooms: 6,
    bathrooms: 4,
    area: 380,
    location: { city: "Yaoundé", address: "Ngousso, Rue 12", lat: 3.8620, lng: 11.5450 },
    proximity: { hospital: 3.5, police: 2.5, supermarket: 1.2, school: 0.6 },
    featured: false,
    archived: false,
    ownerId: "owner1",
    ownerName: "Jean Dupont",
    ownerPhone: "+237 6 90 12 34 56",
    ownerEmail: "jean.dupont@email.com",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
    documents: [],
    rooms: [],
  },
];
