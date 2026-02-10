import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Home, Users, Calendar, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight, Download, FileText, FileSpreadsheet, Calculator, Receipt } from "lucide-react";
import { mockProperties } from "@/data/properties";
import { mockTenants } from "@/data/tenants";
import { cn } from "@/lib/utils";

// Types
interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
}

interface PropertyRevenue {
  propertyId: string;
  propertyTitle: string;
  location: string;
  monthlyRent: number;
  occupancyRate: number;
  annualRevenue: number;
  occupancyMonths: number;
}

interface RoomRevenue {
  roomId: string;
  roomName: string;
  propertyTitle: string;
  monthlyRent: number;
  tenantName: string;
  status: "occupé" | "vacant" | "en_attente";
  annualRevenue: number;
}

interface UnpaidRent {
  id: string;
  tenantName: string;
  propertyTitle: string;
  roomName: string;
  amount: number;
  dueDate: string;
  daysLate: number;
  status: "en_retard" | "relance_1" | "relance_2" | "relance_3";
}

interface TaxDeclaration {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  taxRate: number;
  estimatedTax: number;
  deductibleExpenses: {
    name: string;
    amount: number;
  }[];
}

const AdminStats = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "annual">("monthly");

  // Données simulées
  const properties = mockProperties.filter((p) => p.ownerId === "owner1");
  const tenants = mockTenants;

  // Calculs globaux
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, p) => sum + (p.rooms?.length || 0), 0);
  const occupiedRooms = properties.reduce((sum, p) => sum + (p.rooms?.filter((r: any) => r.status === "occupé").length || 0), 0);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Revenus mensuels simulés
  const monthlyRevenue: MonthlyRevenue[] = [
    { month: "Janvier", year: selectedYear, revenue: 4500000, expenses: 450000 },
    { month: "Février", year: selectedYear, revenue: 4800000, expenses: 420000 },
    { month: "Mars", year: selectedYear, revenue: 5200000, expenses: 380000 },
    { month: "Avril", year: selectedYear, revenue: 5100000, expenses: 400000 },
    { month: "Mai", year: selectedYear, revenue: 5500000, expenses: 450000 },
    { month: "Juin", year: selectedYear, revenue: 5800000, expenses: 420000 },
    { month: "Juillet", year: selectedYear, revenue: 6200000, expenses: 500000 },
    { month: "Août", year: selectedYear, revenue: 5900000, expenses: 480000 },
    { month: "Septembre", year: selectedYear, revenue: 5600000, expenses: 440000 },
    { month: "Octobre", year: selectedYear, revenue: 5300000, expenses: 410000 },
    { month: "Novembre", year: selectedYear, revenue: 5000000, expenses: 390000 },
    { month: "Décembre", year: selectedYear, revenue: 4900000, expenses: 450000 },
  ];

  const totalAnnualRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalAnnualExpenses = monthlyRevenue.reduce((sum, m) => sum + m.expenses, 0);
  const netAnnualRevenue = totalAnnualRevenue - totalAnnualExpenses;

  // Historique annuel (5 dernières années)
  const annualHistory = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 4 + i;
      const baseRevenue = 50000000 + (i * 5000000) + Math.random() * 10000000;
      const baseExpenses = baseRevenue * 0.1;
      return {
        year,
        revenue: Math.round(baseRevenue),
        expenses: Math.round(baseExpenses),
        netProfit: Math.round(baseRevenue - baseExpenses),
        occupancyRate: Math.round(75 + Math.random() * 20),
      };
    });
  }, []);

  // Revenus par bien
  const propertyRevenues: PropertyRevenue[] = properties.map((p) => ({
    propertyId: p.id,
    propertyTitle: p.title,
    location: p.location.address,
    monthlyRent: p.price,
    occupancyRate: Math.random() * 30 + 70, // 70-100%
    annualRevenue: p.price * 12,
    occupancyMonths: Math.floor(Math.random() * 4) + 8, // 8-12 mois
  }));

  // Revenus par chambre
  const roomRevenues: RoomRevenue[] = properties.flatMap((p) =>
    (p.rooms || []).map((r: any, index: number) => ({
      roomId: r.id || `${p.id}-room-${index}`,
      roomName: r.name || `Chambre ${index + 1}`,
      propertyTitle: p.title,
      monthlyRent: r.price || p.price / (p.rooms?.length || 1),
      tenantName: r.status === "occupé" ? `Locataire ${index + 1}` : "-",
      status: r.status as "occupé" | "vacant" | "en_attente",
      annualRevenue: (r.price || p.price / (p.rooms?.length || 1)) * 12,
    }))
  );

  // Loyers impayés
  const unpaidRents: UnpaidRent[] = [
    { id: "1", tenantName: "Marie Dupont", propertyTitle: "Villa Moderne", roomName: "Chambre 1", amount: 250000, dueDate: "2024-01-15", daysLate: 26, status: "relance_2" },
    { id: "2", tenantName: "Jean Martin", propertyTitle: "Appartement Centre-Ville", roomName: "Studio", amount: 180000, dueDate: "2024-01-20", daysLate: 21, status: "relance_1" },
    { id: "3", tenantName: "Sophie Bernard", propertyTitle: "Maison Bassa", roomName: "Chambre 2", amount: 200000, dueDate: "2024-02-01", daysLate: 9, status: "en_retard" },
    { id: "4", tenantName: "Pierre Durand", propertyTitle: "Studio Bonapriso", roomName: "Studio", amount: 150000, dueDate: "2024-02-05", daysLate: 5, status: "en_retard" },
  ];

  const totalUnpaid = unpaidRents.reduce((sum, r) => sum + r.amount, 0);

  // Déclaration fiscale simplifiée
  const taxDeclaration: TaxDeclaration = {
    year: selectedYear,
    totalRevenue: totalAnnualRevenue,
    totalExpenses: totalAnnualExpenses,
    netProfit: netAnnualRevenue,
    taxRate: 0.15, // 15% for rental income in Cameroon
    estimatedTax: netAnnualRevenue * 0.15,
    deductibleExpenses: [
      { name: "Charges de copropriété", amount: 1200000 },
      { name: "Travaux d'entretien", amount: 800000 },
      { name: "Assurances", amount: 450000 },
      { name: "Gestion locative", amount: 600000 },
      { name: "Taxe foncière", amount: 350000 },
      { name: "Électricité/Eau (parties communes)", amount: 280000 },
    ],
  };

  // Performance mensuelle (graphique)
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));
  const maxHistoryRevenue = Math.max(...annualHistory.map((h) => h.revenue));

  // Couleurs pour les graphiques
  const chartColors = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    muted: "bg-muted",
    accent: "bg-accent",
    green: "bg-green-500",
    red: "bg-red-500",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: UnpaidRent["status"]) => {
    const styles = {
      en_retard: "bg-yellow-100 text-yellow-800",
      relance_1: "bg-orange-100 text-orange-800",
      relance_2: "bg-red-100 text-red-800",
      relance_3: "bg-red-200 text-red-900",
    };
    const labels = {
      en_retard: "En retard",
      relance_1: "1ère relance",
      relance_2: "2ème relance",
      relance_3: "3ème relance",
    };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[status])}>
        {labels[status]}
      </span>
    );
  };

  // Fonction d'export PDF
  const exportToPDF = () => {
    // Simulation d'export PDF
    const content = `
RAPPORT COMPTABLE - ${selectedYear}
================================

REVENUS TOTAUX: ${formatCurrency(totalAnnualRevenue)}
DÉPENSES TOTALES: ${formatCurrency(totalAnnualExpenses)}
BÉNÉFICE NET: ${formatCurrency(netAnnualRevenue)}

DÉTAIL MENSUEL
--------------
${monthlyRevenue.map(m => `${m.month}: Revenus: ${formatCurrency(m.revenue)} | Dépenses: ${formatCurrency(m.expenses)} | Net: ${formatCurrency(m.revenue - m.expenses)}`).join('\n')}

DÉCLARATION FISCALE
-------------------
Revenu brut: ${formatCurrency(taxDeclaration.totalRevenue)}
Charges déductibles: ${formatCurrency(taxDeclaration.totalExpenses)}
Revenu net: ${formatCurrency(taxDeclaration.netProfit)}
Impôt estimé (${taxDeclaration.taxRate * 100}%): ${formatCurrency(taxDeclaration.estimatedTax)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-comptable-${selectedYear}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fonction d'export Excel (CSV)
  const exportToExcel = () => {
    const headers = ['Mois', 'Revenus', 'Dépenses', 'Net', 'Année'];
    const rows = monthlyRevenue.map(m => [m.month, m.revenue, m.expenses, m.revenue - m.expenses, m.year]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comptabilite-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider font-body">Statistiques</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Statistiques Financières</h1>
          <p className="text-muted-foreground mt-1">Vue globale de votre comptabilité et déclarations fiscales</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cartes de Stats Financières */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAnnualRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">
              +12% vs année précédente
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Dépenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalAnnualExpenses)}</div>
            <p className="text-xs text-red-600 mt-1">
              Charges et entretiens
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Bénéfice Net</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(netAnnualRevenue)}</div>
            <p className="text-xs text-blue-600 mt-1">
              Après déduction des charges
            </p>
          </CardContent>
        </Card>
        <Card className={totalUnpaid > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {occupiedRooms}/{totalRooms} chambres occupées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques de performance & Revenus */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue globale</TabsTrigger>
          <TabsTrigger value="performance">Graphiques</TabsTrigger>
          <TabsTrigger value="occupancy">Taux occupation</TabsTrigger>
          <TabsTrigger value="revenues">Revenus</TabsTrigger>
          <TabsTrigger value="annual">Historique</TabsTrigger>
          <TabsTrigger value="properties">Par bien</TabsTrigger>
          <TabsTrigger value="rooms">Par chambre</TabsTrigger>
          <TabsTrigger value="unpaid">Impayés</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="tax">Fiscal</TabsTrigger>
        </TabsList>

        {/* Vue globale */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Biens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalProperties}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalRooms} chambres au total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taux d'occupation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{occupancyRate}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {occupiedRooms}/{totalRooms} occupées
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loyers impayés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {unpaidRents.length} locataires en retard
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Graphiques de performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance mensuelle - {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end gap-1">
                  {monthlyRevenue.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                        style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: "20px" }}
                      />
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-[120px]">
                        <p className="font-semibold text-sm">{data.month}</p>
                        <p className="text-xs text-muted-foreground">Revenus: {formatCurrency(data.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Dépenses: {formatCurrency(data.expenses)}</p>
                        <p className="text-xs font-medium text-green-600">Net: {formatCurrency(data.revenue - data.expenses)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month.substring(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition des biens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties.slice(0, 4).map((property, index) => (
                    <div key={property.id} className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium", chartColors.primary)}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.location.city}</p>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(property.price * 12)}/an
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Taux d'occupation */}
        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'occupation global</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {occupiedRooms}/{totalRooms} chambres occupées
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux moyen historique</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  Moyenne sur 5 ans
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chambres vacantes</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRooms - occupiedRooms}</div>
                <p className="text-xs text-muted-foreground">
                  Sur {totalRooms} chambres au total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus pertes vacance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency((totalRooms - occupiedRooms) * 150000)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimation mensuelle
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Taux d'occupation par bien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property, index) => {
                  const propertyRooms = property.rooms?.length || 1;
                  const propertyOccupied = property.rooms?.filter((r: any) => r.status === "occupé").length || 0;
                  const propertyOccupancy = Math.round((propertyOccupied / propertyRooms) * 100);
                  return (
                    <div key={property.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium", chartColors.primary)}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.location.city}</p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{propertyOccupied}/{propertyRooms}</span>
                          <span className={cn("font-medium", propertyOccupancy >= 80 ? "text-green-600" : propertyOccupancy >= 60 ? "text-yellow-600" : "text-red-600")}>
                            {propertyOccupancy}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              propertyOccupancy >= 80 ? "bg-green-500" : propertyOccupancy >= 60 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${propertyOccupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus mensuels/annuels détaillés */}
        <TabsContent value="revenues" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenus mensuels moyens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(totalAnnualRevenue / 12)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Moyenne sur {selectedYear}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenus annuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalAnnualRevenue)}
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  +12% vs année précédente
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dépenses annuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalAnnualExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Charges et entretiens
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail des revenus mensuels - {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Mois</th>
                      <th className="text-right py-3 px-4">Revenus</th>
                      <th className="text-right py-3 px-4">Dépenses</th>
                      <th className="text-right py-3 px-4">Net</th>
                      <th className="text-center py-3 px-4">Tendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenue.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{data.month}</td>
                        <td className="text-right py-3 px-4 text-green-600">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(data.revenue - data.expenses)}
                        </td>
                        <td className="text-center py-3 px-4">
                          {index > 0 ? (
                            data.revenue > monthlyRevenue[index - 1].revenue ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600 inline" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600 inline" />
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold bg-muted/50">
                      <td className="py-3 px-4">Total</td>
                      <td className="text-right py-3 px-4 text-green-600">
                        {formatCurrency(totalAnnualRevenue)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        {formatCurrency(totalAnnualExpenses)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(netAnnualRevenue)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique annuel */}
        <TabsContent value="annual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historique annuel (5 dernières années)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-end gap-2">
                {annualHistory.map((data, index) => (
                  <div key={data.year} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="flex flex-col gap-1 w-full">
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600 cursor-pointer"
                        style={{ height: `${(data.revenue / maxHistoryRevenue) * 100}%`, minHeight: "30px" }}
                      />
                      <div
                        className="w-full bg-red-400 rounded-b transition-all hover:bg-red-500"
                        style={{ height: `${(data.expenses / maxHistoryRevenue) * 100}%`, minHeight: "10px" }}
                      />
                    </div>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-[150px]">
                      <p className="font-semibold text-sm">{data.year}</p>
                      <p className="text-xs text-green-600">Revenus: {formatCurrency(data.revenue)}</p>
                      <p className="text-xs text-red-600">Dépenses: {formatCurrency(data.expenses)}</p>
                      <p className="text-xs font-medium text-blue-600">Net: {formatCurrency(data.netProfit)}</p>
                      <p className="text-xs text-muted-foreground">Occupation: {data.occupancyRate}%</p>
                    </div>
                    <span className="text-xs font-medium">{data.year}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Revenus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-sm">Dépenses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tableau récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Année</th>
                      <th className="text-right py-3 px-4">Revenus</th>
                      <th className="text-right py-3 px-4">Dépenses</th>
                      <th className="text-right py-3 px-4">Bénéfice net</th>
                      <th className="text-center py-3 px-4">Taux d'occupation</th>
                      <th className="text-right py-3 px-4">Évolution vs N-1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annualHistory.map((data, index) => (
                      <tr key={data.year} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{data.year}</td>
                        <td className="text-right py-3 px-4 text-green-600">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-600">
                          {formatCurrency(data.netProfit)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            data.occupancyRate >= 80 ? "bg-green-100 text-green-800" : data.occupancyRate >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                          )}>
                            {data.occupancyRate}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          {index > 0 ? (
                            data.netProfit > annualHistory[index - 1].netProfit ? (
                              <span className="text-green-600 flex items-center justify-end gap-1">
                                <ArrowUpRight className="h-4 w-4" />
                                +{formatCurrency(data.netProfit - annualHistory[index - 1].netProfit)}
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center justify-end gap-1">
                                <ArrowDownRight className="h-4 w-4" />
                                {formatCurrency(data.netProfit - annualHistory[index - 1].netProfit)}
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Comptable */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToPDF}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-red-500" />
                  Export PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Générez un rapport comptable détaillé au format PDF incluant :
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>• Résumé des revenus et dépenses</li>
                  <li>• Détail mensuel</li>
                  <li>• Déclaration fiscale simplifiée</li>
                  <li>• Statistiques par bien</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToExcel}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  Export Excel (CSV)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Exportez vos données comptables au format Excel/CSV :
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>• Données mensuelles détaillées</li>
                  <li>• Revenus par bien</li>
                  <li>• Revenus par chambre</li>
                  <li>• Historique annuel</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Aperçu des données d'export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Mois</th>
                      <th className="text-right py-3 px-4">Revenus</th>
                      <th className="text-right py-3 px-4">Dépenses</th>
                      <th className="text-right py-3 px-4">Net</th>
                      <th className="text-center py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRevenue.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{data.month} {data.year}</td>
                        <td className="text-right py-3 px-4 text-green-600">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          {formatCurrency(data.expenses)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatCurrency(data.revenue - data.expenses)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Clos
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Déclaration Fiscale Simplifiée */}
        <TabsContent value="tax" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-700">Revenu Brut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">
                  {formatCurrency(taxDeclaration.totalRevenue)}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Total des loyers perçus en {taxDeclaration.year}
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-700">Charges Déductibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-700">
                  {formatCurrency(taxDeclaration.totalExpenses)}
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  Charges et frais déductibles
                </p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700">Revenu Net Imposable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  {formatCurrency(taxDeclaration.netProfit)}
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  Revenu brut - Charges déductibles
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calcul de l'impôt estimé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Revenu net imposable</span>
                    <span className="font-medium">{formatCurrency(taxDeclaration.netProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Taux d'imposition</span>
                    <span className="font-medium">{(taxDeclaration.taxRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b bg-muted/50 rounded-lg px-4">
                    <span className="font-semibold">Impôt estimé</span>
                    <span className="font-bold text-lg text-red-600">
                      {formatCurrency(taxDeclaration.estimatedTax)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * Ce calcul est une estimation. Veuillez consulter un expert-comptable ou les services fiscaux pour la déclaration définitive.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Détail des charges déductibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxDeclaration.deductibleExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm">{expense.name}</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 font-semibold bg-muted/50 rounded-lg px-4">
                    <span>Total</span>
                    <span>{formatCurrency(taxDeclaration.totalExpenses)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documents à conserver pour la déclaration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Baux de location</p>
                    <p className="text-xs text-muted-foreground">Contrats signés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Receipt className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Quittances de loyer</p>
                    <p className="text-xs text-muted-foreground">Paiements reçus</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calculator className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-medium text-sm">Factures de travaux</p>
                    <p className="text-xs text-muted-foreground">Entretiens et réparations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Taxe foncière</p>
                    <p className="text-xs text-muted-foreground">Avis d'imposition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus par bien */}
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par bien immobilier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Bien</th>
                      <th className="text-left py-3 px-4">Localisation</th>
                      <th className="text-right py-3 px-4">Loyer mensuel</th>
                      <th className="text-center py-3 px-4">Taux occupation</th>
                      <th className="text-right py-3 px-4">Mois occupés</th>
                      <th className="text-right py-3 px-4">Revenus annuels</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyRevenues.map((property) => (
                      <tr key={property.propertyId} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{property.propertyTitle}</td>
                        <td className="py-3 px-4 text-muted-foreground">{property.location}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(property.monthlyRent)}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  property.occupancyRate >= 90 ? "bg-green-500" : property.occupancyRate >= 70 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                style={{ width: `${property.occupancyRate}%` }}
                              />
                            </div>
                            <span className="text-xs">{Math.round(property.occupancyRate)}%</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{property.occupancyMonths}/12</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(property.annualRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus par chambre */}
        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par chambre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Chambre</th>
                      <th className="text-left py-3 px-4">Bien</th>
                      <th className="text-right py-3 px-4">Loyer mensuel</th>
                      <th className="text-left py-3 px-4">Locataire</th>
                      <th className="text-center py-3 px-4">Statut</th>
                      <th className="text-right py-3 px-4">Revenus annuels</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomRevenues.map((room) => (
                      <tr key={room.roomId} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{room.roomName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{room.propertyTitle}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(room.monthlyRent)}</td>
                        <td className="py-3 px-4">{room.tenantName}</td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              room.status === "occupé" ? "bg-green-100 text-green-800" : room.status === "vacant" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {room.status === "occupé" ? "Occupé" : room.status === "vacant" ? "Vacant" : "En attente"}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-green-600">
                          {formatCurrency(room.annualRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyers impayés */}
        <TabsContent value="unpaid" className="space-y-4">
          {unpaidRents.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">Total impayés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {formatCurrency(totalUnpaid)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {unpaidRents.length} cas actifs
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-600">Retard moyen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round(unpaidRents.reduce((sum, r) => sum + r.daysLate, 0) / unpaidRents.length)} jours
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Depuis la date d'échéance
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-600">En attente de relance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {unpaidRents.filter((r) => r.status === "en_retard").length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Pas encore relancés
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Détail des loyers impayés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Locataire</th>
                          <th className="text-left py-3 px-4">Bien / Chambre</th>
                          <th className="text-right py-3 px-4">Montant</th>
                          <th className="text-left py-3 px-4">Date d'échéance</th>
                          <th className="text-center py-3 px-4">Jours de retard</th>
                          <th className="text-center py-3 px-4">Statut</th>
                          <th className="text-center py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unpaidRents.map((rent) => (
                          <tr key={rent.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{rent.tenantName}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{rent.propertyTitle}</p>
                                <p className="text-xs text-muted-foreground">{rent.roomName}</p>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-semibold text-red-600">
                              {formatCurrency(rent.amount)}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(rent.dueDate).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="text-center py-3 px-4">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  rent.daysLate > 20 ? "bg-red-100 text-red-800" : rent.daysLate > 10 ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"
                                )}
                              >
                                {rent.daysLate} jours
                              </span>
                            </td>
                            <td className="text-center py-3 px-4">
                              {getStatusBadge(rent.status)}
                            </td>
                            <td className="text-center py-3 px-4">
                              <button className="text-primary hover:underline text-sm">
                                Envoyer rappel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Aucun loyer impayé</p>
                    <p className="text-muted-foreground">
                      Tous vos locataires sont à jour dans leurs paiements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStats;
