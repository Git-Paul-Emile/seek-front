import { RentPayment, PaymentStatus } from '@/types/rent-payment';
import { LeaseContractsService } from './lease-contracts.service';

const STORAGE_KEY = 'agency_payments';

// Mapping des méthodes de paiement
const mapPaymentMethod = (method: string): string => {
  const mapping: Record<string, string> = {
    especes: 'cash',
    virement: 'bank_transfer',
    mobile_money: 'mobile_money',
    cheque: 'check',
    online: 'cash',
    autre: 'cash',
  };
  return mapping[method] || 'cash';
};

export class AgencyPaymentsService {
  private leaseService = new LeaseContractsService();

  private getFromStorage(): RentPayment[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(payments: RentPayment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }

  getAll(): RentPayment[] {
    return this.getFromStorage();
  }

  getById(paymentId: string): RentPayment | undefined {
    const payments = this.getFromStorage();
    return payments.find(p => p.id === paymentId);
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

  markAsPaidWithPartial(
    paymentId: string,
    paymentMethod: string,
    paidAmount: number,
    paidDate?: string
  ): RentPayment {
    const payments = this.getFromStorage();
    const index = payments.findIndex(p => p.id === paymentId);
    
    if (index === -1) {
      throw new Error('Paiement non trouvé');
    }

    const payment = payments[index];
    const isFullyPaid = paidAmount >= payment.amount;

    payments[index] = {
      ...payment,
      status: (isFullyPaid ? 'paye' : 'partiel') as PaymentStatus,
      paymentMethod: paymentMethod as any,
      paidDate: isFullyPaid ? (paidDate || new Date().toISOString()) : undefined,
      amountPaid: isFullyPaid ? payment.amount : paidAmount,
      remainingAmount: isFullyPaid ? 0 : payment.amount - paidAmount,
      isPartial: !isFullyPaid,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(payments);
    return payments[index];
  }

  getStats() {
    const payments = this.getFromStorage();
    
    const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);
    const collected = payments.filter(p => p.status === 'paye');
    const pending = payments.filter(p => p.status === 'en_attente');

    const totalCollected = collected.reduce((sum, p) => sum + p.amount, 0);

    // Statistiques mensuelles
    const monthlyData: { [key: string]: { expected: number; collected: number; pending: number; partial: number; late: number } } = {};
    
    payments.forEach(p => {
      const monthKey = new Date(p.dueDate).toISOString().slice(0, 7);
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { expected: 0, collected: 0, pending: 0, partial: 0, late: 0 };
      }
      
      monthlyData[monthKey].expected += p.amount;
      
      if (p.status === 'paye') {
        monthlyData[monthKey].collected += p.amount;
      } else if (p.status === 'en_attente') {
        monthlyData[monthKey].pending += p.amount;
      } else if (p.status === 'partiel') {
        monthlyData[monthKey].partial += p.amount;
      } else if (p.status === 'en_retard') {
        monthlyData[monthKey].late += p.amount;
      }
    });

    const monthlyStats = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalExpected,
      totalCollected,
      totalPending: pending.length,
      totalPartial: payments.filter(p => p.status === 'partiel').length,
      totalLate: payments.filter(p => p.status === 'en_retard').length,
      totalLateFees: 0,
      totalSecurityDeposits: 0,
      totalSecurityDepositsRefunded: 0,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
      monthlyStats,
    };
  }
}

export const agencyPaymentsService = new AgencyPaymentsService();
