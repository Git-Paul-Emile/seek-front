export type NotificationChannel = 'email' | 'whatsapp' | 'sms';

export type ReminderType = 'before_due' | 'after_due';

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export type ReminderTrigger = 'automatic' | 'manual';

export interface ReminderConfig {
  id: string;
  name: string;
  type: ReminderType;
  daysBeforeDue?: number; // Pour before_due
  daysAfterDue?: number; // Pour after_due
  channels: NotificationChannel[];
  isEnabled: boolean;
  messageTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderHistory {
  id: string;
  paymentId: string;
  contractId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  channel: NotificationChannel;
  type: ReminderType;
  status: ReminderStatus;
  message: string;
  sentAt?: string;
  errorMessage?: string;
  triggeredBy: ReminderTrigger;
  createdAt: string;
}

export interface ReminderSettings {
  id: string;
  ownerId: string;
  // Rappels avant échéance
  reminderBeforeDueEnabled: boolean;
  reminderBeforeDueDays: number;
  reminderBeforeDueChannels: NotificationChannel[];
  // Relances après retard
  reminderAfterDueEnabled: boolean;
  reminderAfterDueDays: number[];
  reminderAfterDueChannels: NotificationChannel[];
  // Messages personnalisés
  messageBeforeDue: string;
  messageAfterDue: string;
  // Statistiques
  totalRemindersSent: number;
  totalRemindersFailed: number;
  lastReminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderConfigInput {
  name: string;
  type: ReminderType;
  daysBeforeDue?: number;
  daysAfterDue?: number;
  channels: NotificationChannel[];
  messageTemplate: string;
}

export interface SendReminderInput {
  paymentId: string;
  channel: NotificationChannel;
  type: ReminderType;
  message?: string;
}

export interface BulkReminderInput {
  paymentIds: string[];
  channel: NotificationChannel;
  type: ReminderType;
}

export const DEFAULT_REMINDER_MESSAGES = {
  beforeDue: `Bonjour {tenant_name},

Votre loyer de {amount} pour la période du {period_start} au {period_end} arrive à échéance le {due_date}.

Merci de procéder au paiement avant cette date.

Cordialement,
L'équipe de gestion`,
  
  afterDue: `Bonjour {tenant_name},

Nous vous informons que votre loyer de {amount} pour la période du {period_start} au {period_end} est en retard depuis le {due_date}.

Merci de procéder au paiement dès que possible afin d'éviter toute pénalité.

Cordialement,
L'équipe de gestion`,
};
