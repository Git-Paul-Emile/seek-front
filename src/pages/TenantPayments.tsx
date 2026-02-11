import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Smartphone,
  Building2,
  Wallet,
  DollarSign,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';
import PageHeader from '../components/layout/PageHeader';

interface PaymentInfo {
  id: string;
  month: string;
  amount: number;
  partialAmount?: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'late' | 'partial';
  paymentDate?: string;
  paymentMethod?: string;
  receipt?: string;
  penalty?: number;
  penaltyApplied: boolean;
  isColocation: boolean;
  tenantShare?: number;
  totalRent?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const TenantPayments: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [upcoming, setUpcoming] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'orange-money',
      name: 'Orange Money',
      icon: <Smartphone className="h-6 w-6 text-orange-500" />,
      description: 'Paiement rapide via Orange Money'
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: <Wallet className="h-6 w-6 text-blue-500" />,
      description: 'Paiement mobile Wave'
    },
    {
      id: 'virement',
      name: 'Virement bancaire',
      icon: <Building2 className="h-6 w-6 text-gray-600" />,
      description: 'Virement sur compte bancaire'
    }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Mock data - en production, ces données viendraient de l'API
      const mockPayments: PaymentInfo[] = [];
      
      for (let i = 0; i < 6; i++) {
        const paymentDate = new Date(currentYear, currentMonth - i, 1);
        const dueDate = new Date(currentYear, currentMonth - i, 5);
        const isPaid = i > 1;
        const isLate = i === 1 && currentDate > dueDate;
        const isColocation = i % 3 === 0; // Simulation de colocation
        
        mockPayments.push({
          id: `payment-${i}`,
          month: paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          amount: isColocation ? 300 : 500,
          partialAmount: isColocation ? 150 : undefined,
          tenantShare: isColocation ? 250 : undefined,
          totalRent: isColocation ? 1000 : undefined,
          dueDate: dueDate.toISOString(),
          status: i === 2 ? 'partial' : (isPaid ? 'paid' : (isLate ? 'late' : 'pending')),
          paymentDate: isPaid || i === 2 ? new Date(currentYear, currentMonth - i + 1, 3).toISOString() : undefined,
          paymentMethod: isPaid || i === 2 ? (i % 3 === 0 ? 'orange-money' : i % 3 === 1 ? 'wave' : 'virement') : undefined,
          receipt: isPaid || i === 2 ? `recu_${paymentDate.toISOString().split('T')[0]}.pdf` : undefined,
          penalty: isLate ? 25 : undefined,
          penaltyApplied: isLate,
          isColocation: isColocation
        });
      }
      
      setUpcoming(mockPayments[0]);
      setPayments(mockPayments.slice(1));
      setAllowPartialPayment(true); // En production, cela viendrait des settings du propriétaire
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'late': return 'En retard';
      case 'partial': return 'Partiel';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const openPaymentDialog = (payment: PaymentInfo) => {
    setSelectedPayment(payment);
    setSelectedMethod('');
    setPartialAmount('');
    setIsDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedPayment || !selectedMethod) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un moyen de paiement',
        variant: 'destructive',
      });
      return;
    }

    const amount = selectedPayment.isColocation && allowPartialPayment && partialAmount
      ? parseFloat(partialAmount)
      : selectedPayment.amount;

    if (selectedPayment.isColocation && allowPartialPayment && partialAmount) {
      if (amount > (selectedPayment.tenantShare || selectedPayment.amount)) {
        toast({
          title: 'Erreur',
          description: 'Le montant ne peut pas dépasser votre part',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulation de l'appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Paiement réussi',
        description: `Votre paiement de ${formatCurrency(amount)} a été traité avec succès.`,
      });
      
      setIsDialogOpen(false);
      loadPayments();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du paiement. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReceipt = (payment: PaymentInfo) => {
    // Simulation du téléchargement du reçu
    toast({
      title: 'Téléchargement',
      description: `Téléchargement du reçu pour ${payment.month}`,
    });
  };

  const maxPartialAmount = selectedPayment?.tenantShare || selectedPayment?.amount || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent>
            <div className="h-64 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="PAIEMENTS"
        icon={CreditCardIcon}
        description="Gérez vos paiements de loyer"
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Historique
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
      </PageHeader>

      {/* Upcoming Payment */}
      {upcoming && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prochain paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Loyer mensuel - {new Date(upcoming.dueDate).toLocaleDateString('fr-FR')}</p>
                {upcoming.isColocation && (
                  <p className="text-sm text-muted-foreground">
                    Votre part: {formatCurrency(upcoming.tenantShare || upcoming.amount)} / Total: {formatCurrency(upcoming.totalRent || upcoming.amount)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{upcoming.month}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatCurrency(upcoming.tenantShare || upcoming.amount)}
                </p>
                <Button onClick={() => openPaymentDialog(upcoming)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payer maintenant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>
            Tous vos paiements passés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Moyen de paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.month}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        {payment.isColocation && (
                          <p className="text-xs text-muted-foreground">
                            Part: {formatCurrency(payment.tenantShare || payment.amount)}
                          </p>
                        )}
                        {payment.status === 'partial' && (
                          <p className="text-xs text-blue-600">
                            Payé: {formatCurrency(payment.partialAmount || 0)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethod && (
                        <div className="flex items-center gap-2">
                          {paymentMethods.find(m => m.id === payment.paymentMethod)?.icon || <CreditCard className="h-4 w-4" />}
                          <span className="text-sm">
                            {paymentMethods.find(m => m.id === payment.paymentMethod)?.name || payment.paymentMethod}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge 
                          variant={
                            payment.status === 'paid' ? 'default' :
                            payment.status === 'partial' ? 'secondary' :
                            payment.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.paymentDate 
                        ? new Date(payment.paymentDate).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {payment.receipt && (
                        <Button variant="ghost" size="sm" onClick={() => downloadReceipt(payment)}>
                          <Download className="h-4 w-4 mr-1" />
                          Reçu
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4" />
              <p>Aucun paiement enregistré</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-start gap-3 p-4 border rounded-lg">
                {method.icon}
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
          {upcoming?.isColocation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Colocation</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Vous êtes en colocation. Vous ne payez que votre part du loyer ({formatCurrency(upcoming.tenantShare || upcoming.amount)}).
                    Le montant total du loyer est de {formatCurrency(upcoming.totalRent || upcoming.amount)}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payer votre loyer</DialogTitle>
            <DialogDescription>
              Choisissez votre moyen de paiement pour {selectedPayment?.month}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              {/* Amount Display */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Montant à payer</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(
                      selectedPayment.isColocation && allowPartialPayment && partialAmount
                        ? parseFloat(partialAmount) || 0
                        : selectedPayment.tenantShare || selectedPayment.amount
                    )}
                  </span>
                </div>
                {selectedPayment.isColocation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Part du loyer: {formatCurrency(selectedPayment.tenantShare || selectedPayment.amount)}
                  </p>
                )}
              </div>

              {/* Partial Payment Option */}
              {selectedPayment.isColocation && allowPartialPayment && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <Label>Paiement partiel autorisé</Label>
                  </div>
                  <Input
                    type="number"
                    placeholder={`Montant (max: ${formatCurrency(maxPartialAmount)})`}
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    min={0}
                    max={maxPartialAmount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour payer le montant complet de votre part
                  </p>
                </div>
              )}

              <Separator />

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label>Sélectionnez un moyen de paiement</Label>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                        {method.icon}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing || !selectedMethod}>
              {isProcessing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantPayments;
