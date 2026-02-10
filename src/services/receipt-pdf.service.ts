import { Receipt } from '../types/receipt';

export const receiptPdfService = {
  // Helper function to escape template literals
  escapeTemplate(str: string): string {
    return str.replace(/\${/g, '${"${"}');
  },

  // Generate PDF content as HTML string (for printing/downloading)
  generateReceiptHtml(receipt: Receipt): string {
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

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quittance de loyer - ${receipt.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 20px; }
    .receipt { max-width: 800px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 8px; overflow: hidden; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header .receipt-number { font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .info-value { font-weight: 600; font-size: 13px; }
    .amount-section { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
    .amount-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
    .amount-value { font-size: 28px; font-weight: bold; color: #2563eb; }
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
  <div class="water-mark">QUITTANCE</div>
  <div class="receipt">
    <div class="header">
      <h1>QUITTANCE DE LOYER</h1>
      <div class="receipt-number">N° ${receipt.receiptNumber}</div>
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

      <div class="section">
        <div class="section-title">DÉTAILS DU PAIEMENT</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Date de paiement</span>
            <span class="info-value">${formatDate(receipt.paymentDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mode de paiement</span>
            <span class="info-value">${receipt.paymentMethod.replace('_', ' ').toUpperCase()}</span>
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
    </div>

    <div class="footer">
      <p>Document généré le ${formatDate(new Date())}</p>
      <p>Cette quittance atteste la réception du montant indiqué ci-dessus</p>
    </div>
  </div>
</body>
</html>`;
  },

  // Download receipt as PDF
  async downloadReceiptPdf(receipt: Receipt, filename?: string): Promise<void> {
    const html = this.generateReceiptHtml(receipt);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },

  // Generate PDF blob for download
  async generateReceiptBlob(receipt: Receipt): Promise<Blob> {
    const html = this.generateReceiptHtml(receipt);
    return new Blob([html], { type: 'text/html' });
  },

  // Generate multiple receipts as a single HTML document
  generateBulkReceiptsHtml(receipts: Receipt[]): string {
    const receiptsHtml = receipts.map(receipt => {
      const html = this.generateReceiptHtml(receipt);
      return html;
    }).join('<div style="page-break-after: always;"></div>');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liste des quittances</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${receiptsHtml}
</body>
</html>`;
  },

  // Download multiple receipts
  async downloadBulkReceiptsPdf(receipts: Receipt[]): Promise<void> {
    if (receipts.length === 0) return;
    
    const html = this.generateBulkReceiptsHtml(receipts);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },
};
