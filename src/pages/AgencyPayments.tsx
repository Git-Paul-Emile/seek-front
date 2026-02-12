import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building, 
  History, 
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Search,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from '@/components/layout/PageHeader';
import { agencyPaymentsService } from '@/services/agency-payments.service';
import { LeaseContractsService } from '@/services/lease-contracts.service';
import { RentPayment, PaymentMethod, PaymentStatus } from '@/types/rent-payment';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusBadge = (status: PaymentStatus) => {
  const variants: Record<PaymentStatus, string> = {
    paye: 'bg-green-500',
    en_attente: 'bg-yellow-500',
    partiel: 'bg-blue-500',
    en_retard: 'bg-red-500',
    annule: 'bg-gray-500',
  };

  const labels: Record<PaymentStatus, string> = {
    paye: 'Payé',
    en_attente: 'En attente',
    partiel: 'Partiel',
    en_retard: 'En retard',
    annule: 'Annulé',
  };

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const getMethodIcon = (method?: PaymentMethod) => {
  const icons: Record<string, React.ReactNode> = {
    especes: <Banknote className="h-4 w-4" />,
    cheque: <FileText className="h-4 w-4" />,
    virement: <Building className="h-4 w-4" />,
    mobile_money: <Smartphone className="h-4 w-4" />,
    online: <CreditCard className="h-4 w-4" />,
    autre: <DollarSign className="h-4 w-4" />,
  };
  
  if (!method) return <DollarSign className="h-4 w-4" />;
  return icons[method] || icons.autre;
};

// === Composant: Dialogue de paiement manuel ===
interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onOpenChange, onPaymentRecorded }) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>('especes');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  const leaseService = new LeaseContractsService();
  const pendingPayments = agencyPaymentsService.getExpectedPayments();

  const getPropertyAndTenant = (payment: RentPayment) => {
    const contract = leaseService.getById(payment.contractId);
    if (!contract) return { property: 'N/A', tenant: 'N/A' };
    return {
      property: contract.property.address,
      tenant: contract.tenants[0]?.fullName || 'N/A',
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un paiement",
        variant: "destructive",
      });
      return;
    }

    const payment = agencyPaymentsService.getById(selectedPaymentId);
    if (!payment) {
      toast({
        title: "Erreur",
        description: "Paiement non trouvé",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paidAmount) || payment.amount;

    try {
      agencyPaymentsService.markAsPaidWithPartial(
        selectedPaymentId,
        paymentMethod,
        amount,
        new Date().toISOString()
      );

      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès",
      });

      onPaymentRecorded();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedPaymentId('');
    setPaidAmount('');
    setDescription('');
    setPaymentMethod('especes');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Enregistrez manuellement un paiement de loyer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Sélectionner le paiement</Label>
              <Select value={selectedPaymentId} onValueChange={setSelectedPaymentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un paiement en attente" />
                </SelectTrigger>
                <SelectContent>
                  {pendingPayments.map((payment) => {
                    const info = getPropertyAndTenant(payment);
                    return (
                      <SelectItem key={payment.id} value={payment.id}>
                        {info.tenant} - {info.property} ({formatCurrency(payment.amount)})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Espèces
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile_money">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                  <SelectItem value="virement">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Virement bancaire
                    </div>
                  </SelectItem>
                  <SelectItem value="cheque">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Chèque
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Paiement en ligne
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Montant</Label>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="Montant du paiement"
              />
            </div>

            <div className="col-span-2">
              <Label>Description (optionnelle)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes sur le paiement"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// === Composant: Dialogue de paiement groupé ===
interface BatchPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: () => void;
}

const BatchPaymentDialog: React.FC<BatchPaymentDialogProps> = ({ open, onOpenChange, onPaymentRecorded }) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>('especes');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const leaseService = new LeaseContractsService();
  const pendingPayments = agencyPaymentsService.getExpectedPayments();

  const getPropertyAndTenant = (payment: RentPayment) => {
    const contract = leaseService.getById(payment.contractId);
    if (!contract) return { property: 'N/A', tenant: 'N/A' };
    return {
      property: contract.property.address,
      tenant: contract.tenants[0]?.fullName || 'N/A',
    };
  };

  const totalSelected = selectedPayments.reduce((sum, id) => {
    const payment = pendingPayments.find(p => p.id === id);
    return sum + (payment?.amount || 0);
  }, 0);

  const handleTogglePayment = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPayments.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un paiement",
        variant: "destructive",
      });
      return;
    }

    try {
      selectedPayments.forEach(paymentId => {
        const payment = agencyPaymentsService.getById(paymentId);
        if (payment) {
          agencyPaymentsService.markAsPaidWithPartial(
            paymentId,
            paymentMethod,
            payment.amount,
            new Date().toISOString()
          );
        }
      });

      toast({
        title: "Succès",
        description: `${selectedPayments.length} paiements groupés enregistrés avec succès`,
      });

      onPaymentRecorded();
      setSelectedPayments([]);
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paiements groupés",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Paiement groupé</DialogTitle>
          <DialogDescription>
            Enregistrez plusieurs paiements en une seule opération
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="online">Paiement en ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Total sélectionné</Label>
              <div className="h-10 flex items-center text-lg font-semibold">
                {formatCurrency(totalSelected)}
              </div>
            </div>

            <div className="col-span-2">
              <Label>Description (optionnelle)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes sur le paiement groupé"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="p-3 border-b bg-muted/50">
              <Label>Sélectionner les paiements</Label>
            </div>
            <ScrollArea className="h-64">
              {pendingPayments.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Aucun paiement en attente
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Locataire</TableHead>
                      <TableHead>Bien</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((payment) => {
                      const info = getPropertyAndTenant(payment);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPayments.includes(payment.id)}
                              onCheckedChange={() => handleTogglePayment(payment.id)}
                            />
                          </TableCell>
                          <TableCell>{info.tenant}</TableCell>
                          <TableCell>{info.property}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={selectedPayments.length === 0}>
              Enregistrer {selectedPayments.length > 0 && `(${selectedPayments.length})`} paiements
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// === Page principale: AgencyPayments ===
const AgencyPayments: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Dialogs
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  // Données
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof agencyPaymentsService.getStats>>(
    {} as ReturnType<typeof agencyPaymentsService.getStats>
  );

  const loadData = useCallback(() => {
    let filteredPayments = agencyPaymentsService.getAll();

    if (statusFilter !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.paymentMethod === methodFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);

      switch (dateFilter) {
        case 'this_month':
          filteredPayments = filteredPayments.filter(p => new Date(p.dueDate) >= thisMonth);
          break;
        case 'last_month':
          filteredPayments = filteredPayments.filter(p => 
            new Date(p.dueDate) >= lastMonth && new Date(p.dueDate) < thisMonth
          );
          break;
        case 'this_year':
          filteredPayments = filteredPayments.filter(p => new Date(p.dueDate) >= thisYear);
          break;
      }
    }

    // Recherche
    if (searchQuery) {
      const leaseService = new LeaseContractsService();
      filteredPayments = filteredPayments.filter(p => {
        const contract = leaseService.getById(p.contractId);
        const tenantName = contract?.tenants[0]?.fullName?.toLowerCase() || '';
        const propertyAddress = contract?.property.address?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return tenantName.includes(query) || propertyAddress.includes(query) || p.id.toLowerCase().includes(query);
      });
    }

    // Trier par date décroissante
    filteredPayments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    setPayments(filteredPayments);
    setStats(agencyPaymentsService.getStats());
  }, [statusFilter, methodFilter, dateFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPropertyAndTenant = (payment: RentPayment) => {
    const leaseService = new LeaseContractsService();
    const contract = leaseService.getById(payment.contractId);
    if (!contract) return { property: 'N/A', tenant: 'N/A', tenantId: '' };
    return {
      property: contract.property.address,
      tenant: contract.tenants[0]?.fullName || 'N/A',
      tenantId: contract.tenants[0]?.id || '',
    };
  };

  const statsCards = [
    {
      title: "Total attendu",
      value: formatCurrency(stats.totalExpected || 0),
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Encaissé",
      value: formatCurrency(stats.totalCollected || 0),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "En attente",
      value: formatCurrency((stats.totalExpected || 0) - (stats.totalCollected || 0)),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Taux d'encaissement",
      value: `${(stats.collectionRate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="PAIEMENTS"
        icon={Wallet}
        description="Gérez les paiements de loyer de vos biens"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBatchDialogOpen(true)}>
              <Building className="h-4 w-4 mr-2" />
              Paiement groupé
            </Button>
            <Button onClick={() => setPaymentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau paiement
            </Button>
          </div>
        }
      >
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Paiements</h1>
      </PageHeader>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            En attente ({payments.filter(p => p.status === 'en_attente').length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Tableau de bord */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paiements encaissés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Paiements encaissés
                </CardTitle>
                <CardDescription>
                  Overview des paiements reçus ce mois-ci
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agencyPaymentsService.getCollectedPayments().slice(0, 5).map((payment) => {
                    const info = getPropertyAndTenant(payment);
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">{info.tenant}</p>
                          <p className="text-sm text-muted-foreground">{info.property}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            {getMethodIcon(payment.paymentMethod)}
                            {payment.paidDate && formatDate(payment.paidDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {agencyPaymentsService.getCollectedPayments().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun paiement encaissé
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paiements à encaisser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Paiements à encaisser
                </CardTitle>
                <CardDescription>
                  Loyers en attente de paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agencyPaymentsService.getExpectedPayments().slice(0, 5).map((payment) => {
                    const info = getPropertyAndTenant(payment);
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium">{info.tenant}</p>
                          <p className="text-sm text-muted-foreground">{info.property}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600">{formatCurrency(payment.amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            Échéance: {formatDate(payment.dueDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {agencyPaymentsService.getExpectedPayments().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Aucun paiement en attente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques mensuelles */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
              <CardDescription>
                Revenus mensuels sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-4">
                {stats.monthlyStats?.slice(-6).map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(month.collected / (month.expected || 1)) * 200}px`, maxHeight: '200px' }}
                    />
                    <div className="w-full bg-gray-200 rounded-b" style={{ height: '20px' }} />
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                  </div>
                ))}
                {(!stats.monthlyStats || stats.monthlyStats.length === 0) && (
                  <div className="flex-1 text-center text-muted-foreground py-8">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiements en attente */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Paiements en attente</CardTitle>
              <CardDescription>
                Gérez les paiements de loyer en attente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.filter(p => p.status === 'en_attente').map((payment) => {
                    const info = getPropertyAndTenant(payment);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{info.tenant}</TableCell>
                        <TableCell>{info.property}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              agencyPaymentsService.markAsPaidWithPartial(
                                payment.id,
                                'especes',
                                payment.amount,
                                new Date().toISOString()
                              );
                              loadData();
                              toast({ title: "Succès", description: "Paiement marqué comme reçu" });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Recevoir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.filter(p => p.status === 'en_attente').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun paiement en attente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historique des paiements</CardTitle>
                  <CardDescription>
                    Ensemble des paiements effectués
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtres */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="paye">Payé</SelectItem>
                    <SelectItem value="partiel">Partiel</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="en_retard">En retard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="this_month">Ce mois</SelectItem>
                    <SelectItem value="last_month">Mois dernier</SelectItem>
                    <SelectItem value="this_year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const info = getPropertyAndTenant(payment);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                        <TableCell>{info.tenant}</TableCell>
                        <TableCell>{info.property}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMethodIcon(payment.paymentMethod)}
                            {payment.paymentMethod?.replace('_', ' ')}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(payment.paidDate || payment.dueDate)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaymentDialog 
        open={paymentDialogOpen} 
        onOpenChange={setPaymentDialogOpen}
        onPaymentRecorded={loadData}
      />
      
      <BatchPaymentDialog 
        open={batchDialogOpen} 
        onOpenChange={setBatchDialogOpen}
        onPaymentRecorded={loadData}
      />
    </div>
  );
};

export default AgencyPayments;
