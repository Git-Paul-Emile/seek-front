import {
  ReminderConfig,
  ReminderHistory,
  ReminderSettings,
  SendReminderInput,
  BulkReminderInput,
  DEFAULT_REMINDER_MESSAGES,
  NotificationChannel,
  ReminderType,
} from '../types/reminder';
import { RentPayment } from '../types/rent-payment';
import { notificationsService, SendResult } from './notifications.service';

// Simple UUID generator
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simulated storage keys
const STORAGE_KEYS = {
  SETTINGS: 'seek_reminder_settings',
  HISTORY: 'seek_reminder_history',
  CONFIGS: 'seek_reminder_configs',
};

class ReminderService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Get default settings
  getDefaultSettings(): ReminderSettings {
    return {
      id: generateId(),
      ownerId: 'default',
      reminderBeforeDueEnabled: true,
      reminderBeforeDueDays: 5,
      reminderBeforeDueChannels: ['email'],
      reminderAfterDueEnabled: true,
      reminderAfterDueDays: [3, 7, 14],
      reminderAfterDueChannels: ['whatsapp', 'sms'],
      messageBeforeDue: DEFAULT_REMINDER_MESSAGES.beforeDue,
      messageAfterDue: DEFAULT_REMINDER_MESSAGES.afterDue,
      totalRemindersSent: 0,
      totalRemindersFailed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Get reminder settings
  getSettings(): ReminderSettings {
    return this.getStorage<ReminderSettings>(STORAGE_KEYS.SETTINGS, this.getDefaultSettings());
  }

  // Save reminder settings
  saveSettings(settings: ReminderSettings): void {
    settings.updatedAt = new Date().toISOString();
    this.setStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  // Get reminder history
  getHistory(): ReminderHistory[] {
    return this.getStorage<ReminderHistory[]>(STORAGE_KEYS.HISTORY, []);
  }

  // Add entry to history
  private addToHistory(entry: Omit<ReminderHistory, 'id' | 'createdAt'>): ReminderHistory {
    const history = this.getHistory();
    const newEntry: ReminderHistory = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    history.unshift(newEntry);
    // Keep only last 500 entries
    if (history.length > 500) {
      history.splice(500);
    }
    this.setStorage(STORAGE_KEYS.HISTORY, history);
    return newEntry;
  }

  // Get reminders configs
  getConfigs(): ReminderConfig[] {
    return this.getStorage<ReminderConfig[]>(STORAGE_KEYS.CONFIGS, []);
  }

  // Save reminder config
  saveConfig(config: ReminderConfig): void {
    const configs = this.getConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    this.setStorage(STORAGE_KEYS.CONFIGS, configs);
  }

  // Delete reminder config
  deleteConfig(configId: string): void {
    const configs = this.getConfigs().filter(c => c.id !== configId);
    this.setStorage(STORAGE_KEYS.CONFIGS, configs);
  }

  // Send reminder to a single payment
  async sendReminder(
    input: SendReminderInput,
    tenantName: string,
    tenantEmail?: string,
    tenantPhone?: string
  ): Promise<ReminderHistory> {
    const settings = this.getSettings();
    
    // Get the message template
    let message = input.message || '';
    if (!message) {
      message = input.type === 'before_due'
        ? settings.messageBeforeDue
        : settings.messageAfterDue;
    }

    let result: SendResult | undefined;

    // Create reminder receipt object
    const reminderReceipt = {
      id: input.paymentId,
      receiptNumber: `Rappel-${Date.now()}`,
      tenantName,
      tenantEmail: tenantEmail || '',
      tenantPhone: tenantPhone || '',
      contractId: '',
      propertyId: '',
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      amount: 0,
      status: 'en_attente' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Send based on channel
    switch (input.channel) {
      case 'email':
        if (tenantEmail) {
          result = await notificationsService.sendReceiptByEmail(
            reminderReceipt as any,
            tenantEmail
          );
        }
        break;
      case 'whatsapp':
        if (tenantPhone) {
          result = await notificationsService.sendReceiptByWhatsApp(
            reminderReceipt as any,
            tenantPhone
          );
        }
        break;
      case 'sms':
        if (tenantPhone) {
          result = await notificationsService.sendReceiptBySMS(
            reminderReceipt as any,
            tenantPhone
          );
        }
        break;
    }

    // Record in history
    const entry = this.addToHistory({
      paymentId: input.paymentId,
      contractId: '',
      tenantId: '',
      tenantName,
      tenantEmail,
      tenantPhone,
      channel: input.channel,
      type: input.type,
      status: result?.success ? 'sent' : 'failed',
      message,
      sentAt: result?.success ? new Date().toISOString() : undefined,
      errorMessage: result?.error,
      triggeredBy: 'manual',
    });

    // Update stats
    if (result?.success) {
      settings.totalRemindersSent++;
      settings.lastReminderSentAt = new Date().toISOString();
    } else {
      settings.totalRemindersFailed++;
    }
    this.saveSettings(settings);

    return entry;
  }

  // Send bulk reminders
  async sendBulkReminders(
    input: BulkReminderInput,
    payments: Array<{ payment: RentPayment; tenantName: string; tenantEmail?: string; tenantPhone?: string }>
  ): Promise<{ total: number; successful: number; failed: number; results: ReminderHistory[] }> {
    let successful = 0;
    let failed = 0;
    const results: ReminderHistory[] = [];

    for (const item of payments) {
      const entry = await this.sendReminder(
        {
          paymentId: item.payment.id,
          channel: input.channel,
          type: input.type,
        },
        item.tenantName,
        item.tenantEmail,
        item.tenantPhone
      );

      results.push(entry);
      if (entry.status === 'sent') {
        successful++;
      } else {
        failed++;
      }
    }

    return { total: payments.length, successful, failed, results };
  }

  // Get pending reminders (automatic processing)
  getPendingReminders(payments: RentPayment[]): {
    beforeDue: Array<{ payment: RentPayment; daysUntilDue: number }>;
    afterDue: Array<{ payment: RentPayment; daysLate: number }>;
  } {
    const settings = this.getSettings();
    const now = new Date();
    const beforeDue: Array<{ payment: RentPayment; daysUntilDue: number }> = [];
    const afterDue: Array<{ payment: RentPayment; daysLate: number }> = [];

    for (const payment of payments) {
      if (payment.status === 'paye') continue;

      const dueDate = new Date(payment.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check for reminders before due date
      if (settings.reminderBeforeDueEnabled && daysUntilDue <= settings.reminderBeforeDueDays && daysUntilDue > 0) {
        beforeDue.push({ payment, daysUntilDue });
      }

      // Check for reminders after due date
      if (settings.reminderAfterDueEnabled && daysLate > 0) {
        for (const days of settings.reminderAfterDueDays) {
          if (daysLate === days) {
            afterDue.push({ payment, daysLate });
            break;
          }
        }
      }
    }

    return { beforeDue, afterDue };
  }

  // Get reminder statistics
  getStats(): {
    totalSent: number;
    totalFailed: number;
    byChannel: Record<NotificationChannel, { sent: number; failed: number }>;
    byType: Record<ReminderType, number>;
  } {
    const history = this.getHistory();
    
    const stats = {
      totalSent: 0,
      totalFailed: 0,
      byChannel: {
        email: { sent: 0, failed: 0 },
        whatsapp: { sent: 0, failed: 0 },
        sms: { sent: 0, failed: 0 },
      },
      byType: {
        before_due: 0,
        after_due: 0,
      },
    };

    for (const entry of history) {
      if (entry.status === 'sent') {
        stats.totalSent++;
        stats.byChannel[entry.channel].sent++;
        stats.byType[entry.type]++;
      } else if (entry.status === 'failed') {
        stats.totalFailed++;
        stats.byChannel[entry.channel].failed++;
      }
    }

    return stats;
  }
}

export const reminderService = new ReminderService();
