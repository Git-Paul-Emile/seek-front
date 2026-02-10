export type LeaseType = 'classique' | 'colocation';

export type ContractStatus = 'actif' | 'expire' | 'renouvele' | 'resilie';

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

export interface LeaseContract {
  id: string;
  type: LeaseType;
  property: PropertyInfo;
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
  signatureDate?: string;
  ownerSignature?: string;
  tenantSignatures?: { [tenantId: string]: string };
}

export interface CreateLeaseInput {
  type: LeaseType;
  propertyId: string;
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
}

export interface RenewLeaseInput {
  contractId: string;
  newDuration: {
    value: number;
    unit: 'months' | 'years';
  };
  newRentAmount?: number;
  newStartDate?: string;
}

export interface TerminateLeaseInput {
  contractId: string;
  reason: string;
  terminationDate: string;
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
