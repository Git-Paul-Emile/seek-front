import {
  ManagementMandate,
  CreateMandateInput,
  UpdateMandateInput,
  MandateStatus,
  DEFAULT_MANDATE_SERVICES,
} from '@/types/lease-contract';

// Mock data store
const STORAGE_KEY = 'management_mandates';

export class ManagementMandateService {
  private getFromStorage(): ManagementMandate[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(mandates: ManagementMandate[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mandates));
  }

  generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MDT-${timestamp}${random}`.toUpperCase();
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

  create(
    input: CreateMandateInput,
    owner: { id: string; fullName: string; email: string; phone?: string },
    agency: { id: string; name: string },
    properties: Array<{ id: string; address: string; type: string; surface?: number; rooms?: number }>
  ): ManagementMandate {
    const mandates = this.getFromStorage();

    const newMandate: ManagementMandate = {
      id: this.generateId(),
      ownerId: input.ownerId,
      owner: {
        id: owner.id,
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
      },
      agencyId: agency.id,
      agencyName: agency.name,
      propertyIds: input.propertyIds,
      properties: properties.filter(p => input.propertyIds.includes(p.id)),
      startDate: input.startDate,
      endDate: this.calculateEndDate(input.startDate, input.duration),
      duration: input.duration,
      commissionPercentage: input.commissionPercentage,
      services: input.services,
      status: 'en_attente',
      terms: input.terms,
      signatureEnabled: input.signatureEnabled || false,
      autoRenewal: input.autoRenewal || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mandates.push(newMandate);
    this.saveToStorage(mandates);

    return newMandate;
  }

  update(input: UpdateMandateInput, mandateId: string): ManagementMandate {
    const mandates = this.getFromStorage();
    const index = mandates.findIndex(m => m.id === mandateId);

    if (index === -1) {
      throw new Error('Mandat non trouvé');
    }

    mandates[index] = {
      ...mandates[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(mandates);

    return mandates[index];
  }

  signOwner(mandateId: string, signatureData: string): ManagementMandate {
    return this.update({
      status: 'actif',
    }, mandateId);
  }

  signAgency(mandateId: string, signatureData: string): ManagementMandate {
    return this.update({
      status: 'actif',
    }, mandateId);
  }

  terminate(mandateId: string): ManagementMandate {
    const mandates = this.getFromStorage();
    const index = mandates.findIndex(m => m.id === mandateId);

    if (index === -1) {
      throw new Error('Mandat non trouvé');
    }

    mandates[index] = {
      ...mandates[index],
      status: 'resilie',
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(mandates);

    return mandates[index];
  }

  delete(mandateId: string): void {
    const mandates = this.getFromStorage();
    const filtered = mandates.filter(m => m.id !== mandateId);
    this.saveToStorage(filtered);
  }

  getById(mandateId: string): ManagementMandate | undefined {
    const mandates = this.getFromStorage();
    return mandates.find(m => m.id === mandateId);
  }

  getAll(): ManagementMandate[] {
    return this.getFromStorage();
  }

  getByStatus(status: MandateStatus): ManagementMandate[] {
    const mandates = this.getFromStorage();
    return mandates.filter(m => m.status === status);
  }

  getByOwner(ownerId: string): ManagementMandate[] {
    const mandates = this.getFromStorage();
    return mandates.filter(m => m.ownerId === ownerId);
  }

  getByAgency(agencyId: string): ManagementMandate[] {
    const mandates = this.getFromStorage();
    return mandates.filter(m => m.agencyId === agencyId);
  }

  getByProperty(propertyId: string): ManagementMandate[] {
    const mandates = this.getFromStorage();
    return mandates.filter(m => m.propertyIds.includes(propertyId));
  }

  getExpiringMandates(daysAhead: number = 30): ManagementMandate[] {
    const mandates = this.getFromStorage();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return mandates.filter(m =>
      m.status === 'actif' &&
      new Date(m.endDate) > now &&
      new Date(m.endDate) <= futureDate
    );
  }

  getActiveMandates(): ManagementMandate[] {
    const mandates = this.getFromStorage();
    return mandates.filter(m => m.status === 'actif');
  }

  getStats(): {
    total: number;
    actif: number;
    expire: number;
    resilie: number;
    en_attente: number;
    totalCommission: number;
  } {
    const mandates = this.getFromStorage();

    return {
      total: mandates.length,
      actif: mandates.filter(m => m.status === 'actif').length,
      expire: mandates.filter(m => m.status === 'expire').length,
      resilie: mandates.filter(m => m.status === 'resilie').length,
      en_attente: mandates.filter(m => m.status === 'en_attente').length,
      totalCommission: mandates
        .filter(m => m.status === 'actif')
        .reduce((sum, m) => sum + m.commissionPercentage, 0) / Math.max(mandates.filter(m => m.status === 'actif').length, 1),
    };
  }

  getDefaultServices(): typeof DEFAULT_MANDATE_SERVICES {
    return [...DEFAULT_MANDATE_SERVICES];
  }
}

export const managementMandateService = new ManagementMandateService();
