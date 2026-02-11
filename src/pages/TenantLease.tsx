import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Euro, Download, AlertCircle, Clock, CheckCircle, AlertTriangle, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';
import { LeaseContractInfo } from '../types/tenant';

interface PaymentInfo {
  id: string;
  month: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'late';
  paymentDate?: string;
  penalty?: number;
  penaltyApplied: boolean;
}

const TenantLease: React.FC = () => {
  const { toast } = useToast();
  const [lease, setLease] = useState<LeaseContractInfo | null>(null);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [currentPayment, setCurrentPayment] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadLeaseInfo();
    loadPaymentInfo();
  }, []);

  const loadLeaseInfo = async () => {
    try {
      const data = await tenantService.getLeaseContract();
      setLease(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentInfo = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const mockPayments: PaymentInfo[] = [];
      for (let i = 0; i < 6; i++) {
        const paymentDate = new Date(currentYear, currentMonth - i, 1);
        const dueDate = new Date(currentYear, currentMonth - i, 5);
        const isPaid = i > 0;
        const isLate = i === 0 && currentDate > dueDate;
        
        mockPayments.push({
          id: `payment-${i}`,
          month: paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          amount: 500,
          dueDate: dueDate.toISOString(),
          status: isPaid ? 'paid' : (isLate ? 'late' : 'pending'),
          paymentDate: isPaid ? new Date(currentYear, currentMonth - i + 1, 3).toISOString() : undefined,
          penalty: isLate ? 25 : undefined,
          penaltyApplied: isLate
        });
      }
      
      setPayments(mockPayments.slice(1));
      setCurrentPayment(mockPayments[0]);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> En attente</Badge>;
      case 'late':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" /> En retard</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadContract = async () => {
    if (!lease) return;
    
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let currentY = margin;
      
      const checkPageBreak = (neededSpace: number) => {
        if (currentY + neededSpace > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = margin;
        }
      };
      
      const addTitle = (text: string, size: number = 16) => {
        checkPageBreak(size);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, currentY);
        currentY += size * 0.5;
      };
      
      const addSectionTitle = (text: string) => {
        checkPageBreak(14);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, currentY);
        currentY += 7;
        doc.setFont('helvetica', 'normal');
      };
      
      const addParagraph = (text: string, fontSize: number = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, currentY);
          currentY += 7;
        });
        currentY += 3;
      };
      
      addTitle('CONTRAT DE BAIL', 18);
      addTitle('(BAIL CLASSIQUE)', 12);
      currentY += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Référence: BAIL-${lease.id.slice(0, 8).toUpperCase()}`, margin, currentY);
      currentY += 15;
      
      addSectionTitle('ENTRE LES SOUSSIGNÉS');
      addParagraph('M./Mme Locataire, désigné(e) comme "le Preneur"');
      addParagraph('Et le Bailleur, désigné comme "le Bailleur"');
      addParagraph('Il a été convenu et arrêté ce qui suit :');
      currentY += 5;
      
      addSectionTitle('ARTICLE 1 - OBJET DU BAIL');
      addParagraph("Le présent bail a pour objet la location d'un bien immobilier à usage d'habitation principale situé au :");
      addParagraph(`Adresse: ${lease.propertyName}`);
      addParagraph(`Chambre: N°${lease.roomNumber}`);
      
      addSectionTitle('ARTICLE 2 - DURÉE DU BAIL');
      const months = Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      addParagraph(`Le présent bail est conclu pour une durée de ${months} mois, à compter du ${formatDate(lease.startDate)} jusqu'au ${formatDate(lease.endDate)}.`);
      
      addSectionTitle('ARTICLE 3 - LOYER');
      addParagraph(`Le loyer est fixé à ${formatCurrency(lease.monthlyRent)} par mois, payable au plus tard le 1er de chaque mois.`);
      addParagraph("Le paiement s'effectue par virement bancaire ou espèces selon les modalités convenues entre les parties.");
      
      addSectionTitle('ARTICLE 4 - DÉPÔT DE GARANTIE');
      addParagraph(`Un dépôt de garantie de ${formatCurrency(lease.securityDeposit)} est versé par le Preneur au Bailleur lors de la signature du présent bail.`);
      addParagraph('Ce dépôt sera restitué au Preneur dans un délai maximum de deux mois après la restitution des clés, déduction faite le cas échéant des sommes dues au titre des charges, des travaux de remise en état ou des loyers impayés.');
      
      addSectionTitle('ARTICLE 5 - CLAUSES ET CONDITIONS');
      
      const clauses = [
        { title: 'Objet du bail', content: "Le présent bail a pour objet la location d'un bien immobilier à usage d'habitation principale." },
        { title: 'Destination des lieux', content: 'Les locaux loués sont destinés à l\'usage exclusif d\'habitation du Preneur et de sa famille. Toute activité professionnelle y est formellement interdite.' },
        { title: 'État des lieux', content: "Un état des lieux d'entrée et de sortie sera établi contradictoirement entre les parties lors de la remise et de la restitution des clés." },
        { title: 'Charges et travaux', content: "Les charges locatives comprennent les dépenses d'entretien courant des parties communes, de jardinage et les dépenses d'éclairage des parties communes." },
        { title: 'Réparations', content: 'Le Preneur s\'engage à maintenir les locaux en bon état et à effectuer les menues réparations locatives.' },
      ];
      
      clauses.forEach((clause, index) => {
        checkPageBreak(14);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${clause.title.toUpperCase()}`, margin + 5, currentY);
        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        addParagraph(clause.content);
      });
      
      currentY += 10;
      checkPageBreak(50);
      addSectionTitle('SIGNATURES');
      addParagraph('En foi de quoi, les parties ont signé le présent bail en deux exemplaires.');
      currentY += 15;
      
      doc.rect(margin, currentY, 70, 40);
      doc.setFontSize(10);
      doc.text('LE BAILLEUR', margin + 35, currentY + 35);
      
      doc.rect(pageWidth - margin - 70, currentY, 70, 40);
      doc.text('LE(S) PRENEUR(S)', pageWidth - margin - 35, currentY + 35);
      
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
      }
      
      const fileName = `bail_${lease.propertyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Téléchargement réussi',
        description: 'Le contrat de bail a été téléchargé avec succès.',
      });
    } catch (error) {
      console.error('Erreur jsPDF:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon bail</h1>
          <p className="text-muted-foreground">
            Votre contrat de location
          </p>
        </div>
        {lease && (
          <Button onClick={downloadContract} disabled={isDownloading}>
            {isDownloading ? (
              <span className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? 'Téléchargement...' : 'Télécharger le bail'}
          </Button>
        )}
      </div>

      {lease ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contract Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                État du contrat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge 
                  variant={lease.status === 'active' ? 'default' : lease.status === 'pending' ? 'secondary' : 'destructive'}
                >
                  {lease.status === 'active' ? 'Actif' : 
                   lease.status === 'pending' ? 'En attente' : 
                   lease.status === 'expired' ? 'Expiré' : 'Résilié'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Logement</span>
                <span className="font-medium">{lease.propertyName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chambre</span>
                <span className="font-medium">N°{lease.roomNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates du bail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date de début</span>
                <span className="font-medium">
                  {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date de fin</span>
                <span className="font-medium">
                  {new Date(lease.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Durée restante</p>
                <p className="text-2xl font-bold">
                  {Math.ceil((new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))} mois
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Conditions financières
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loyer mensuel</span>
                <span className="text-xl font-bold">{lease.monthlyRent.toLocaleString()} €</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dépôt de garantie</span>
                <span className="font-medium">{lease.securityDeposit.toLocaleString()} €</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Modalités de paiement</p>
                <p className="text-sm">Paiement mensuel par virement ou prélèvement</p>
                <p className="text-sm">Échéance le 1er de chaque mois</p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du contrat</CardTitle>
              <CardDescription>
                Référence et détails administratifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de contrat</p>
                <p className="font-medium">BAIL-{lease.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Type de bail</p>
                <p className="font-medium">Bail meublé (habitation principale)</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Préavis</p>
                <p className="font-medium">1 mois (selon la loi ALUR)</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Informations importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Le loyer est dû le 1er de chaque mois</li>
                <li>Une quittance de loyer vous sera envoyée après chaque paiement</li>
                <li>Pour toute réparation ou problème, utilisez la fonctionnalité "Signaler un problème"</li>
                <li>Le dépôt de garantie vous sera restitué dans un délai maximum de 2 mois après la sortie</li>
                <li>Toute modification du contrat doit être faite par écrit</li>
              </ul>
            </CardContent>
          </Card>

          {/* SECTION LOYERS & ÉCHÉANCES */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Loyers & Échéances
              </CardTitle>
              <CardDescription>
                Suivi de vos paiements de loyer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Payment Status */}
              {currentPayment && (
                <div className="p-4 border rounded-lg bg-gradient-to-r from-muted/50 to-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Loyer à payer</p>
                      <p className="text-3xl font-bold">{formatCurrency(currentPayment.amount)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentPayment.status === 'pending' && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Échéance: {new Date(currentPayment.dueDate).toLocaleDateString('fr-FR')}
                            ({getDaysUntilDue(currentPayment.dueDate)} jour{Math.abs(getDaysUntilDue(currentPayment.dueDate)) > 1 ? 's' : ''})
                          </span>
                        )}
                        {currentPayment.status === 'late' && (
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            Retard de {Math.abs(getDaysUntilDue(currentPayment.dueDate))} jour{Math.abs(getDaysUntilDue(currentPayment.dueDate)) > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(currentPayment.status)}
                      {currentPayment.penaltyApplied && currentPayment.penalty && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-600 font-medium">
                            Pénalité: {formatCurrency(currentPayment.penalty)}
                          </p>
                          <p className="text-xs text-red-500">
                            (5% du loyer après {new Date(currentPayment.dueDate).toLocaleDateString('fr-FR')})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {currentPayment.status !== 'paid' && (
                    <div className="mt-4">
                      <Button className="w-full sm:w-auto">
                        <Euro className="mr-2 h-4 w-4" />
                        Payer maintenant
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Penalty Info */}
              {lease && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Pénalités de retard</p>
                      <p className="text-sm text-amber-700 mt-1">
                        En cas de retard de paiement, une pénalité de 5% du loyer mensuel sera appliquée 
                        après la date d'échéance. Le taux d'intérêt légal peut également être appliqué 
                        selon la durée du retard.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Historique des paiements</h3>
                {payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mois</TableHead>
                        <TableHead>Date d'échéance</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de paiement</TableHead>
                        <TableHead>Pénalité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.month}</TableCell>
                          <TableCell>
                            {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            {payment.paymentDate 
                              ? new Date(payment.paymentDate).toLocaleDateString('fr-FR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {payment.penaltyApplied && payment.penalty ? (
                              <span className="text-red-500 font-medium">
                                {formatCurrency(payment.penalty)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 mb-4" />
                    <p>Aucun historique de paiement disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun contrat trouvé</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore de contrat de bail associé à votre compte.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantLease;
