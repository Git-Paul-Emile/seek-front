export type LeaseType = 'classique' | 'colocation' | 'colocation_individuelle' | 'colocation_collective';

export type ContractStatus = 'actif' | 'expire' | 'renouvele' | 'resilie' | 'brouillon' | 'signe';

export type MandateStatus = 'actif' | 'expire' | 'resilie' | 'en_attente';

export type SignatureType = 'electronique' | 'physique' | 'non_signe';

export interface LeaseClause {
  id: string;
  title: string;
  content: string;
  isRequired?: boolean;
}

export interface TenantInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cni?: string;
}

export interface PropertyInfo {
  id: string;
  address: string;
  type: string;
  surface?: number;
  rooms?: number;
}

export interface OwnerInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cni?: string;
  address?: string;
}

export interface SignatureInfo {
  signedAt: string;
  signatureType: SignatureType;
  signatureData?: string; // Base64 encoded signature image or hash
  ipAddress?: string;
  userAgent?: string;
}

export interface LeaseContract {
  id: string;
  type: LeaseType;
  property: PropertyInfo;
  owner?: OwnerInfo;
  tenants: TenantInfo[];
  startDate: string; // ISO format
  endDate: string; // ISO format
  duration: {
    value: number;
    unit: 'months' | 'years';
  };
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number; // Day of month (1-28)
  clauses: LeaseClause[];
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  renewedFrom?: string; // Previous contract ID if renewed
  terminatedAt?: string; // ISO format if terminated
  terminationReason?: string;
  ownerSignature?: SignatureInfo;
  tenantSignatures?: { [tenantId: string]: SignatureInfo };
  signatureEnabled: boolean;
  pdfUrl?: string;
  autoRenewal: boolean;
  autoRenewalNoticeDays: number;
}

export interface CreateLeaseInput {
  type: LeaseType;
  propertyId: string;
  ownerId?: string;
  tenantIds: string[];
  startDate: string;
  duration: {
    value: number;
    unit: 'months' | 'years';
  };
  rentAmount: number;
  depositAmount: number;
  paymentDueDay: number;
  clauses: LeaseClause[];
  signatureEnabled?: boolean;
  autoRenewal?: boolean;
  autoRenewalNoticeDays?: number;
}

export interface RenewLeaseInput {
  contractId: string;
  newDuration: {
    value: number;
    unit: 'months' | 'years';
  };
  newRentAmount?: number;
  newStartDate?: string;
  signatureEnabled?: boolean;
}

export interface TerminateLeaseInput {
  contractId: string;
  reason: string;
  terminationDate: string;
}

// Mandat de gestion (contrat agence-propriétaire)
export interface ManagementMandate {
  id: string;
  ownerId: string;
  owner: OwnerInfo;
  agencyId: string;
  agencyName: string;
  propertyIds: string[];
  properties: PropertyInfo[];
  startDate: string;
  endDate: string;
  duration: {
    value: number;
    unit: 'months' | 'years';
  };
  commissionPercentage: number;
  services: MandateService[];
  status: MandateStatus;
  terms: string;
  ownerSignature?: SignatureInfo;
  agencySignature?: SignatureInfo;
  signatureEnabled: boolean;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MandateService {
  id: string;
  name: string;
  description: string;
  included: boolean;
  price?: number;
}

export interface CreateMandateInput {
  ownerId: string;
  propertyIds: string[];
  startDate: string;
  duration: {
    value: number;
    unit: 'months' | 'years';
  };
  commissionPercentage: number;
  services: MandateService[];
  terms: string;
  signatureEnabled?: boolean;
  autoRenewal?: boolean;
}

export interface UpdateMandateInput {
  commissionPercentage?: number;
  services?: MandateService[];
  terms?: string;
  status?: MandateStatus;
}

export const DEFAULT_CLAUSES: LeaseClause[] = [
  {
    id: 'objet',
    title: 'Objet du bail',
    content: 'Le présent bail a pour objet la location d\'un bien immobilier à usage d\'habitation principale.',
    isRequired: true,
  },
  {
    id: 'destination',
    title: 'Destination des lieux',
    content: 'Les locaux loués sont destinés à l\'usage exclusif d\'habitation du Preneur et de sa famille. Toute activité professionnelle y est formellement interdite.',
    isRequired: true,
  },
  {
    id: 'etat-lieux',
    title: 'État des lieux',
    content: 'Un état des lieux d\'entrée et de sortie sera établi contradictoirement entre les parties lors de la remise et de la restitution des clés.',
    isRequired: true,
  },
  {
    id: 'charges',
    title: 'Charges et travaux',
    content: 'Les charges locatives comprennent les dépenses d\'entretien courant des parties communes, de jardinage et les dépenses d\'éclairage des parties communes.',
    isRequired: true,
  },
  {
    id: 'reparation',
    title: 'Réparations',
    content: 'Le Preneur s\'engage à maintenir les locaux en bon état et à effectuer les menues réparations locatives.',
    isRequired: true,
  },
];

export const COLOCATION_SPECIFIC_CLAUSES: LeaseClause[] = [
  {
    id: 'solidarite',
    title: 'Solidarité',
    content: 'Les colocataires sont solidairement et indivisiblement tenus de l\'ensemble des obligations résultant du présent bail.',
    isRequired: true,
  },
  {
    id: 'repartition',
    title: 'Répartition des charges',
    content: 'Les charges locatives seront réparties équitablement entre les colocataires, sauf accord contraire écrit.',
    isRequired: false,
  },
];

export const COLOCATION_INDIVIDUELLE_CLAUSES: LeaseClause[] = [
  {
    id: 'chambre-exclusive',
    title: 'Chambre exclusive',
    content: 'Chaque colocataire dispose d\'une chambre privative meublée. Les espaces communs (salon, cuisine, salle de bain) sont partagés entre tous les colocataires.',
    isRequired: true,
  },
  {
    id: 'responsabilite-partagees',
    title: 'Responsabilités partagées',
    content: 'Chaque colocataire est responsable de l\'entretien de sa chambre. Les espaces communs sont entretenus collectivement selon un planning établi.',
    isRequired: false,
  },
];

export const COLOCATION_COLLECTIVE_CLAUSES: LeaseClause[] = [
  {
    id: 'espace-commun',
    title: 'Espace commun',
    content: 'L\'ensemble du logement est considéré comme un espace commun. Chaque colocataire s\'engage à respecter la tranquillité des autres occupants.',
    isRequired: true,
  },
  {
    id: 'reglement-interieur',
    title: 'Règlement intérieur',
    content: 'Un règlement intérieur sera établi et accepté par tous les colocataires pour définir les règles de vie commune.',
    isRequired: true,
  },
];

export const DEFAULT_MANDATE_SERVICES: MandateService[] = [
  {
    id: 'recherche-locataire',
    name: 'Recherche de locataires',
    description: 'Publication d\'annonces, visites et sélection des candidats',
    included: true,
  },
  {
    id: 'etat-lieux',
    name: 'État des lieux',
    description: 'Réalisation des états des lieux d\'entrée et de sortie',
    included: true,
  },
  {
    id: 'encaissement',
    name: 'Encaissement des loyers',
    description: 'Suivi des paiements et relances en cas d\'impayé',
    included: true,
  },
  {
    id: 'entretien',
    name: 'Suivi des entretiens',
    description: 'Gestion des interventions techniques et travaux',
    included: true,
  },
  {
    id: 'declaration-fiscale',
    name: 'Déclarations fiscales',
    description: 'Gestion des obligations fiscales du propriétaire',
    included: false,
    price: 50,
  },
];
