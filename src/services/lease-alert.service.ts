import { LeaseContract } from '@/types/lease-contract';

export interface LeaseAlert {
  id: string;
  contractId: string;
  type: AlertType;
  daysUntilExpiry: number;
  message: string;
  createdAt: string;
  read: boolean;
  actionTaken?: string;
}

export type AlertType = 'expiry_soon' | 'expiry_today' | 'expired' | 'auto_renewal_pending' | 'signature_pending' | 'payment_overdue';

export interface AlertSettings {
  expiryWarningDays: number[]; // Jours avant expiration pour alerter
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableAutoRenewal: boolean;
  autoRenewalDefaultDays: number;
}

const STORAGE_KEY = 'lease_alerts';
const SETTINGS_KEY = 'lease_alert_settings';

export class LeaseAlertService {
  private getAlertsFromStorage(): LeaseAlert[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveAlertsToStorage(alerts: LeaseAlert[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }

  private getSettingsFromStorage(): AlertSettings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Default settings
    return {
      expiryWarningDays: [90, 60, 30, 14, 7, 1],
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableAutoRenewal: false,
      autoRenewalDefaultDays: 30,
    };
  }

  private saveSettingsToStorage(settings: AlertSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ALT-${timestamp}${random}`.toUpperCase();
  }

  checkAndGenerateAlerts(contracts: LeaseContract[]): LeaseAlert[] {
    const alerts = this.getAlertsFromStorage();
    const settings = this.getSettingsFromStorage();
    const now = new Date();
    const newAlerts: LeaseAlert[] = [];

    contracts.forEach(contract => {
      if (contract.status !== 'actif') return;

      const endDate = new Date(contract.endDate);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check for expiry warnings
      if (settings.expiryWarningDays.includes(daysUntilExpiry) && daysUntilExpiry > 0) {
        const existingAlert = alerts.find(
          a => a.contractId === contract.id && a.type === 'expiry_soon' && a.daysUntilExpiry === daysUntilExpiry
        );

        if (!existingAlert) {
          const newAlert: LeaseAlert = {
            id: this.generateId(),
            contractId: contract.id,
            type: 'expiry_soon',
            daysUntilExpiry,
            message: `Le bail ${contract.id} expire dans ${daysUntilExpiry} jour(s) (${endDate.toLocaleDateString('fr-FR')})`,
            createdAt: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(newAlert);
        }
      }

      // Check for expiry today
      if (daysUntilExpiry === 0) {
        const existingAlert = alerts.find(
          a => a.contractId === contract.id && a.type === 'expiry_today'
        );

        if (!existingAlert) {
          const newAlert: LeaseAlert = {
            id: this.generateId(),
            contractId: contract.id,
            type: 'expiry_today',
            daysUntilExpiry: 0,
            message: `Le bail ${contract.id} expire aujourd'hui !`,
            createdAt: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(newAlert);
        }
      }

      // Check for already expired contracts
      if (daysUntilExpiry < 0) {
        const existingAlert = alerts.find(
          a => a.contractId === contract.id && a.type === 'expired'
        );

        if (!existingAlert) {
          const newAlert: LeaseAlert = {
            id: this.generateId(),
            contractId: contract.id,
            type: 'expired',
            daysUntilExpiry,
            message: `Le bail ${contract.id} a expiré il y a ${Math.abs(daysUntilExpiry)} jour(s)`,
            createdAt: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(newAlert);
        }
      }

      // Check for auto-renewal pending
      if (contract.autoRenewal && daysUntilExpiry <= settings.autoRenewalDefaultDays && daysUntilExpiry > 0) {
        const existingAlert = alerts.find(
          a => a.contractId === contract.id && a.type === 'auto_renewal_pending'
        );

        if (!existingAlert) {
          const newAlert: LeaseAlert = {
            id: this.generateId(),
            contractId: contract.id,
            type: 'auto_renewal_pending',
            daysUntilExpiry,
            message: `Le bail ${contract.id} est éligible au renouvellement automatique`,
            createdAt: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(newAlert);
        }
      }

      // Check for pending signatures
      if (contract.signatureEnabled && !contract.ownerSignature) {
        const existingAlert = alerts.find(
          a => a.contractId === contract.id && a.type === 'signature_pending'
        );

        if (!existingAlert) {
          const newAlert: LeaseAlert = {
            id: this.generateId(),
            contractId: contract.id,
            type: 'signature_pending',
            daysUntilExpiry,
            message: `Le bail ${contract.id} est en attente de signature`,
            createdAt: new Date().toISOString(),
            read: false,
          };
          newAlerts.push(newAlert);
        }
      }
    });

    // Save new alerts
    if (newAlerts.length > 0) {
      this.saveAlertsToStorage([...alerts, ...newAlerts]);
    }

    return [...alerts, ...newAlerts].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  markAsRead(alertId: string): void {
    const alerts = this.getAlertsFromStorage();
    const index = alerts.findIndex(a => a.id === alertId);

    if (index !== -1) {
      alerts[index] = { ...alerts[index], read: true };
      this.saveAlertsToStorage(alerts);
    }
  }

  markAllAsRead(): void {
    const alerts = this.getAlertsFromStorage();
    const updatedAlerts = alerts.map(a => ({ ...a, read: true }));
    this.saveAlertsToStorage(updatedAlerts);
  }

  deleteAlert(alertId: string): void {
    const alerts = this.getAlertsFromStorage();
    const filtered = alerts.filter(a => a.id !== alertId);
    this.saveAlertsToStorage(filtered);
  }

  clearOldAlerts(daysOld: number = 365): void {
    const alerts = this.getAlertsFromStorage();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

    const filtered = alerts.filter(a =>
      new Date(a.createdAt) > cutoffDate || !a.read
    );

    this.saveAlertsToStorage(filtered);
  }

  getAllAlerts(): LeaseAlert[] {
    return this.getAlertsFromStorage().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getUnreadAlerts(): LeaseAlert[] {
    return this.getAlertsFromStorage().filter(a => !a.read);
  }

  getAlertsByContract(contractId: string): LeaseAlert[] {
    return this.getAlertsFromStorage().filter(a => a.contractId === contractId);
  }

  getAlertsByType(type: AlertType): LeaseAlert[] {
    return this.getAlertsFromStorage().filter(a => a.type === type);
  }

  getAlertStats(): {
    total: number;
    unread: number;
    expirySoon: number;
    expired: number;
    pendingSignature: number;
  } {
    const alerts = this.getAlertsFromStorage();

    return {
      total: alerts.length,
      unread: alerts.filter(a => !a.read).length,
      expirySoon: alerts.filter(a => a.type === 'expiry_soon').length,
      expired: alerts.filter(a => a.type === 'expired').length,
      pendingSignature: alerts.filter(a => a.type === 'signature_pending').length,
    };
  }

  // Settings management
  getSettings(): AlertSettings {
    return this.getSettingsFromStorage();
  }

  updateSettings(settings: Partial<AlertSettings>): AlertSettings {
    const currentSettings = this.getSettingsFromStorage();
    const newSettings = { ...currentSettings, ...settings };
    this.saveSettingsToStorage(newSettings);
    return newSettings;
  }

  addExpiryWarningDay(day: number): void {
    const settings = this.getSettingsFromStorage();
    if (!settings.expiryWarningDays.includes(day)) {
      settings.expiryWarningDays.push(day);
      settings.expiryWarningDays.sort((a, b) => b - a);
      this.saveSettingsToStorage(settings);
    }
  }

  removeExpiryWarningDay(day: number): void {
    const settings = this.getSettingsFromStorage();
    settings.expiryWarningDays = settings.expiryWarningDays.filter(d => d !== day);
    this.saveSettingsToStorage(settings);
  }
}

export const leaseAlertService = new LeaseAlertService();
