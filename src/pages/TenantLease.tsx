import React, { useEffect, useState } from 'react';
import { FileText, Calendar, Euro, Download, AlertCircle, Clock, CheckCircle, AlertTriangle, History, FileSignature, Bell, LogOut, Building2, Users, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';
import { LeaseContractInfo, DepartureRequest } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';
import DepartureRequestDialog from '../components/dialogs/DepartureRequestDialog';

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
  const [departureRequest, setDepartureRequest] = useState<DepartureRequest | null>(null);
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
      if (data) {
        const request = await tenantService.getDepartureRequest();
        setDepartureRequest(request);
      }
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

  const getDepositStatusBadge = (status: string) => {
    switch (status) {
      case 'hold':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Consignée</Badge>;
      case 'released':
        return <Badge className="bg-blue-500"><RefreshCw className="mr-1 h-3 w-3" />Libérée</Badge>;
      case 'refunded':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Remboursée</Badge>;
      case 'partially_refunded':
        return <Badge variant="warning"><AlertCircle className="mr-1 h-3 w-3" />Partiellement remboursée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartureStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500"><CheckCircle className="mr-1 h-3 w-3" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Refusée</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Terminée</Badge>;
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

  const getDaysUntilLeaseEnd = () => {
    if (!lease) return 0;
    const end = new Date(lease.endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLeaseEndProgress = () => {
    if (!lease) return 100;
    const start = new Date(lease.startDate).getTime();
    const end = new Date(lease.endDate).getTime();
    const now = Date.now();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(100, Math.max(0, progress));
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
      <PageHeader
        title="MON BAIL"
        icon={FileSignature}
        description="Votre contrat de location"
        action={
          lease && (
            <Button onClick={downloadContract} disabled={isDownloading}>
              {isDownloading ? (
                <span className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloading ? 'Téléchargement...' : 'Télécharger le bail'}
            </Button>
          )
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Mon bail</h1>
      </PageHeader>

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

              {lease.isColocation && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Colocation
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates & End of Lease Reminder */}
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

              {/* End of Lease Reminder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Temps restant</p>
                  <p className="font-bold">
                    {getDaysUntilLeaseEnd() > 0 ? (
                      <>
                        {Math.ceil(getDaysUntilLeaseEnd() / 30)} mois{' '}
                        ({getDaysUntilLeaseEnd()} jours)
                      </>
                    ) : (
                      <span className="text-red-500">Terminé</span>
                    )}
                  </p>
                </div>
                
                {getDaysUntilLeaseEnd() <= 90 && getDaysUntilLeaseEnd() > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Fin de bail dans {getDaysUntilLeaseEnd()} jours
                      </span>
                    </div>
                  </div>
                )}
                
                <Progress value={getLeaseEndProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  Progression du bail
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Statut de la caution</span>
                  {getDepositStatusBadge(lease.securityDepositStatus)}
                </div>
                {lease.securityDepositStatus === 'partially_refunded' && (
                  <p className="text-xs text-muted-foreground">
                    Des retenues ont été appliquées pour réparation des dégradations
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Modalités de paiement</p>
                <p className="text-sm">Paiement mensuel par virement ou prélèvement</p>
                <p className="text-sm">Échéance le 1er de chaque mois</p>
              </div>
            </CardContent>
          </Card>

          {/* Departure Request Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Départ & Fin de contrat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departureRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Votre demande</span>
                    {getDepartureStatusBadge(departureRequest.status)}
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Date de départ demandée</span>
                        <span className="font-medium text-blue-900">
                          {formatDate(departureRequest.plannedDepartureDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Préavis</span>
                        <span className="font-medium text-blue-900">
                          {departureRequest.noticePeriodDays} jours
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Motif</span>
                        <span className="font-medium text-blue-900">
                          {departureRequest.reason}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lease.isColocation && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">
                          Votre départ n'affectera pas les autres colocataires
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Vous souhaitez quitter votre logement ? Soumettez une demande de départ.
                  </p>
                  
                  {lease.isColocation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm">
                          En colocation, vous pouvez partir individuellement sans impacter les autres.
                        </span>
                      </div>
                    </div>
                  )}

                  <DepartureRequestDialog
                    leaseEndDate={lease.endDate}
                    isColocation={lease.isColocation}
                    onRequestSubmitted={(request) => setDepartureRequest(request)}
                  >
                    <Button className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Faire une demande de départ
                    </Button>
                  </DepartureRequestDialog>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Après votre départ :</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>État des lieux de sortie</li>
                  <li>Remboursement de la caution sous 2 mois</li>
                  {lease.isColocation && <li>Les autres colocataires conservent leur bail</li>}
                </ul>
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
                <li>Le préavis minimum est de 1 mois (30 jours)</li>
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
