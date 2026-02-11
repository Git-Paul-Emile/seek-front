import { NotificationPreference, UpdateNotificationPreferencesInput } from '../types/tenant';
import tenantAuthService from './tenant-auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Données simulées pour le développement
const MOCK_PREFERENCES: NotificationPreference = {
  id: 'mock-prefs-1',
  tenantId: 'mock-tenant-1',
  paymentReminder: {
    enabled: true,
    daysBeforeDue: 3,
    channels: ['whatsapp', 'sms'],
  },
  paymentReceived: {
    enabled: true,
    channels: ['email'],
  },
  receiptAvailable: {
    enabled: true,
    channels: ['email', 'whatsapp'],
  },
  dueDateSoon: {
    enabled: true,
    daysBeforeDue: 5,
    channels: ['sms'],
  },
  email: 'locataire@email.com',
  phone: '+237 6 12 34 56 78',
  whatsapp: '+237 6 12 34 56 78',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

class NotificationPreferencesService {
  private useMock = true; // À mettre à false quand le backend sera disponible

  private getAuthHeaders(): HeadersInit {
    const token = tenantAuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getPreferences(): Promise<NotificationPreference> {
    if (this.useMock) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      // Récupérer depuis localStorage ou utiliser les données par défaut
      const stored = localStorage.getItem('notificationPreferences');
      if (stored) {
        return JSON.parse(stored);
      }
      return MOCK_PREFERENCES;
    }

    const response = await fetch(`${API_URL}/tenants/notifications/preferences`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Échec de la récupération des préférences de notification');
    }

    return response.json();
  }

  async updatePreferences(input: UpdateNotificationPreferencesInput): Promise<NotificationPreference> {
    if (this.useMock) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentPrefs = await this.getPreferences();
      
      const updatedPrefs: NotificationPreference = {
        id: currentPrefs.id,
        tenantId: currentPrefs.tenantId,
        email: input.email !== undefined ? input.email : currentPrefs.email,
        phone: input.phone !== undefined ? input.phone : currentPrefs.phone,
        whatsapp: input.whatsapp !== undefined ? input.whatsapp : currentPrefs.whatsapp,
        paymentReminder: {
          enabled: input.paymentReminder?.enabled ?? currentPrefs.paymentReminder.enabled,
          daysBeforeDue: input.paymentReminder?.daysBeforeDue ?? currentPrefs.paymentReminder.daysBeforeDue,
          channels: input.paymentReminder?.channels ?? currentPrefs.paymentReminder.channels,
        },
        paymentReceived: {
          enabled: input.paymentReceived?.enabled ?? currentPrefs.paymentReceived.enabled,
          channels: input.paymentReceived?.channels ?? currentPrefs.paymentReceived.channels,
        },
        receiptAvailable: {
          enabled: input.receiptAvailable?.enabled ?? currentPrefs.receiptAvailable.enabled,
          channels: input.receiptAvailable?.channels ?? currentPrefs.receiptAvailable.channels,
        },
        dueDateSoon: {
          enabled: input.dueDateSoon?.enabled ?? currentPrefs.dueDateSoon.enabled,
          daysBeforeDue: input.dueDateSoon?.daysBeforeDue ?? currentPrefs.dueDateSoon.daysBeforeDue,
          channels: input.dueDateSoon?.channels ?? currentPrefs.dueDateSoon.channels,
        },
        createdAt: currentPrefs.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      return updatedPrefs;
    }

    const response = await fetch(`${API_URL}/tenants/notifications/preferences`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Échec de la mise à jour des préférences de notification');
    }

    return response.json();
  }

  async enablePaymentReminder(daysBeforeDue: number, channels: ('email' | 'whatsapp' | 'sms')[]): Promise<NotificationPreference> {
    return this.updatePreferences({
      paymentReminder: {
        enabled: true,
        daysBeforeDue,
        channels,
      },
    });
  }

  async disablePaymentReminder(): Promise<NotificationPreference> {
    return this.updatePreferences({
      paymentReminder: {
        enabled: false,
        channels: [],
      },
    });
  }

  async enablePaymentReceived(channels: ('email' | 'whatsapp' | 'sms')[]): Promise<NotificationPreference> {
    return this.updatePreferences({
      paymentReceived: {
        enabled: true,
        channels,
      },
    });
  }

  async disablePaymentReceived(): Promise<NotificationPreference> {
    return this.updatePreferences({
      paymentReceived: {
        enabled: false,
        channels: [],
      },
    });
  }

  async enableReceiptAvailable(channels: ('email' | 'whatsapp' | 'sms')[]): Promise<NotificationPreference> {
    return this.updatePreferences({
      receiptAvailable: {
        enabled: true,
        channels,
      },
    });
  }

  async disableReceiptAvailable(): Promise<NotificationPreference> {
    return this.updatePreferences({
      receiptAvailable: {
        enabled: false,
        channels: [],
      },
    });
  }

  async enableDueDateSoon(daysBeforeDue: number, channels: ('email' | 'whatsapp' | 'sms')[]): Promise<NotificationPreference> {
    return this.updatePreferences({
      dueDateSoon: {
        enabled: true,
        daysBeforeDue,
        channels,
      },
    });
  }

  async disableDueDateSoon(): Promise<NotificationPreference> {
    return this.updatePreferences({
      dueDateSoon: {
        enabled: false,
        channels: [],
      },
    });
  }

  async updateContactInfo(email?: string, phone?: string, whatsapp?: string): Promise<NotificationPreference> {
    return this.updatePreferences({
      email,
      phone,
      whatsapp,
    });
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
export default notificationPreferencesService;
