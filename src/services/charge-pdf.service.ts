import { Charge, TYPE_CHARGE_LABELS, MODE_REPARTITION_LABELS, STATUT_PAIEMENT_LABELS } from '../types/charge';

export const chargePdfService = {
  // Formatter la date
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Formatter la devise
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  },

  // Générer le HTML du PDF d'appel de charges
  generateChargeHtml(charge: Charge): string {
    const typeLabel = TYPE_CHARGE_LABELS[charge.type] || charge.type;
    const modeLabel = MODE_REPARTITION_LABELS[charge.modeRepartition];
    const statutClass = 'statut-' + charge.statut;

    const detailsHtml = charge.detailsPaiement?.map((detail, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${detail.colocataireNom}</td>
        <td class="text-right">${this.formatCurrency(detail.montant)}</td>
        <td>
          <span class="badge badge-${detail.statut === 'paye' ? 'success' : detail.statut === 'partiel' ? 'warning' : 'danger'}">
            ${STATUT_PAIEMENT_LABELS[detail.statut]}
          </span>
        </td>
        <td>${detail.datePaiement ? this.formatDate(detail.datePaiement) : '-'}</td>
      </tr>
    `).join('') || '';

    const totalPaye = charge.detailsPaiement?.filter(d => d.statut === 'paye').reduce((sum, d) => sum + d.montant, 0) || 0;
    const totalRestant = charge.montantTotal - totalPaye;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appel de charges - ${charge.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 20px; }
    .appel-charges { max-width: 800px; margin: 0 auto; border: 2px solid #2563eb; border-radius: 8px; overflow: hidden; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header .charge-id { font-size: 14px; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
    .info-value { font-weight: 600; font-size: 13px; }
    .info-full { grid-column: span 2; }
    .charges-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .charges-table th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #374151; }
    .charges-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .charges-table .text-right { text-align: right; }
    .summary-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
    .summary-item { padding: 10px; background: white; border-radius: 6px; }
    .summary-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 5px; }
    .summary-value { font-size: 18px; font-weight: bold; color: #2563eb; }
    .summary-value.success { color: #16a34a; }
    .summary-value.warning { color: #ca8a04; }
    .summary-value.danger { color: #dc2626; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .footer { background: #f9fafb; padding: 15px 30px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; text-align: center; }
    .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(37, 99, 235, 0.05); pointer-events: none; white-space: nowrap; }
    @media print { body { padding: 0; } .appel-charges { border: none; } }
  </style>
</head>
<body>
  <div class="watermark">APPEL DE CHARGES</div>
  <div class="appel-charges">
    <div class="header">
      <h1>APPEL DE CHARGES</h1>
      <div class="charge-id">Réf: ${charge.id}</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">INFORMATIONS DE LA CHARGE</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Type de charge</span>
            <span class="info-value">${typeLabel}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Bien concerné</span>
            <span class="info-value">${charge.bienNom || 'Non spécifié'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Description</span>
            <span class="info-value">${charge.description}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mode de répartition</span>
            <span class="info-value">${modeLabel}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Période de</span>
            <span class="info-value">${this.formatDate(charge.periodeDebut)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Période à</span>
            <span class="info-value">${this.formatDate(charge.periodeFin)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date d'échéance</span>
            <span class="info-value">${this.formatDate(charge.dateEcheance)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date de création</span>
            <span class="info-value">${this.formatDate(charge.dateCreation)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">RÉPARTITION PAR COLOCATAIRE</div>
        <table class="charges-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Colocataire</th>
              <th class="text-right">Montant</th>
              <th>Statut</th>
              <th>Date paiement</th>
            </tr>
          </thead>
          <tbody>
            ${detailsHtml}
          </tbody>
        </table>
      </div>

      <div class="summary-section">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Montant total</div>
            <div class="summary-value">${this.formatCurrency(charge.montantTotal)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Montant payé</div>
            <div class="summary-value success">${this.formatCurrency(totalPaye)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Reste à payer</div>
            <div class="summary-value ${totalRestant > 0 ? 'warning' : 'success'}">${this.formatCurrency(totalRestant)}</div>
          </div>
        </div>
      </div>

      <div class="signature">
        <div class="signature-box">
          <div>Signature du bailleur</div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box">
          <div>Signature du colocataire</div>
          <div class="signature-line"></div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Document généré le ${this.formatDate(new Date())}</p>
      <p>Cet appel de charges concerne la période du ${this.formatDate(charge.periodeDebut)} au ${this.formatDate(charge.periodeFin)}</p>
    </div>
  </div>
</body>
</html>`;
  },

  // Télécharger le PDF d'appel de charges
  async downloadChargePdf(charge: Charge, filename?: string): Promise<void> {
    const html = this.generateChargeHtml(charge);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  },

  // Générer un blob PDF pour le téléchargement
  async generateChargeBlob(charge: Charge): Promise<Blob> {
    const html = this.generateChargeHtml(charge);
    return new Blob([html], { type: 'text/html' });
  },

  // Générer plusieurs appels de charges en un seul document HTML
  generateBulkChargesHtml(charges: Charge[]): string {
    const chargesHtml = charges.map(charge => this.generateChargeHtml(charge)).join('<div style="page-break-after: always;"></div>');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liste des appels de charges</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${chargesHtml}
</body>
</html>`;
  },

  // Télécharger plusieurs appels de charges
  async downloadBulkChargesPdf(charges: Charge[]): Promise<void> {
    if (charges.length === 0) return;
    
    const html = this.generateBulkChargesHtml(charges);
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

export default chargePdfService;
