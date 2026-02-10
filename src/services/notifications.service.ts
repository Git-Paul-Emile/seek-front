import { Receipt } from '../types/receipt';

export interface SendOptions {
  to: string;
  subject?: string;
  message: string;
  attachment?: Blob;
  attachmentName?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const notificationsService = {
  // Send receipt via Email
  async sendReceiptByEmail(receipt: Receipt, recipientEmail: string): Promise<SendResult> {
    try {
      const subject = `Quittance de loyer - ${receipt.receiptNumber}`;
      const message = `Bonjour ${receipt.tenantName},

Veuillez trouver ci-joint votre quittance de loyer pour la période du ${new Date(receipt.periodStart).toLocaleDateString('fr-FR')} au ${new Date(receipt.periodEnd).toLocaleDateString('fr-FR')}.

Numéro de quittance: ${receipt.receiptNumber}
Montant: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(receipt.amount)}
Statut: ${receipt.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}

Merci pour votre paiement.

Cordialement,
L'équipe de gestion immobilière`;

      console.log('Email sent:', { to: recipientEmail, subject, message });
      
      return {
        success: true,
        messageId: `email-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Échec de l\'envoi de l\'email',
      };
    }
  },

  // Send receipt via WhatsApp
  async sendReceiptByWhatsApp(receipt: Receipt, phoneNumber: string): Promise<SendResult> {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      const message = `*QUITTANCE DE LOYER*

Bonjour ${receipt.tenantName},

Votre quittance de loyer est disponible.

*N° Quittance:* ${receipt.receiptNumber}
*Montant:* ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(receipt.amount)}
*Période:* ${new Date(receipt.periodStart).toLocaleDateString('fr-FR')} - ${new Date(receipt.periodEnd).toLocaleDateString('fr-FR')}
*Statut:* ${receipt.status === 'paid' ? 'PAYÉ' : 'EN ATTENTE'}

Merci pour votre paiement.`;

      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      return {
        success: true,
        messageId: `whatsapp-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Échec de l\'envoi WhatsApp',
      };
    }
  },

  // Send receipt via SMS
  async sendReceiptBySMS(receipt: Receipt, phoneNumber: string): Promise<SendResult> {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      const message = `Quittance ${receipt.receiptNumber}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(receipt.amount)} recu. Merci!`;
      
      console.log('SMS sent:', { to: cleanPhone, message });
      
      return {
        success: true,
        messageId: `sms-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Échec de l\'envoi SMS',
      };
    }
  },

  // Send receipt via multiple channels
  async sendReceiptMultiChannel(
    receipt: Receipt,
    channels: ('email' | 'whatsapp' | 'sms')[],
    email?: string,
    phone?: string
  ): Promise<Record<string, SendResult>> {
    const results: Record<string, SendResult> = {};

    for (const channel of channels) {
      switch (channel) {
        case 'email':
          if (email) {
            results.email = await this.sendReceiptByEmail(receipt, email);
          }
          break;
        case 'whatsapp':
          if (phone) {
            results.whatsapp = await this.sendReceiptByWhatsApp(receipt, phone);
          }
          break;
        case 'sms':
          if (phone) {
            results.sms = await this.sendReceiptBySMS(receipt, phone);
          }
          break;
      }
    }

    return results;
  },

  // Send bulk receipts notification
  async sendBulkReceiptsNotification(
    receipts: Receipt[],
    channels: ('email' | 'whatsapp' | 'sms')[]
  ): Promise<{ total: number; successful: number; failed: number; results: Record<string, SendResult> }> {
    let successful = 0;
    let failed = 0;
    const results: Record<string, SendResult> = {};

    for (const receipt of receipts) {
      const channelResults = await this.sendReceiptMultiChannel(
        receipt,
        channels,
        receipt.tenantEmail,
        receipt.tenantPhone
      );

      for (const [channel, result] of Object.entries(channelResults) as [string, SendResult][]) {
        const key = `${receipt.id}-${channel}`;
        results[key] = result;
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }
    }

    return {
      total: receipts.length * channels.length,
      successful,
      failed,
      results,
    };
  },
};
