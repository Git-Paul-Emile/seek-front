export type PaymentStatus = 'en_attente' | 'paye' | 'partiel' | 'en_retard' | 'annule';

export type PaymentMethod = 'virement' | 'especes' | 'cheque' | 'mobile_money' | 'online' | 'autre';

export type RefundStatus = 'aucun' | 'demande' | 'approuve' | 'rembourse' | 'refuse';

export interface RentPayment {
  id: string;
  contractId: string;
  tenantId: string;
  propertyId: string;
  roomId?: string;
  
  // Information sur le loyer
  amount: number; // Montant total dû
  amountPaid: number; // Montant effectivement payé
  dueDate: string; // ISO format - date d'échéance
  paidDate?: string; // ISO format - date de paiement effectif
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  
  // Paiement partiel
  isPartial: boolean; // Si c'est un paiement partiel
  remainingAmount: number; // Montant restant à payer
  partialPayments?: string[]; // IDs des paiements partiels liés
  
  // Caution (dépôt de garantie)
  securityDeposit?: number; // Montant de la caution
  securityDepositStatus: RefundStatus; // Statut de la caution
  securityDepositRefundDate?: string; // Date de remboursement de la caution
  securityDepositRefundAmount?: number; // Montant remboursé
  securityDepositNotes?: string; // Notes sur le remboursement
  
  // Révision du loyer
  revisionNote?: string;
  previousAmount?: number; // Avant révision
  revisionDate?: string; // Date de la révision
  
  // Informations complémentaires
  description?: string;
  lateFee?: number; // Pénalité de retard
  penaltyApplied?: boolean;
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  contractId: string;
  amount: number;
  dueDate: string;
  description?: string;
  isPartial?: boolean;
  securityDeposit?: number;
  securityDepositStatus?: RefundStatus;
}

export interface UpdatePaymentInput {
  paymentId: string;
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidDate?: string;
  lateFee?: number;
  description?: string;
  penaltyApplied?: boolean;
  previousAmount?: number;
  revisionDate?: string;
  revisionNote?: string;
  // Champs pour paiement partiel
  isPartial?: boolean;
  amountPaid?: number;
  remainingAmount?: number;
  partialPayments?: string[];
  // Champs pour caution
  securityDepositStatus?: RefundStatus;
  securityDepositRefundDate?: string;
  securityDepositRefundAmount?: number;
  securityDepositNotes?: string;
}

export interface RentRevisionInput {
  paymentId: string;
  newAmount: number;
  reason: string;
  effectiveDate: string;
}

export interface RentPaymentFilter {
  contractId?: string;
  tenantId?: string;
  propertyId?: string;
  roomId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  isPartial?: boolean;
  securityDepositStatus?: RefundStatus;
}

export interface RentStats {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalPartial: number;
  totalLate: number;
  totalLateFees: number;
  totalSecurityDeposits: number;
  totalSecurityDepositsRefunded: number;
  collectionRate: number;
  monthlyStats: {
    month: string;
    expected: number;
    collected: number;
    pending: number;
    partial: number;
    late: number;
  }[];
}

export interface PartialPaymentInput {
  parentPaymentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate?: string;
  description?: string;
}

export interface SecurityDepositRefundInput {
  paymentId: string;
  refundAmount: number;
  refundDate: string;
  notes?: string;
}

export interface RefundRequest {
  id: string;
  contractId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  notes?: string;
}
