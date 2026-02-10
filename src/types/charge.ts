/**
 * Types pour la gestion des charges locatives
 */

// Types de charges disponibles
export type TypeCharge = 
  | 'eau'
  | 'electricite'
  | 'gaz'
  | 'internet'
  | 'assurance'
  | 'entretien'
  | 'menage'
  | 'ascenseur'
  | 'chauffage'
  | 'autre';

// Modes de répartition des charges
export type ModeRepartition = 'egal' | 'prorata' | 'manuel';

// Statut de paiement d'une charge individuelle
export type StatutPaiement = 'impaye' | 'partiel' | 'paye';

// Répartition manuelle d'une charge entre colocataires
export interface RepartitionManuelle {
  colocataireId: string;
  montant: number;
  pourcentage?: number;
}

// Détails de paiement pour un colocataire
export interface DetailPaiement {
  colocataireId: string;
  colocataireNom: string;
  montant: number;
  statut: StatutPaiement;
  datePaiement?: string;
  modeRepartition: ModeRepartition;
}

// Représente une ligne de charge
export interface Charge {
  id: string;
  bienId: string;
  bienNom?: string;
  colocationId?: string;
  type: TypeCharge;
  description: string;
  montantTotal: number;
  dateCreation: string;
  dateEcheance: string;
  periodeDebut: string;
  periodeFin: string;
  modeRepartition: ModeRepartition;
  repartitionManuelle?: RepartitionManuelle[];
  detailsPaiement?: DetailPaiement[];
  statut: 'brouillon' | 'envoye' | 'paye' | 'partiel';
  factureUrl?: string;
  creePar: string;
}

// Données pour créer une nouvelle charge
export interface CreateChargeData {
  bienId: string;
  colocationId?: string;
  type: TypeCharge;
  description: string;
  montantTotal: number;
  dateEcheance: string;
  periodeDebut: string;
  periodeFin: string;
  modeRepartition: ModeRepartition;
  repartitionManuelle?: RepartitionManuelle[];
}

// Données pour mettre à jour une charge
export interface UpdateChargeData {
  type?: TypeCharge;
  description?: string;
  montantTotal?: number;
  dateEcheance?: string;
  periodeDebut?: string;
  periodeFin?: string;
  modeRepartition?: ModeRepartition;
  repartitionManuelle?: RepartitionManuelle[];
  statut?: 'brouillon' | 'envoye' | 'paye' | 'partiel';
}

// Stats sur les charges
export interface ChargeStats {
  totalCharges: number;
  montantTotal: number;
  chargesPayees: number;
  montantPaye: number;
  chargesImpayees: number;
  montantImpaye: number;
}

// Filtres pour la liste des charges
export interface ChargeFilters {
  bienId?: string;
  colocationId?: string;
  type?: TypeCharge;
  statut?: 'brouillon' | 'envoye' | 'paye' | 'partiel';
  dateDebut?: string;
  dateFin?: string;
}

// Libellés lisibles pour les types de charges
export const TYPE_CHARGE_LABELS: Record<TypeCharge, string> = {
  eau: 'Eau',
  electricite: 'Électricité',
  gaz: 'Gaz',
  internet: 'Internet',
  assurance: 'Assurance',
  entretien: 'Entretien',
  menage: 'Ménage',
  ascenseur: 'Ascenseur',
  chauffage: 'Chauffage',
  autre: 'Autre'
};

// Libellés lisibles pour les modes de répartition
export const MODE_REPARTITION_LABELS: Record<ModeRepartition, string> = {
  egal: 'Égalitaire',
  prorata: 'Au prorata',
  manuel: 'Manuel'
};

// Libellés lisibles pour les statuts de paiement
export const STATUT_PAIEMENT_LABELS: Record<StatutPaiement, string> = {
  impaye: 'Impayé',
  partiel: 'Partiel',
  paye: 'Payé'
};
