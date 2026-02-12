import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Building2, 
  Home, 
  User, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  SelectContent,  Select, 
 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { rentPaymentsService } from '@/services/rent-payments.service';
import { leaseContractsService } from '@/services/lease-contracts.service';

// Interfaces locales pour Property, Tenant et Owner
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  rooms: number;
  ownerId: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  roomId?: string;
}

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: string[];
}

const AgencyRentManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  // Données simulées pour la démo
  const mockProperties: Property[] = [
    { id: '1', name: 'Appartement Dakar', address: 'Point E, Dakar', type: 'apartment', rooms: 3, ownerId: '1' },
    { id: '2', name: 'Maison SICAP', address: 'Sicap Mermoz, Dakar', type: 'house', rooms: 4, ownerId: '2' },
    { id: '3', name: 'Studio Plateau', address: 'Plateau, Dakar', type: 'studio', rooms: 1, ownerId: '1' },
  ];

  const mockOwners: Owner[] = [
    { id: '1', firstName: 'Diop', lastName: 'Fall', email: 'diop@email.com', phone: '771234567', properties: ['1', '3'] },
    { id: '2', firstName: 'Ndiaye', lastName: 'Sow', email: 'ndiaye@email.com', phone: '778765432', properties: ['2'] },
  ];

  const mockTenants: Tenant[] = [
    { id: '1', firstName: 'Aminata', lastName: 'Diallo', email: 'aminata@email.com', phone: '761234567', propertyId: '1', roomId: '1' },
    { id: '2', firstName: 'Moussa', lastName: 'Sarr', email: 'moussa@email.com', phone: '762345678', propertyId: '2', roomId: '2' },
    { id: '3', firstName: 'Fatou', lastName: 'Traore', email: 'fatou@email.com', phone: '763456789', propertyId: '3', roomId: '3' },
  ];

  // Générer les échéances pour l'exemple
  const payments = useMemo(() => {
    const allPayments = rentPaymentsService.getAll();
    if (allPayments.length === 0) {
      // Créer des données de démonstration
      const demoPayments = [];
      for (let month = 0; month < 12; month++) {
        mockProperties.forEach((property, index) => {
          const owner = mockOwners.find(o => o.id === property.ownerId);
          const tenant = mockTenants.find(t => t.propertyId === property.id);
          const dueDate = new Date(parseInt(selectedYear), month, 1);
          
          demoPayments.push({
            id: `PAY-${selectedYear}${String(month + 1).padStart(2, '0')}-${property.id}`,
            contractId: `CONTRACT-${property.id}`,
            tenantId: tenant?.id || '',
            propertyId: property.id,
            roomId: `room-${index}`,
            amount: 150000,
            amountPaid: month < parseInt(selectedMonth) - 1 ? 150000 : 0,
            dueDate: dueDate.toISOString(),
            status: month < parseInt(selectedMonth) - 1 ? 'paye' : 
                    month === parseInt(selectedMonth) - 1 ? 'en_attente' : 'en_attente',
            isPartial: false,
            remainingAmount: month < parseInt(selectedMonth) - 1 ? 0 : 150000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }
      return demoPayments;
    }
    return allPayments;
  }, [selectedYear, selectedMonth]);

  // Filtrer les paiements
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate);
      const matchesYear = paymentDate.getFullYear().toString() === selectedYear;
      const matchesMonth = selectedPeriod === 'monthly' 
        ? (paymentDate.getMonth() + 1).toString().padStart(2, '0') === selectedMonth
        : true;
      const matchesProperty = filterProperty === 'all' || payment.propertyId === filterProperty;
      const matchesOwner = filterOwner === 'all' || 
        mockProperties.find(p => p.id === payment.propertyId)?.ownerId === filterOwner;
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      
      return matchesYear && matchesMonth && matchesProperty && matchesOwner && matchesStatus;
    });
  }, [payments, selectedYear, selectedMonth, selectedPeriod, filterProperty, filterOwner, filterStatus]);

  // Statistiques
  const stats = useMemo(() => {
    const totalExpected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCollected = filteredPayments
      .filter(p => p.status === 'paye')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = filteredPayments.filter(p => p.status === 'en_attente').length;
    const totalLate = filteredPayments.filter(p => p.status === 'en_retard').length;

    return {
      totalExpected,
      totalCollected,
      totalPending,
      totalLate,
      collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
    };
  }, [filteredPayments]);

  // Répartition par bien
  const propertyBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { expected: number; collected: number; count: number; property: Property } } = {};
    
    filteredPayments.forEach(payment => {
      const property = mockProperties.find(p => p.id === payment.propertyId);
      if (!breakdown[payment.propertyId]) {
        breakdown[payment.propertyId] = {
          expected: 0,
          collected: 0,
          count: 0,
          property: property!,
        };
      }
      breakdown[payment.propertyId].expected += payment.amount;
      breakdown[payment.propertyId].collected += payment.amountPaid;
      breakdown[payment.propertyId].count += 1;
    });
    
    return Object.values(breakdown);
  }, [filteredPayments]);

  // Répartition par propriétaire
  const ownerBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { expected: number; collected: number; count: number; owner: Owner } } = {};
    
    filteredPayments.forEach(payment => {
      const property = mockProperties.find(p => p.id === payment.propertyId);
      const owner = mockOwners.find(o => o.id === property?.ownerId);
      if (!owner) return;
      
      if (!breakdown[owner.id]) {
        breakdown[owner.id] = {
          expected: 0,
          collected: 0,
          count: 0,
          owner: owner,
        };
      }
      breakdown[owner.id].expected += payment.amount;
      breakdown[owner.id].collected += payment.amountPaid;
      breakdown[owner.id].count += 1;
    });
    
    return Object.values(breakdown);
  }, [filteredPayments]);

  // Répartition mensuelle/annuelle
  const periodBreakdown = useMemo(() => {
    if (selectedPeriod === 'monthly') {
      return [{ period: selectedMonth, label: `Mois ${selectedMonth}`, data: filteredPayments }];
    }
    
    const monthlyData: { [key: string]: typeof filteredPayments } = {};
    filteredPayments.forEach(payment => {
      const month = new Date(payment.dueDate).getMonth() + 1;
      const key = month.toString().padStart(2, '0');
      if (!monthlyData[key]) monthlyData[key] = [];
      monthlyData[key].push(payment);
    });
    
    return Object.entries(monthlyData).map(([period, data]) => ({
      period,
      label: new Date(parseInt(selectedYear), parseInt(period) - 1).toLocaleDateString('fr-FR', { month: 'long' }),
      data,
    }));
  }, [filteredPayments, selectedPeriod, selectedMonth, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      paye: 'default',
      en_attente: 'secondary',
      en_retard: 'destructive',
      partiel: 'outline',
    };
    const labels: { [key: string]: string } = {
      paye: 'Payé',
      en_attente: 'En attente',
      en_retard: 'En retard',
      partiel: 'Partiel',
    };
    
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const handleGenerateEcheances = () => {
    // Logique pour générer les échéances
    console.log('Génération des échéances...');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Loyers</h1>
          <p className="text-muted-foreground">
            Suivi des échéances, paiements et répartition par période
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleGenerateEcheances}>
            <Calendar className="mr-2 h-4 w-4" />
            Définir les échéances
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as 'monthly' | 'annual')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="annual">Annuel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPeriod === 'monthly' && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    const date = new Date(2024, i, 1);
                    return (
                      <SelectItem key={month} value={month}>
                        {date.toLocaleDateString('fr-FR', { month: 'long' })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les biens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les biens</SelectItem>
                {mockProperties.map(property => (
                  <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les propriétaires" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les propriétaires</SelectItem>
                {mockOwners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>{owner.firstName} {owner.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
                <SelectItem value="partiel">Partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total attendu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpected)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.length} échéance(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-xs text-muted-foreground">
              Taux de recouvrement: {stats.collectionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              paiement(s) en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLate}</div>
            <p className="text-xs text-muted-foreground">
              paiement(s) en retard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes vues */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des échéances</TabsTrigger>
          <TabsTrigger value="by-property">Par bien</TabsTrigger>
          <TabsTrigger value="by-owner">Par propriétaire</TabsTrigger>
          <TabsTrigger value="timeline">Répartition temporelle</TabsTrigger>
        </TabsList>

        {/* Liste des échéances */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Échéances {selectedPeriod === 'monthly' ? 'mensuelles' : 'annuelles'}</CardTitle>
              <CardDescription>
                Suivi détaillé des loyers attendus et payés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bien</TableHead>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Payé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => {
                    const property = mockProperties.find(p => p.id === payment.propertyId);
                    const owner = mockOwners.find(o => o.id === property?.ownerId);
                    const tenant = mockTenants.find(t => t.propertyId === payment.propertyId);
                    
                    return (
                      <React.Fragment key={payment.id}>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{property?.name}</div>
                                <div className="text-xs text-muted-foreground">{property?.address}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{tenant?.firstName} {tenant?.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.dueDate).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(payment.amountPaid)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedPayment(
                                expandedPayment === payment.id ? null : payment.id
                              )}
                            >
                              {expandedPayment === payment.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedPayment === payment.id && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/50">
                              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Détails du bien</h4>
                                  <p className="text-sm text-muted-foreground">
                                    <Building2 className="inline h-4 w-4 mr-1" />
                                    {property?.name}<br />
                                    {property?.address}<br />
                                    Type: {property?.type}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Propriétaire</h4>
                                  <p className="text-sm text-muted-foreground">
                                    <User className="inline h-4 w-4 mr-1" />
                                    {owner?.firstName} {owner?.lastName}<br />
                                    {owner?.email}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Locataire</h4>
                                  <p className="text-sm text-muted-foreground">
                                    <User className="inline h-4 w-4 mr-1" />
                                    {tenant?.firstName} {tenant?.lastName}<br />
                                    {tenant?.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Répartition par bien */}
        <TabsContent value="by-property">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertyBreakdown.map(item => (
              <Card key={item.property.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {item.property.name}
                  </CardTitle>
                  <CardDescription>{item.property.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loyers attendus</span>
                      <span className="font-medium">{formatCurrency(item.expected)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loyers perçus</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(item.collected)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.expected > 0 ? (item.collected / item.expected) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {item.expected > 0 ? ((item.collected / item.expected) * 100).toFixed(1) : 0}% recouvré
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Répartition par propriétaire */}
        <TabsContent value="by-owner">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownerBreakdown.map(item => (
              <Card key={item.owner.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {item.owner.firstName} {item.owner.lastName}
                  </CardTitle>
                  <CardDescription>{item.owner.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loyers attendus</span>
                      <span className="font-medium">{formatCurrency(item.expected)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loyers perçus</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(item.collected)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.expected > 0 ? (item.collected / item.expected) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {item.count} bien(s) • {
                        item.expected > 0 ? ((item.collected / item.expected) * 100).toFixed(1) : 0
                      }% recouvré
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Répartition temporelle */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Répartition {selectedPeriod === 'monthly' ? 'mensuelle' : 'annuelle'}</CardTitle>
              <CardDescription>
                Visualisation des loyers par {selectedPeriod === 'monthly' ? 'jour' : 'mois'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {periodBreakdown.map(item => (
                  <div key={item.period} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.data.reduce((sum, p) => sum + p.amount, 0))}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-4 flex overflow-hidden">
                      {item.data.map((payment, idx) => (
                        <div
                          key={payment.id}
                          className={`h-full ${
                            payment.status === 'paye' ? 'bg-green-500' :
                            payment.status === 'en_retard' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ 
                            width: `${(payment.amount / item.data.reduce((sum, p) => sum + p.amount, 0)) * 100}%`,
                            marginRight: idx < item.data.length - 1 ? '2px' : 0
                          }}
                          title={`${payment.status}: ${formatCurrency(payment.amount)}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded" /> Payé
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded" /> En attente
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded" /> En retard
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyRentManagement;
