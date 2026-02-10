import {
  RentPayment,
  CreatePaymentInput,
  UpdatePaymentInput,
  RentRevisionInput,
  RentPaymentFilter,
  RentStats,
  PaymentStatus,
  PartialPaymentInput,
  SecurityDepositRefundInput,
  RefundStatus,
} from '@/types/rent-payment';
import { LeaseContractsService } from './lease-contracts.service';

const STORAGE_KEY = 'rent_payments';
const LATE_FEE_PERCENTAGE = 0.05; // 5% de pénalité de retard par défaut
const GRACE_PERIOD_DAYS = 5; // Délai de grâce de 5 jours

export class RentPaymentsService {
  private leaseService = new LeaseContractsService();

  private getFromStorage(): RentPayment[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(payments: RentPayment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }

  private getPaymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY-${timestamp}${random}`.toUpperCase();
  }

  generatePaymentsForContract(contractId: string, months: number = 12): RentPayment[] {
    const contract = this.leaseService.getById(contractId);
    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    const payments: RentPayment[] = [];
    const startDate = new Date(contract.startDate);
    const dueDay = contract.paymentDueDay;

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Ajuster le jour d'échéance
      if (dueDate.getDate() !== dueDay) {
        dueDate.setDate(dueDay);
        // Si la date调整后的日期在调整前日期之后，需要回退一个月
        if (dueDate.getDate() > dueDay) {
          dueDate.setDate(dueDay);
        }
      }

      // Ne pas dépasser la date de fin du contrat
      if (dueDate > new Date(contract.endDate)) {
        break;
      }

      // Vérifier si le paiement existe déjà
      const existingPayment = this.getByContractAndMonth(contractId, dueDate.getMonth(), dueDate.getFullYear());
      if (existingPayment) {
        continue;
      }

      const payment: RentPayment = {
        id: this.getPaymentId(),
        contractId,
        tenantId: contract.tenants[0]?.id || '',
        propertyId: contract.property.id,
        amount: contract.rentAmount,
        amountPaid: 0,
        dueDate: dueDate.toISOString(),
        status: 'en_attente',
        isPartial: false,
        remainingAmount: contract.rentAmount,
        securityDeposit: contract.depositAmount || undefined,
        securityDepositStatus: 'aucun',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      payments.push(payment);
    }

    // Sauvegarder tous les paiements générés
    if (payments.length > 0) {
      const existing = this.getFromStorage();
      this.saveToStorage([...existing, ...payments]);
    }

    return payments;
  }

  create(input: CreatePaymentInput): RentPayment {
    const payments = this.getFromStorage();
    const contract = this.leaseService.getById(input.contractId);
    
    if (!contract) {
      throw new Error('Contrat non trouvé');
    }

    const newPayment: RentPayment = {
      id: this.getPaymentId(),
      contractId: input.contractId,
      tenantId: contract.tenants[0]?.id || '',
      propertyId: contract.property.id,
      amount: input.amount,
      amountPaid: 0,
      dueDate: input.dueDate,
      status: 'en_attente',
      isPartial: input.isPartial || false,
      remainingAmount: input.amount,
      securityDeposit: contract.depositAmount || undefined,
      securityDepositStatus: input.securityDepositStatus || 'aucun',
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    payments.push(newPayment);
    this.saveToStorage(payments);

    return newPayment;
  }

  update(input: UpdatePaymentInput): RentPayment {
    const payments = this.getFromStorage();
    const index = payments.findIndex(p => p.id === input.paymentId);
    
    if (index === -1) {
      throw new Error('Paiement non trouvé');
    }

    payments[index] = {
      ...payments[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(payments);
    return payments[index];
  }

  markAsPaid(
    paymentId: string,
    paymentMethod: RentPayment['paymentMethod'],
    paidDate?: string
  ): RentPayment {
    return this.update({
      paymentId,
      status: 'paye',
      paymentMethod,
      paidDate: paidDate || new Date().toISOString(),
    });
  }

  applyLateFee(paymentId: string, feePercentage: number = LATE_FEE_PERCENTAGE): RentPayment {
    const payment = this.getById(paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    const lateFee = payment.amount * feePercentage;
    
    return this.update({
      paymentId,
      lateFee,
      penaltyApplied: true,
    });
  }

  reviseRent(input: RentRevisionInput): RentPayment {
    const payment = this.getById(input.paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    return this.update({
      paymentId: input.paymentId,
      amount: input.newAmount,
      previousAmount: payment.amount,
      revisionDate: input.effectiveDate,
      revisionNote: input.reason,
    });
  }

  delete(paymentId: string): void {
    const payments = this.getFromStorage();
    const filtered = payments.filter(p => p.id !== paymentId);
    this.saveToStorage(filtered);
  }

  getById(paymentId: string): RentPayment | undefined {
    const payments = this.getFromStorage();
    return payments.find(p => p.id === paymentId);
  }

  getAll(): RentPayment[] {
    return this.getFromStorage();
  }

  getByContract(contractId: string): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => p.contractId === contractId);
  }

  getByContractAndMonth(contractId: string, month: number, year: number): RentPayment | undefined {
    const payments = this.getFromStorage();
    return payments.find(p => {
      const paymentDate = new Date(p.dueDate);
      return (
        p.contractId === contractId &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  }

  getByTenant(tenantId: string): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => p.tenantId === tenantId);
  }

  getByProperty(propertyId: string): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => p.propertyId === propertyId);
  }

  getByRoom(roomId: string): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => p.roomId === roomId);
  }

  filter(filter: RentPaymentFilter): RentPayment[] {
    let payments = this.getFromStorage();

    if (filter.contractId) {
      payments = payments.filter(p => p.contractId === filter.contractId);
    }
    if (filter.tenantId) {
      payments = payments.filter(p => p.tenantId === filter.tenantId);
    }
    if (filter.propertyId) {
      payments = payments.filter(p => p.propertyId === filter.propertyId);
    }
    if (filter.roomId) {
      payments = payments.filter(p => p.roomId === filter.roomId);
    }
    if (filter.status) {
      payments = payments.filter(p => p.status === filter.status);
    }
    if (filter.startDate) {
      payments = payments.filter(p => new Date(p.dueDate) >= new Date(filter.startDate!));
    }
    if (filter.endDate) {
      payments = payments.filter(p => new Date(p.dueDate) <= new Date(filter.endDate!));
    }

    return payments;
  }

  getExpectedPayments(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.status === 'en_attente');

    if (startDate) {
      payments = payments.filter(p => new Date(p.dueDate) >= new Date(startDate));
    }
    if (endDate) {
      payments = payments.filter(p => new Date(p.dueDate) <= new Date(endDate));
    }

    return payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  getCollectedPayments(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.status === 'paye');

    if (startDate) {
      payments = payments.filter(p => p.paidDate && new Date(p.paidDate) >= new Date(startDate));
    }
    if (endDate) {
      payments = payments.filter(p => p.paidDate && new Date(p.paidDate) <= new Date(endDate));
    }

    return payments.sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime());
  }

  getLatePayments(): RentPayment[] {
    const payments = this.getFromStorage();
    const now = new Date();

    return payments
      .filter(p => {
        if (p.status !== 'en_attente') return false;
        const dueDate = new Date(p.dueDate);
        dueDate.setDate(dueDate.getDate() + GRACE_PERIOD_DAYS);
        return dueDate < now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  updateLateStatuses(): void {
    const payments = this.getFromStorage();
    const now = new Date();
    let updated = false;

    const updatedPayments = payments.map(p => {
      if (p.status === 'en_attente') {
        const dueDate = new Date(p.dueDate);
        dueDate.setDate(dueDate.getDate() + GRACE_PERIOD_DAYS);
        
        if (dueDate < now) {
          updated = true;
          return {
            ...p,
            status: 'en_retard' as PaymentStatus,
            lateFee: p.lateFee || p.amount * LATE_FEE_PERCENTAGE,
            penaltyApplied: true,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return p;
    });

    if (updated) {
      this.saveToStorage(updatedPayments);
    }
  }

  getStats(startDate?: string, endDate?: string): RentStats {
    const payments = this.getFromStorage();
    
    // Filtrer par période si spécifiée
    let filtered = payments;
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.dueDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.dueDate) <= new Date(endDate));
    }

    const totalExpected = filtered.reduce((sum, p) => sum + p.amount, 0);
    const collected = filtered.filter(p => p.status === 'paye');
    const pending = filtered.filter(p => p.status === 'en_attente');
    const partial = filtered.filter(p => p.status === 'partiel');
    const late = filtered.filter(p => p.status === 'en_retard');

    const totalCollected = collected.reduce((sum, p) => sum + p.amount, 0);
    const totalLateFees = filtered.reduce((sum, p) => sum + (p.lateFee || 0), 0);
    
    // Statistiques de la caution
    const securityDeposits = filtered.filter(p => p.securityDeposit && p.securityDeposit > 0);
    const refunded = filtered.filter(p => p.securityDepositStatus === 'rembourse');
    const totalSecurityDeposits = securityDeposits.reduce((sum, p) => sum + (p.securityDeposit || 0), 0);
    const totalSecurityDepositsRefunded = refunded.reduce((sum, p) => sum + (p.securityDepositRefundAmount || 0), 0);

    // Statistiques mensuelles
    const monthlyData: { [key: string]: { expected: number; collected: number; pending: number; partial: number; late: number } } = {};
    
    filtered.forEach(p => {
      const monthKey = new Date(p.dueDate).toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { expected: 0, collected: 0, pending: 0, partial: 0, late: 0 };
      }
      
      monthlyData[monthKey].expected += p.amount;
      
      if (p.status === 'paye') {
        monthlyData[monthKey].collected += p.amount;
      } else if (p.status === 'en_retard') {
        monthlyData[monthKey].late += p.amount;
      } else if (p.status === 'en_attente') {
        monthlyData[monthKey].pending += p.amount;
      } else if (p.status === 'partiel') {
        monthlyData[monthKey].partial += p.amount;
      }
    });

    const monthlyStats = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalExpected,
      totalCollected,
      totalPending: pending.length,
      totalPartial: partial.length,
      totalLate: late.length,
      totalLateFees,
      totalSecurityDeposits,
      totalSecurityDepositsRefunded,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
      monthlyStats,
    };
  }

  getByPropertyAndMonth(propertyId: string, month: number, year: number): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => {
      const paymentDate = new Date(p.dueDate);
      return (
        p.propertyId === propertyId &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  }

  getByRoomAndMonth(roomId: string, month: number, year: number): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => {
      const paymentDate = new Date(p.dueDate);
      return (
        p.roomId === roomId &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  }

  getByTenantAndMonth(tenantId: string, month: number, year: number): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => {
      const paymentDate = new Date(p.dueDate);
      return (
        p.tenantId === tenantId &&
        paymentDate.getMonth() === month &&
        paymentDate.getFullYear() === year
      );
    });
  }

  // === NOUVELLES MÉTHODES POUR LA GESTION DES PAIEMENTS ===

  /**
   * Enregistrer un paiement partiel
   */
  createPartialPayment(input: PartialPaymentInput): RentPayment {
    const parentPayment = this.getById(input.parentPaymentId);
    if (!parentPayment) {
      throw new Error('Paiement parent non trouvé');
    }

    const newAmountPaid = parentPayment.amountPaid + input.amount;
    const newRemainingAmount = parentPayment.amount - newAmountPaid;
    const isFullyPaid = newRemainingAmount <= 0;

    // Créer le paiement partiel
    const partialPayment = this.create({
      contractId: parentPayment.contractId,
      amount: input.amount,
      dueDate: input.paidDate || new Date().toISOString(),
      description: input.description || 'Paiement partiel',
      isPartial: true,
    });

    // Mettre à jour le paiement parent
    this.update({
      paymentId: input.parentPaymentId,
      amountPaid: newAmountPaid,
      remainingAmount: Math.max(0, newRemainingAmount),
      isPartial: true,
      status: isFullyPaid ? 'paye' : 'partiel',
      paymentMethod: input.paymentMethod,
      paidDate: isFullyPaid ? (input.paidDate || new Date().toISOString()) : undefined,
      partialPayments: [...(parentPayment.partialPayments || []), partialPayment.id],
    });

    return this.getById(partialPayment.id)!;
  }

  /**
   * Marquer un paiement comme impayé (annuler le paiement)
   */
  markAsUnpaid(paymentId: string): RentPayment {
    const payment = this.getById(paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    return this.update({
      paymentId,
      status: payment.lateFee && payment.lateFee > 0 ? 'en_retard' : 'en_attente',
      paymentMethod: undefined,
      paidDate: undefined,
      amountPaid: 0,
      remainingAmount: payment.amount,
      isPartial: false,
    });
  }

  /**
   * Marquer un paiement comme payé avec support du paiement partiel
   */
  markAsPaidWithPartial(
    paymentId: string,
    paymentMethod: RentPayment['paymentMethod'],
    paidAmount: number,
    paidDate?: string
  ): RentPayment {
    const payment = this.getById(paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    const isFullyPaid = paidAmount >= payment.amount;
    
    return this.update({
      paymentId,
      status: isFullyPaid ? 'paye' : 'partiel',
      paymentMethod,
      paidDate: isFullyPaid ? (paidDate || new Date().toISOString()) : undefined,
      amountPaid: isFullyPaid ? payment.amount : paidAmount,
      remainingAmount: isFullyPaid ? 0 : payment.amount - paidAmount,
      isPartial: !isFullyPaid,
    });
  }

  /**
   * Demander le remboursement de la caution
   */
  requestSecurityDepositRefund(paymentId: string, reason?: string): RentPayment {
    return this.update({
      paymentId,
      securityDepositStatus: 'demande',
      securityDepositNotes: reason,
    });
  }

  /**
   * Approuver le remboursement de la caution
   */
  approveSecurityDepositRefund(paymentId: string): RentPayment {
    return this.update({
      paymentId,
      securityDepositStatus: 'approuve',
    });
  }

  /**
   * Enregistrer le remboursement effectif de la caution
   */
  refundSecurityDeposit(input: SecurityDepositRefundInput): RentPayment {
    const payment = this.getById(input.paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }

    return this.update({
      paymentId: input.paymentId,
      securityDepositStatus: 'rembourse',
      securityDepositRefundDate: input.refundDate,
      securityDepositRefundAmount: input.refundAmount,
      securityDepositNotes: input.notes,
    });
  }

  /**
   * Refuser le remboursement de la caution
   */
  refuseSecurityDepositRefund(paymentId: string, reason: string): RentPayment {
    return this.update({
      paymentId,
      securityDepositStatus: 'refuse',
      securityDepositNotes: reason,
    });
  }

  /**
   * Filtrer les paiements par mode de paiement
   */
  getByPaymentMethod(method: RentPayment['paymentMethod']): RentPayment[] {
    const payments = this.getFromStorage();
    return payments.filter(p => p.paymentMethod === method);
  }

  /**
   * Récupérer l'historique complet des paiements
   */
  getPaymentHistory(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.status === 'paye' || p.status === 'partiel');

    if (startDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) <= new Date(endDate)
      );
    }

    return payments.sort((a, b) => 
      new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime()
    );
  }

  /**
   * Récupérer les paiements Mobile Money
   */
  getMobileMoneyPayments(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.paymentMethod === 'mobile_money');

    if (startDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) <= new Date(endDate)
      );
    }

    return payments.sort((a, b) => 
      new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime()
    );
  }

  /**
   * Récupérer les paiements par virement
   */
  getBankTransferPayments(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.paymentMethod === 'virement');

    if (startDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      payments = payments.filter(p => 
        p.paidDate && new Date(p.paidDate) <= new Date(endDate)
      );
    }

    return payments.sort((a, b) => 
      new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime()
    );
  }

  /**
   * Récupérer les paiements partiels
   */
  getPartialPayments(startDate?: string, endDate?: string): RentPayment[] {
    let payments = this.getFromStorage().filter(p => p.isPartial || p.status === 'partiel');

    if (startDate) {
      payments = payments.filter(p => new Date(p.dueDate) >= new Date(startDate));
    }
    if (endDate) {
      payments = payments.filter(p => new Date(p.dueDate) <= new Date(endDate));
    }

    return payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  /**
   * Récupérer les demandes de remboursement de caution
   */
  getSecurityDepositRefundRequests(): RentPayment[] {
    return this.getFromStorage().filter(p => 
      p.securityDepositStatus === 'demande' || 
      p.securityDepositStatus === 'approuve'
    );
  }

  /**
   * Récupérer les cautions remboursées
   */
  getRefundedSecurityDeposits(): RentPayment[] {
    return this.getFromStorage().filter(p => p.securityDepositStatus === 'rembourse');
  }
}

export const rentPaymentsService = new RentPaymentsService();
