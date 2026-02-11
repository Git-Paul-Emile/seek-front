import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DollarSign, Plus, AlertTriangle, CheckCircle, Clock, Filter, RefreshCw, Wallet, CreditCard, Smartphone, Building2, History, SplitSquareHorizontal, CreditCard as CreditCardIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RentPaymentDialog } from '@/components/dialogs/RentPaymentDialog';
import { rentPaymentsService } from '@/services/rent-payments.service';
import { leaseContractsService } from '@/services/lease-contracts.service';
import { RentPayment, PaymentStatus, PaymentMethod, RefundStatus } from '@/types/rent-payment';
import { LeaseContract } from '@/types/lease-contract';
import PageHeader from '@/components/layout/PageHeader';

export function RentPayments() {
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [contracts, setContracts] = useState<LeaseContract[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Stats
  const [stats, setStats] = useState({
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
    totalPartial: 0,
    totalLate: 0,
    totalSecurityDeposits: 0,
    totalSecurityDepositsRefunded: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    rentPaymentsService.updateLateStatuses();
    setPayments(rentPaymentsService.getAll());
    setContracts(leaseContractsService.getActiveContracts());
    
    const serviceStats = rentPaymentsService.getStats();
    const expected = rentPaymentsService.getExpectedPayments();
    const late = rentPaymentsService.getLatePayments();

    setStats({
      totalExpected: serviceStats.totalExpected,
      totalCollected: serviceStats.totalCollected,
      totalPending: expected.filter(p => {
        const dueDate = new Date(p.dueDate);
        const now = new Date();
        const graceDate = new Date(dueDate);
        graceDate.setDate(graceDate.getDate() + 5);
        return graceDate >= now;
      }).length,
      totalPartial: serviceStats.totalPartial,
      totalLate: late.length,
      totalSecurityDeposits: serviceStats.totalSecurityDeposits,
      totalSecurityDepositsRefunded: serviceStats.totalSecurityDepositsRefunded,
    });
  };

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setDialogOpen(true);
  };

  const handleEditPayment = (payment: RentPayment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleMarkAsPaid = (payment: RentPayment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleGeneratePayments = () => {
    contracts.forEach(contract => {
      rentPaymentsService.generatePaymentsForContract(contract.id, 12);
    });
    loadData();
  };

  const filteredPayments = payments.filter(payment => {
    const contract = contracts.find(c => c.id === payment.contractId);
    
    if (contractFilter !== 'all' && payment.contractId !== contractFilter) return false;
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    if (paymentMethodFilter !== 'all' && payment.paymentMethod !== paymentMethodFilter) return false;
    
    const paymentMonth = format(new Date(payment.dueDate), 'yyyy-MM');
    if (paymentMonth !== selectedMonth) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const tenantName = contract?.tenants.map(t => t.fullName).join(' ').toLowerCase() || '';
      const propertyAddress = contract?.property.address.toLowerCase() || '';
      return tenantName.includes(search) || propertyAddress.includes(search) || payment.id.toLowerCase().includes(search);
    }
    
    return true;
  });

  const latePayments = payments.filter(p => p.status === 'en_retard');
  const partialPayments = payments.filter(p => p.status === 'partiel' || p.isPartial);
  const mobileMoneyPayments = payments.filter(p => p.paymentMethod === 'mobile_money');
  const bankTransferPayments = payments.filter(p => p.paymentMethod === 'virement');
  const paymentHistory = rentPaymentsService.getPaymentHistory();
  const refundRequests = rentPaymentsService.getSecurityDepositRefundRequests();

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paye':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'partiel':
        return <Badge className="bg-blue-500"><SplitSquareHorizontal className="w-3 h-3 mr-1" />Partiel</Badge>;
      case 'en_retard':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />En retard</Badge>;
      case 'en_attente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method?: PaymentMethod) => {
    if (!method) return null;
    switch (method) {
      case 'mobile_money':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200"><Smartphone className="w-3 h-3 mr-1" />Mobile Money</Badge>;
      case 'virement':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Building2 className="w-3 h-3 mr-1" />Virement</Badge>;
      case 'especes':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><DollarSign className="w-3 h-3 mr-1" />Espèces</Badge>;
      case 'cheque':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><CreditCard className="w-3 h-3 mr-1" />Chèque</Badge>;
      case 'online':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200"><CreditCard className="w-3 h-3 mr-1" />En ligne</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getSecurityDepositStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'aucun':
        return <Badge variant="secondary">Non demandé</Badge>;
      case 'demande':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'approuve':
        return <Badge className="bg-blue-500">Approuvé</Badge>;
      case 'rembourse':
        return <Badge className="bg-green-500">Remboursé</Badge>;
      case 'refuse':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return null;
    }
  };

  const getContractInfo = (payment: RentPayment) => {
    const contract = contracts.find(c => c.id === payment.contractId);
    if (!contract) return { address: 'N/A', tenant: 'N/A', type: 'N/A' };
    return {
      address: contract.property.address,
      tenant: contract.tenants.map(t => t.fullName).join(', '),
      type: contract.type,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderPaymentTable = (paymentsList: RentPayment[], columns: { title: string }[], emptyMessage: string, showActions: boolean = true) => (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, i) => <TableHead key={i}>{col.title}</TableHead>)}
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentsList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          paymentsList.map((payment) => {
            const info = getContractInfo(payment);
            return (
              <TableRow key={payment.id}>
                <TableCell>{format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: fr })}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{info.address}</p>
                    <p className="text-sm text-muted-foreground capitalize">{info.type}</p>
                  </div>
                </TableCell>
                <TableCell>{info.tenant}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>{getPaymentMethodBadge(payment.paymentMethod)}</TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)}>Modifier</Button>
                      {payment.status !== 'paye' && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(payment)}>Encaisser</Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Gestion des Loyers"
        icon={CreditCardIcon}
        description="Suivez et gérez les paiements de loyers et les cautions"
        action={
          <>
            <Button variant="outline" onClick={handleGeneratePayments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Générer les échéances
            </Button>
            <Button onClick={handleCreatePayment}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Paiement
            </Button>
          </>
        }
      >
        Gestion des paiements
      </PageHeader>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyers attendus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpected)}</div>
            <p className="text-xs text-muted-foreground">Total des paiements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyers encaissés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground">Total reçu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Non encore payés</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partiels</CardTitle>
            <SplitSquareHorizontal className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalPartial}</div>
            <p className="text-xs text-muted-foreground">Paiements partiels</p>
          </CardContent>
        </Card>
        
        <Card className={latePayments.length > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalLate}</div>
            <p className="text-xs text-muted-foreground">Loyers en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Caution */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />Gestion des cautions
          </CardTitle>
          <CardDescription>Suivi des dépôts de garantie et des remboursements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total des cautions</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalSecurityDeposits)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total remboursé</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(stats.totalSecurityDepositsRefunded)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">En attente</p>
              <p className="text-xl font-bold text-yellow-700">{formatCurrency(stats.totalSecurityDeposits - stats.totalSecurityDepositsRefunded)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Mois</Label>
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bien / Contrat</Label>
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger><SelectValue placeholder="Tous les biens" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les biens</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>{contract.property.address}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="partiel">Partiel</SelectItem>
                  <SelectItem value="en_retard">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger><SelectValue placeholder="Tous les modes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modes</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="virement">Virement bancaire</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                  <SelectItem value="online">Paiement en ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recherche</Label>
              <Input placeholder="Locataire, adresse..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets des paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des paiements - {format(new Date(selectedMonth), 'MMMM yyyy', { locale: fr })}</CardTitle>
          <CardDescription>{filteredPayments.length} paiement(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="mobile_money"><Smartphone className="w-4 h-4 mr-1" />Mobile Money</TabsTrigger>
              <TabsTrigger value="virement"><Building2 className="w-4 h-4 mr-1" />Virement</TabsTrigger>
              <TabsTrigger value="partial"><SplitSquareHorizontal className="w-4 h-4 mr-1" />Partiels</TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4 mr-1" />Historique</TabsTrigger>
              <TabsTrigger value="late" className="text-red-600"><AlertTriangle className="w-4 h-4 mr-1" />En retard</TabsTrigger>
              <TabsTrigger value="refunds"><Wallet className="w-4 h-4 mr-1" />Cautions</TabsTrigger>
            </TabsList>

            {/* Tous les paiements */}
            <TabsContent value="all" className="mt-4">
              {renderPaymentTable(
                filteredPayments,
                [{ title: "Date d'échéance" }, { title: "Bien / Chambre" }, { title: "Locataire" }, { title: "Montant" }, { title: "Statut" }, { title: "Mode" }],
                "Aucun paiement trouvé pour cette période"
              )}
            </TabsContent>

            {/* Mobile Money */}
            <TabsContent value="mobile_money" className="mt-4">
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800"><Smartphone className="w-4 h-4 inline mr-1" />Paiements reçus par Mobile Money</p>
              </div>
              {renderPaymentTable(
                mobileMoneyPayments,
                [{ title: "Date" }, { title: "Bien / Chambre" }, { title: "Locataire" }, { title: "Montant" }, { title: "Statut" }],
                "Aucun paiement Mobile Money trouvé"
              )}
            </TabsContent>

            {/* Virement */}
            <TabsContent value="virement" className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800"><Building2 className="w-4 h-4 inline mr-1" />Paiements reçus par virement bancaire</p>
              </div>
              {renderPaymentTable(
                bankTransferPayments,
                [{ title: "Date" }, { title: "Bien / Chambre" }, { title: "Locataire" }, { title: "Montant" }, { title: "Statut" }],
                "Aucun paiement par virement trouvé"
              )}
            </TabsContent>

            {/* Paiements partiels */}
            <TabsContent value="partial" className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800"><SplitSquareHorizontal className="w-4 h-4 inline mr-1" />Loyers partiellement payés</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date d'échéance</TableHead>
                    <TableHead>Bien / Chambre</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead className="text-right">Montant dû</TableHead>
                    <TableHead className="text-right">Montant payé</TableHead>
                    <TableHead className="text-right">Reste</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partialPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun paiement partiel</TableCell>
                    </TableRow>
                  ) : (
                    partialPayments.map((payment) => {
                      const info = getContractInfo(payment);
                      return (
                        <TableRow key={payment.id} className="bg-blue-50/50">
                          <TableCell>{format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: fr })}</TableCell>
                          <TableCell><div><p className="font-medium">{info.address}</p><p className="text-sm text-muted-foreground capitalize">{info.type}</p></div></TableCell>
                          <TableCell>{info.tenant}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">{formatCurrency(payment.amountPaid)}</TableCell>
                          <TableCell className="text-right text-blue-600 font-medium">{formatCurrency(payment.remainingAmount)}</TableCell>
                          <TableCell><Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(payment)}>Compléter</Button></TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Historique */}
            <TabsContent value="history" className="mt-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800"><History className="w-4 h-4 inline mr-1" />Historique complet de tous les paiements effectués</p>
              </div>
              {renderPaymentTable(
                paymentHistory,
                [{ title: "Date de paiement" }, { title: "Bien / Chambre" }, { title: "Locataire" }, { title: "Montant" }, { title: "Statut" }, { title: "Mode" }],
                "Aucun paiement dans l'historique",
                false
              )}
            </TabsContent>

            {/* En retard */}
            <TabsContent value="late" className="mt-4">
              {latePayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucun loyer en retard</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date d'échéance</TableHead>
                      <TableHead>Bien / Chambre</TableHead>
                      <TableHead>Locataire</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Pénalité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latePayments.map((payment) => {
                      const info = getContractInfo(payment);
                      return (
                        <TableRow key={payment.id} className="bg-red-50">
                          <TableCell>{format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: fr })}</TableCell>
                          <TableCell><div><p className="font-medium">{info.address}</p><p className="text-sm text-muted-foreground capitalize">{info.type}</p></div></TableCell>
                          <TableCell>{info.tenant}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell className="text-right text-red-600">{payment.lateFee ? formatCurrency(payment.lateFee) : '-'}</TableCell>
                          <TableCell><Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(payment)}>Encaisser</Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Cautions */}
            <TabsContent value="refunds" className="mt-4">
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800"><Wallet className="w-4 h-4 inline mr-1" />Demandes de remboursement de caution</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date bail</TableHead>
                    <TableHead>Bien / Chambre</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead className="text-right">Montant caution</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refundRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune demande de remboursement</TableCell>
                    </TableRow>
                  ) : (
                    refundRequests.map((payment) => {
                      const info = getContractInfo(payment);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: fr })}</TableCell>
                          <TableCell><div><p className="font-medium">{info.address}</p><p className="text-sm text-muted-foreground capitalize">{info.type}</p></div></TableCell>
                          <TableCell>{info.tenant}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(payment.securityDeposit || 0)}</TableCell>
                          <TableCell>{getSecurityDepositStatusBadge(payment.securityDepositStatus)}</TableCell>
                          <TableCell><Button variant="outline" size="sm" onClick={() => handleEditPayment(payment)}>Gérer</Button></TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RentPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} payment={selectedPayment} onSave={loadData} />
    </div>
  );
}
