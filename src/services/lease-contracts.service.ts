import {
  LeaseContract,
  CreateLeaseInput,
  RenewLeaseInput,
  TerminateLeaseInput,
} from '@/types/lease-contract';

// Mock data store (in production, this would be an API)
const STORAGE_KEY = 'lease_contracts';

export class LeaseContractsService {
  private getFromStorage(): LeaseContract[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(contracts: LeaseContract[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  }

  generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BL-${timestamp}${random}`.toUpperCase();
  }

  calculateEndDate(startDate: string, duration: { value: number; unit: 'months' | 'years' }): string {
    const start = new Date(startDate);
    if (duration.unit === 'months') {
      start.setMonth(start.getMonth() + duration.value);
    } else {
      start.setFullYear(start.getFullYear() + duration.value);
    }
    return start.toISOString();
  }

  create(input: CreateLeaseInput, property: { id: string; address: string; type: string; surface?: number; rooms?: number }, tenants: Array<{ id: string; fullName: string; email: string; phone?: string }>): LeaseContract {
    const contracts = this.getFromStorage();
    
    const newContract: LeaseContract = {
      id: this.generateId(),
      type: input.type,
      property: {
        id: property.id,
        address: property.address,
        type: property.type,
        surface: property.surface,
        rooms: property.rooms,
      },
      tenants: tenants.filter(t => input.tenantIds.includes(t.id)),
      startDate: input.startDate,
      endDate: this.calculateEndDate(input.startDate, input.duration),
      duration: input.duration,
      rentAmount: input.rentAmount,
      depositAmount: input.depositAmount,
      paymentDueDay: input.paymentDueDay,
      clauses: input.clauses,
      status: 'actif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contracts.push(newContract);
    this.saveToStorage(contracts);
    
    return newContract;
  }

  renew(input: RenewLeaseInput, originalContract: LeaseContract): LeaseContract {
    const contracts = this.getFromStorage();
    const index = contracts.findIndex(c => c.id === input.contractId);
    
    if (index === -1) {
      throw new Error('Contrat non trouvé');
    }

    const original = contracts[index];
    const startDate = input.newStartDate || original.endDate;

    const renewedContract: LeaseContract = {
      ...original,
      id: this.generateId(),
      startDate,
      endDate: this.calculateEndDate(startDate, input.newDuration),
      duration: input.newDuration,
      rentAmount: input.newRentAmount || original.rentAmount,
      status: 'renouvele',
      renewedFrom: input.contractId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update original contract status
    contracts[index] = {
      ...original,
      status: 'renouvele',
      updatedAt: new Date().toISOString(),
    };

    contracts.push(renewedContract);
    this.saveToStorage(contracts);
    
    return renewedContract;
  }

  terminate(input: TerminateLeaseInput): LeaseContract {
    const contracts = this.getFromStorage();
    const index = contracts.findIndex(c => c.id === input.contractId);
    
    if (index === -1) {
      throw new Error('Contrat non trouvé');
    }

    contracts[index] = {
      ...contracts[index],
      status: 'resilie',
      terminatedAt: input.terminationDate,
      terminationReason: input.reason,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(contracts);
    
    return contracts[index];
  }

  update(contractId: string, updates: Partial<LeaseContract>): LeaseContract {
    const contracts = this.getFromStorage();
    const index = contracts.findIndex(c => c.id === contractId);
    
    if (index === -1) {
      throw new Error('Contrat non trouvé');
    }

    contracts[index] = {
      ...contracts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(contracts);
    
    return contracts[index];
  }

  delete(contractId: string): void {
    const contracts = this.getFromStorage();
    const filtered = contracts.filter(c => c.id !== contractId);
    this.saveToStorage(filtered);
  }

  getById(contractId: string): LeaseContract | undefined {
    const contracts = this.getFromStorage();
    return contracts.find(c => c.id === contractId);
  }

  getAll(): LeaseContract[] {
    return this.getFromStorage();
  }

  getByStatus(status: LeaseContract['status']): LeaseContract[] {
    const contracts = this.getFromStorage();
    return contracts.filter(c => c.status === status);
  }

  getByProperty(propertyId: string): LeaseContract[] {
    const contracts = this.getFromStorage();
    return contracts.filter(c => c.property.id === propertyId);
  }

  getByTenant(tenantId: string): LeaseContract[] {
    const contracts = this.getFromStorage();
    return contracts.filter(c => c.tenants.some(t => t.id === tenantId));
  }

  getActiveContracts(): LeaseContract[] {
    const contracts = this.getFromStorage();
    const now = new Date();
    return contracts.filter(c => 
      c.status === 'actif' && 
      new Date(c.startDate) <= now && 
      new Date(c.endDate) > now
    );
  }

  getExpiringContracts(daysAhead: number = 30): LeaseContract[] {
    const contracts = this.getFromStorage();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return contracts.filter(c => 
      c.status === 'actif' &&
      new Date(c.endDate) > now &&
      new Date(c.endDate) <= futureDate
    );
  }

  getStats(): {
    total: number;
    actif: number;
    expire: number;
    resilie: number;
    renouvele: number;
    totalRent: number;
  } {
    const contracts = this.getFromStorage();
    
    return {
      total: contracts.length,
      actif: contracts.filter(c => c.status === 'actif').length,
      expire: contracts.filter(c => c.status === 'expire').length,
      resilie: contracts.filter(c => c.status === 'resilie').length,
      renouvele: contracts.filter(c => c.status === 'renouvele').length,
      totalRent: contracts
        .filter(c => c.status === 'actif')
        .reduce((sum, c) => sum + c.rentAmount, 0),
    };
  }
}

export const leaseContractsService = new LeaseContractsService();
