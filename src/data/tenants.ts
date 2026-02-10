// Types pour la gestion des locataires et colocataires

export type TenantStatus = "actif" | "inactif" | "sorti" | "en_attente";
export type ColocataireStatus = "actif" | "inactif" | "sorti" | "remplace";
export type PaymentStatus = "paye" | "en_retard" | "non_paye" | "partiel";
export type CautionStatus = "versee" | "restituee" | "partiellement_restituee" | "en_cours";

export interface Caution {
  id: string;
  tenantId?: string;
  colocataireId?: string;
  amount: number;
  paymentDate: string;
  restitutionDate?: string;
  restitutionAmount?: number;
  status: CautionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneEmergency?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  idCardNumber?: string;
  idCardIssueDate?: string;
  idCardExpiryDate?: string;
  idCardDocument?: string;
  profession?: string;
  employer?: string;
  employerPhone?: string;
  monthlyIncome?: number;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  parentName?: string;
  parentPhone?: string;
  propertyId?: string;
  propertyName?: string;
  roomId?: string;
  roomName?: string;
  leaseStartDate: string;
  leaseEndDate?: string;
  rentAmount: number;
  rentDueDay: number;
  depositAmount: number;
  depositPaid: boolean;
  status: TenantStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Colocataire {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneEmergency?: string;
  dateOfBirth?: string;
  nationality?: string;
  idCardNumber?: string;
  profession?: string;
  employer?: string;
  roomId: string;
  roomName?: string;
  propertyId: string;
  propertyName?: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  entryDate: string;
  exitDate?: string;
  rentAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  status: ColocataireStatus;
  replacedById?: string;
  replacementDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantHistory {
  id: string;
  tenantId: string;
  action: "entree" | "sortie" | "modification" | "paiement" | "transfert" | "remplacement";
  description: string;
  date: string;
  performedBy?: string;
  notes?: string;
}

export interface ColocataireHistory {
  id: string;
  colocataireId: string;
  action: "entree" | "sortie" | "modification" | "paiement" | "remplacement";
  description: string;
  date: string;
  performedBy?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  colocataireId?: string;
  type: "loyer" | "caution" | "frais" | "autre";
  amount: number;
  paymentDate: string;
  paymentMethod: "especes" | "virement" | "mobile_money" | "cheque";
  reference?: string;
  status: PaymentStatus;
  dueDate: string;
  paidAmount: number;
  notes?: string;
  createdAt: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  exitedTenants: number;
  totalMonthlyRent: number;
  totalDeposits: number;
  overduePayments: number;
}

// Labels pour l'affichage
export const tenantStatusLabels: Record<TenantStatus, string> = {
  actif: "Actif",
  inactif: "Inactif",
  sorti: "Sorti",
  en_attente: "En attente",
};

export const colocataireStatusLabels: Record<ColocataireStatus, string> = {
  actif: "Actif",
  inactif: "Inactif",
  sorti: "Sorti",
  remplace: "Remplacé",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  paye: "Payé",
  en_retard: "En retard",
  non_paye: "Non payé",
  partiel: "Partiel",
};

export const cautionStatusLabels: Record<CautionStatus, string> = {
  versee: "Versée",
  restituee: "Restituée",
  partiellement_restituee: "Partiellement restituée",
  en_cours: "En cours",
};

// Données mock pour le développement
export const mockTenants: Tenant[] = [
  {
    id: "tenant-1",
    firstName: "Marie",
    lastName: "Ngo",
    email: "marie.ngo@email.com",
    phone: "+237 6 99 88 77 66",
    phoneEmergency: "+237 6 11 22 33 44",
    dateOfBirth: "1990-05-15",
    nationality: "Camerounaise",
    idCardNumber: "123456789",
    idCardIssueDate: "2020-01-15",
    idCardExpiryDate: "2030-01-15",
    profession: "Infirmière",
    employer: "Hôpital General",
    employerPhone: "+237 6 00 11 22 33",
    monthlyIncome: 350000,
    guarantorName: "Paul Ngo",
    guarantorPhone: "+237 6 44 55 66 77",
    guarantorRelation: "Frère",
    propertyId: "7",
    propertyName: "Grand Appartement Colocation",
    roomId: "room-1",
    roomName: "Chambre 1 - Master",
    leaseStartDate: "2025-09-01",
    rentAmount: 75000,
    rentDueDay: 5,
    depositAmount: 75000,
    depositPaid: true,
    status: "actif",
    notes: "Bonne locataire, paie toujours à temps",
    createdAt: "2025-08-15",
    updatedAt: "2025-09-01",
  },
  {
    id: "tenant-2",
    firstName: "Jean",
    lastName: "Paul",
    email: "jean.paul@email.com",
    phone: "+237 6 55 44 33 22",
    dateOfBirth: "1995-08-20",
    nationality: "Camerounaise",
    idCardNumber: "987654321",
    profession: "Étudiant",
    employer: "Université de Douala",
    parentName: "Marie Paul",
    parentPhone: "+237 6 77 88 99 00",
    propertyId: "7",
    propertyName: "Grand Appartement Colocation",
    roomId: "room-3",
    roomName: "Chambre 3",
    leaseStartDate: "2025-11-01",
    rentAmount: 55000,
    rentDueDay: 5,
    depositAmount: 55000,
    depositPaid: true,
    status: "actif",
    createdAt: "2025-10-20",
    updatedAt: "2025-11-01",
  },
];

export const mockColocataires: Colocataire[] = [
  {
    id: "coloc-1",
    firstName: "Sophie",
    lastName: "Mouko",
    email: "sophie.mouko@email.com",
    phone: "+237 6 12 34 56 78",
    dateOfBirth: "1998-03-10",
    nationality: "Camerounaise",
    profession: "Étudiante",
    roomId: "room-2",
    roomName: "Chambre 2",
    propertyId: "7",
    propertyName: "Grand Appartement Colocation",
    entryDate: "2025-01-15",
    rentAmount: 55000,
    depositAmount: 55000,
    depositPaid: true,
    status: "actif",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-15",
  },
  {
    id: "coloc-2",
    firstName: "Pierre",
    lastName: "Kamga",
    email: "pierre.kamga@email.com",
    phone: "+237 6 11 22 33 44",
    dateOfBirth: "1992-07-22",
    nationality: "Camerounaise",
    idCardNumber: "456789123",
    profession: "Commerçant",
    roomId: "room-1",
    roomName: "Chambre 1 - Master",
    propertyId: "7",
    propertyName: "Grand Appartement Colocation",
    entryDate: "2024-01-01",
    exitDate: "2025-08-31",
    rentAmount: 70000,
    depositAmount: 70000,
    depositPaid: true,
    status: "sorti",
    createdAt: "2023-12-20",
    updatedAt: "2025-08-31",
  },
];

export const mockCautions: Caution[] = [
  {
    id: "caution-1",
    tenantId: "tenant-1",
    amount: 75000,
    paymentDate: "2025-08-25",
    status: "versee",
    createdAt: "2025-08-25",
    updatedAt: "2025-08-25",
  },
  {
    id: "caution-2",
    tenantId: "tenant-2",
    amount: 55000,
    paymentDate: "2025-10-25",
    status: "versee",
    createdAt: "2025-10-25",
    updatedAt: "2025-10-25",
  },
  {
    id: "caution-3",
    colocataireId: "coloc-1",
    amount: 55000,
    paymentDate: "2025-01-10",
    status: "versee",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-10",
  },
];
