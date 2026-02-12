import { ReceiptTemplate } from '../types/receipt';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Default template
const defaultTemplate: ReceiptTemplate = {
  id: 'default',
  name: 'Modèle par défaut',
  agencyName: 'Mon Agence Immobilière',
  agencyAddress: '123 Rue Principale, Dakar',
  agencyPhone: '+221 33 123 45 67',
  agencyEmail: 'contact@agence.com',
  headerColor: '#2563eb',
  footerText: 'Cette quittance atteste la réception du montant indiqué ci-dessus.',
  showSignature: true,
  showWatermark: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Simulated templates store
const templates: ReceiptTemplate[] = [defaultTemplate];

export const receiptTemplateService = {
  // Get all templates
  async getTemplates(): Promise<ReceiptTemplate[]> {
    return [...templates];
  },

  // Get template by ID
  async getTemplateById(id: string): Promise<ReceiptTemplate | undefined> {
    return templates.find(t => t.id === id);
  },

  // Get default template
  async getDefaultTemplate(): Promise<ReceiptTemplate> {
    return defaultTemplate;
  },

  // Create new template
  async createTemplate(template: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReceiptTemplate> {
    const newTemplate: ReceiptTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    templates.push(newTemplate);
    return newTemplate;
  },

  // Update template
  async updateTemplate(id: string, updates: Partial<ReceiptTemplate>): Promise<ReceiptTemplate | undefined> {
    const index = templates.findIndex(t => t.id === id);
    if (index > -1) {
      templates[index] = {
        ...templates[index],
        ...updates,
        updatedAt: new Date(),
      };
      return templates[index];
    }
    return undefined;
  },

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    if (id === 'default') return false; // Can't delete default template
    const index = templates.findIndex(t => t.id === id);
    if (index > -1) {
      templates.splice(index, 1);
      return true;
    }
    return false;
  },

  // Duplicate template
  async duplicateTemplate(id: string, newName: string): Promise<ReceiptTemplate | undefined> {
    const template = templates.find(t => t.id === id);
    if (template) {
      return this.createTemplate({
        ...template,
        name: newName,
        createdAt: undefined as any,
        updatedAt: undefined as any,
      });
    }
    return undefined;
  },

  // Apply template to receipt HTML generation
  applyTemplateToHtml(receipt: any, template: ReceiptTemplate): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
      }).format(amount);
    };

    const statusLabel = receipt.status === 'paid' ? 'PAYÉ' : receipt.status === 'pending' ? 'EN ATTENTE' : 'PARTIEL';
    const statusClass = 'status-' + receipt.status;

    // Colocation info if applicable
    let colocatairesHtml = '';
    if (receipt.isColocation && receipt.colocataires && receipt.colocataires.length > 0) {
      colocatairesHtml = `
        <div class="section">
          <div class="section-title">COLOCATION</div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Locataire</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">Part</th>
                <th style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.colocataires.map((c: any) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${c.tenantName} ${c.isPrimaryTenant ? '(Principal)' : ''}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">${c.sharePercentage || 100}%</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">${formatCurrency(c.amount)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold; background: #f3f4f6;">
                <td style="padding: 8px; border: 1px solid #e5e7eb;">Total</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;"></td>
                <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">${formatCurrency(receipt.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quittance de loyer - ${receipt.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 20px; }
    .receipt { max-width: 800px; margin: 0 auto; border: 2px solid ${template.headerColor}; border-radius: 8px; overflow: hidden; }
    .header { background: ${template.headerColor}; color: white; padding: 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header .receipt-number { font-size: 14px; opacity: 0.9; }
    .agency-info { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .agency-name { font-weight: bold; font-size: 14px; }
    .agency-contact { font-size: 11px; color: #6b7280; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: ${template.headerColor}; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .info-value { font-weight: 600; font-size: 13px; }
    .amount-section { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
    .amount-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
    .amount-value { font-size: 28px; font-weight: bold; color: ${template.headerColor}; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-partial { background: #e0e7ff; color: #3730a3; }
    .footer { background: #f9fafb; padding: 15px 30px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center; }
    .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
    .water-mark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(37, 99, 235, 0.05); pointer-events: none; white-space: nowrap; }
    @media print { body { padding: 0; } .receipt { border: none; } }
  </style>
</head>
<body>
  ${template.showWatermark ? '<div class="water-mark">QUITTANCE</div>' : ''}
  <div class="receipt">
    <div class="header">
      <h1>QUITTANCE DE LOYER</h1>
      <div class="receipt-number">N° ${receipt.receiptNumber}</div>
    </div>
    
    <div class="agency-info">
      <div>
        <div class="agency-name">${template.agencyName}</div>
        <div class="agency-contact">${template.agencyAddress}</div>
      </div>
      <div class="agency-contact">
        <div>${template.agencyPhone}</div>
        <div>${template.agencyEmail}</div>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">INFORMATIONS DU BIEN</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Propriété</span>
            <span class="info-value">${receipt.propertyName || 'Non spécifié'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Chambre/Appartement</span>
            <span class="info-value">${receipt.roomName || 'Non spécifié'}</span>
          </div>
          ${receipt.ownerName ? `
          <div class="info-item">
            <span class="info-label">Propriétaire</span>
            <span class="info-value">${receipt.ownerName}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">INFORMATIONS DU LOCATAIRE</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nom complet</span>
            <span class="info-value">${receipt.tenantName || 'Non spécifié'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">${receipt.tenantEmail || 'Non spécifié'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Téléphone</span>
            <span class="info-value">${receipt.tenantPhone || 'Non spécifié'}</span>
          </div>
        </div>
      </div>

      ${colocatairesHtml}

      <div class="section">
        <div class="section-title">DÉTAILS DU PAIEMENT</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Date de paiement</span>
            <span class="info-value">${formatDate(receipt.paymentDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mode de paiement</span>
            <span class="info-value">${receipt.paymentMethod.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Période de</span>
            <span class="info-value">${formatDate(receipt.periodStart)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Période à</span>
            <span class="info-value">${formatDate(receipt.periodEnd)}</span>
          </div>
          ${receipt.reference ? `<div class="info-item"><span class="info-label">Référence</span><span class="info-value">${receipt.reference}</span></div>` : ''}
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-label">Montant du loyer</div>
        <div class="amount-value">${formatCurrency(receipt.amount)}</div>
        <span class="status ${statusClass}">${statusLabel}</span>
      </div>

      ${template.showSignature ? `
      <div class="signature">
        <div class="signature-box">
          <div>Signature du bailleur</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div>Signature du locataire</div>
          <div class="signature-line"></div>
        </div>
      </div>
      ` : ''}
      
      ${template.customTerms ? `
      <div class="section" style="margin-top: 20px;">
        <div class="section-title">CONDITIONS PARTICULIÈRES</div>
        <p style="font-size: 11px; color: #6b7280;">${template.customTerms}</p>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>Document généré le ${formatDate(new Date())}</p>
      <p>${template.footerText}</p>
    </div>
  </div>
</body>
</html>`;
  },
};
