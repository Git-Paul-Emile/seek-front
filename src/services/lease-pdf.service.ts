import { jsPDF } from 'jspdf';
import { LeaseContract, LeaseType } from '../types/lease-contract';

export class LeasePDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private margin: number;
  private lineHeight: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.margin = 20;
    this.lineHeight = 7;
    this.currentY = this.margin;
  }

  private checkPageBreak(neededSpace: number): void {
    if (this.currentY + neededSpace > this.doc.internal.pageSize.getHeight() - 20) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(text: string, size: number = 16, style: 'normal' | 'bold' = 'bold'): void {
    this.checkPageBreak(size + this.lineHeight);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', style);
    const textWidth = this.doc.getTextWidth(text);
    this.doc.text(text, (this.pageWidth - textWidth) / 2, this.currentY);
    this.currentY += size * 0.5;
  }

  private addSectionTitle(text: string): void {
    this.checkPageBreak(this.lineHeight * 2);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    this.doc.setFont('helvetica', 'normal');
  }

  private addParagraph(text: string): void {
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string) => {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
    this.currentY += 3;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  }

  generateContractPDF(contract: LeaseContract): void {
    // Header
    this.addTitle('CONTRAT DE BAIL', 18);
    this.addTitle(
      contract.type === 'colocation' ? '(COLOCATION)' : '(BAIL CLASSIQUE)',
      12,
      'normal'
    );
    this.currentY += 10;

    // Reference
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Référence: ${contract.id}`, this.margin, this.currentY);
    this.currentY += 15;

    // Parties
    this.addSectionTitle('ENTRE LES SOUSSIGNÉS');

    if (contract.type === 'colocation') {
      this.addParagraph(
        `Les soussignés énumérés en annexe, désignés collectivement comme "les Preneurs", d'une part,`
      );
    } else {
      const tenant = contract.tenants[0];
      this.addParagraph(
        `M./Mme ${tenant.fullName}, demeurant à ${tenant.email}, désigné(e) comme "le Preneur", d'autre part,`
      );
    }

    const ownerInfo = 'PROPRIÉTAIRE (à compléter)';
    this.addParagraph(`Et ${ownerInfo}, désigné comme "le Bailleur",`);
    this.addParagraph(
      `Il a été convenu et arrêté ce qui suit :`
    );
    this.currentY += 5;

    // Article 1: Object
    this.addSectionTitle('ARTICLE 1 - OBJET DU BAIL');
    this.addParagraph(
      `Le présent bail a pour objet la location d'un bien immobilier à usage d'habitation principale situé au :`
    );
    this.addParagraph(`Adresse: ${contract.property.address}`);
    if (contract.property.surface) {
      this.addParagraph(`Surface: ${contract.property.surface} m²`);
    }
    if (contract.property.rooms) {
      this.addParagraph(`Nombre de pièces: ${contract.property.rooms}`);
    }

    // Article 2: Duration
    this.addSectionTitle('ARTICLE 2 - DURÉE DU BAIL');
    const durationText =
      contract.duration.unit === 'years'
        ? `${contract.duration.value} an(s)`
        : `${contract.duration.value} mois`;
    this.addParagraph(
      `Le présent bail est conclu pour une durée de ${durationText}, à compter du ${this.formatDate(contract.startDate)} jusqu'au ${this.formatDate(contract.endDate)}.`
    );

    // Article 3: Rent
    this.addSectionTitle('ARTICLE 3 - LOYER');
    this.addParagraph(
      `Le loyer est fixé à ${this.formatCurrency(contract.rentAmount)} par mois, payable au plus tard le ${contract.paymentDueDay} de chaque mois.`
    );
    this.addParagraph(
      `Le paiement s'effectue par virement bancaire ou espèces selon les modalités convenues entre les parties.`
    );

    // Article 4: Deposit
    this.addSectionTitle('ARTICLE 4 - DÉPÔT DE GARANTIE');
    this.addParagraph(
      `Un dépôt de garantie de ${this.formatCurrency(contract.depositAmount)} est versé par le Preneur au Bailleur lors de la signature du présent bail.`
    );
    this.addParagraph(
      `Ce dépôt sera restitué au Preneur dans un délai maximum de deux mois après la restitution des clés, déduction faite le cas échéant des sommes dues au titre des charges, des travaux de remise en état ou des loyers impayés.`
    );

    // Article 5: Clauses
    this.addSectionTitle('ARTICLE 5 - CLAUSES ET CONDITIONS');

    contract.clauses.forEach((clause, index) => {
      this.checkPageBreak(this.lineHeight * 2);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}. ${clause.title.toUpperCase()}`, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.addParagraph(clause.content);
    });

    // Article 6: Tenants (for colocation)
    if (contract.type === 'colocation' && contract.tenants.length > 0) {
      this.addSectionTitle('ARTICLE 6 - LISTE DES COLOCATAIRES');
      contract.tenants.forEach((tenant, index) => {
        this.checkPageBreak(this.lineHeight);
        this.doc.text(
          `${index + 1}. ${tenant.fullName} - ${tenant.email} - ${tenant.phone || 'N/A'}`,
          this.margin + 5,
          this.currentY
        );
        this.currentY += this.lineHeight;
      });
    }

    // Signatures
    this.currentY += 10;
    this.checkPageBreak(50);
    this.addSectionTitle('SIGNATURES');

    this.addParagraph('En foi de quoi, les parties ont signé le présent bail en deux exemplaires.');

    this.currentY += 15;

    // Signature Bailleur
    this.doc.rect(this.margin, this.currentY, 70, 40);
    this.doc.setFontSize(10);
    this.doc.text('LE BAILLEUR', this.margin + 35, this.currentY + 35);

    // Signature Preneur(s)
    this.doc.rect(this.pageWidth - this.margin - 70, this.currentY, 70, 40);
    this.doc.text('LE(S) PRENEUR(S)', this.pageWidth - this.margin - 35, this.currentY + 35);

    // Footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.pageWidth / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save
    const fileName = `bail_${contract.type}_${contract.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }

  generateContractRenewalPDF(
    originalContract: LeaseContract,
    renewedContract: LeaseContract,
    renewalDate: string
  ): void {
    // Header
    this.addTitle('AVENANT DE RENOUVELLEMENT', 18);
    this.addTitle('DE BAIL', 14);
    this.currentY += 10;

    // Reference
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Avenant N°: ${renewedContract.id}`, this.margin, this.currentY);
    this.doc.text(`Bail initial: ${originalContract.id}`, this.margin, this.currentY + 5);
    this.currentY += 15;

    // Preamble
    this.addSectionTitle('ENTRE LES SOUSSIGNÉS');
    this.addParagraph(
      `Le présent avenant de renouvellement de bail est conclu entre les mêmes parties que le bail initial référencé ci-dessus.`
    );
    this.currentY += 5;

    // Renewal terms
    this.addSectionTitle('CONDITIONS DU RENOUVELLEMENT');

    this.addParagraph(`Date de prise d'effet: ${this.formatDate(renewalDate)}`);
    this.addParagraph(
      `Nouvelle durée: ${renewedContract.duration.value} ${renewedContract.duration.unit === 'months' ? 'mois' : 'ans'}`
    );
    this.addParagraph(
      `Période couverte: du ${this.formatDate(renewedContract.startDate)} au ${this.formatDate(renewedContract.endDate)}`
    );

    if (renewedContract.rentAmount !== originalContract.rentAmount) {
      this.addParagraph(
        `Nouveau loyer: ${this.formatCurrency(renewedContract.rentAmount)}/mois (précédent: ${this.formatCurrency(originalContract.rentAmount)})`
      );
    } else {
      this.addParagraph(`Loyer inchangé: ${this.formatCurrency(renewedContract.rentAmount)}/mois`);
    }

    this.currentY += 5;
    this.addSectionTitle('AUTRES CONDITIONS');
    this.addParagraph(
      `Toutes les autres conditions du bail initial demeurent inchangées et applicables, sauf mention contraire dans le présent avenant.`
    );

    // Signatures
    this.currentY += 15;
    this.checkPageBreak(50);
    this.addSectionTitle('SIGNATURES');

    this.addParagraph('Fait à _____________, le _________________');

    this.currentY += 15;

    // Signature Bailleur
    this.doc.rect(this.margin, this.currentY, 70, 40);
    this.doc.setFontSize(10);
    this.doc.text('LE BAILLEUR', this.margin + 35, this.currentY + 35);

    // Signature Preneur(s)
    this.doc.rect(this.pageWidth - this.margin - 70, this.currentY, 70, 40);
    this.doc.text('LE(S) PRENEUR(S)', this.pageWidth - this.margin - 35, this.currentY + 35);

    // Footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.pageWidth / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `avenant_renouvellement_${renewedContract.id}.pdf`;
    this.doc.save(fileName);
  }

  generateContractTerminationPDF(
    contract: LeaseContract,
    terminationDate: string,
    reason: string
  ): void {
    // Header
    this.addTitle('LETTRE DE RÉSILIATION', 18);
    this.addTitle('DE BAIL', 14);
    this.currentY += 10;

    // Reference
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Contrat référencé: ${contract.id}`, this.margin, this.currentY);
    this.currentY += 15;

    // Body
    this.addSectionTitle('DESTINATAIRE');
    this.addParagraph(`À: ${contract.tenants.map(t => t.fullName).join(', ')}`);
    this.currentY += 5;

    this.addSectionTitle('OBJET');
    this.addParagraph(`Résiliation du contrat de bail`);
    this.currentY += 5;

    this.addSectionTitle('MOTIF');
    this.addParagraph(reason);
    this.currentY += 5;

    this.addSectionTitle('DATE DE RÉSILIATION');
    this.addParagraph(
      `La présente résiliation prendra effet le ${this.formatDate(terminationDate)}.`
    );
    this.addParagraph(
      `Le Preneur s'engage à libérer les locaux et à restituer les clés à cette date au plus tard.`
    );
    this.currentY += 5;

    this.addSectionTitle('DÉPÔT DE GARANTIE');
    this.addParagraph(
      `Le dépôt de garantie sera restitué au Preneur conformément aux conditions stipulées dans le bail, déduction faite le cas échéant des sommes dues au titre des charges, des travaux de remise en état ou des loyers impayés.`
    );
    this.currentY += 5;

    this.addSectionTitle('ÉTAT DES LIEUX');
    this.addParagraph(
      `Un état des lieux de sortie sera établi contradictoirement lors de la restitution des clés.`
    );

    // Signatures
    this.currentY += 15;
    this.checkPageBreak(50);
    this.addSectionTitle('SIGNATURES');

    this.addParagraph('Fait à _____________, le _________________');

    this.currentY += 15;

    // Signature Bailleur
    this.doc.rect(this.margin, this.currentY, 70, 40);
    this.doc.setFontSize(10);
    this.doc.text('LE BAILLEUR', this.margin + 35, this.currentY + 35);

    // Signature Preneur
    this.doc.rect(this.pageWidth - this.margin - 70, this.currentY, 70, 40);
    this.doc.text('LE PRENEUR', this.pageWidth - this.margin - 35, this.currentY + 35);

    // Footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Page ${i} sur ${pageCount}`,
        this.pageWidth / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `resiliation_${contract.id}.pdf`;
    this.doc.save(fileName);
  }
}

export const leasePDFService = new LeasePDFService();
