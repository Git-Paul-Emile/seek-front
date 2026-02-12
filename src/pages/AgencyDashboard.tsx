import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Home,
  FileText,
  ArrowRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  LayoutDashboard,
  AlertTriangle,
  Calendar,
  PieChart,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  TrendingDown,
  ArrowUpLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/layout/PageHeader";

// Données fictives pour la démo
const mockData = {
  totalProperties: 48,
  occupancyRate: 87,
  monthlyRentCollected: 12500000,
  delayedRent: 1850000,
  ownersRevenue: [
    { name: "Diop Family", revenue: 4500000, percentage: 36 },
    { name: "Sarr Corp", revenue: 3200000, percentage: 26 },
    { name: "Ndiaye Ltd", revenue: 2800000, percentage: 22 },
    { name: "Autres", revenue: 2000000, percentage: 16 },
  ],
  rentalTurnover: 12,
  expiringContracts: 5,
  rentByPeriod: [
    { month: "Jan", amount: 10200000 },
    { month: "Fév", amount: 11500000 },
    { month: "Mar", amount: 10800000 },
    { month: "Avr", amount: 12500000 },
    { month: "Mai", amount: 13200000 },
    { month: "Juin", amount: 12800000 },
  ],
  alerts: [
    { type: "warning", message: "Contrat Villa Keur Xba - expire dans 15 jours", priority: "high" },
    { type: "warning", message: "3 paiements en retard - Immeuble Central", priority: "medium" },
    { type: "info", message: "Nouveau propriétaire enregistré - M. Diop", priority: "low" },
  ],
  accounting: {
    totalRevenue: 15600000,
    totalExpenses: 3200000,
    netIncome: 12400000,
    pendingInvoices: 1850000,
    taxAmount: 2100000,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("month");
  const [stats] = useState(mockData);
  const maxRent = Math.max(...stats.rentByPeriod.map((r) => r.amount));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title="TABLEAU DE BORD"
        icon={LayoutDashboard}
        description="Voici un aperçu de votre espace agence"
        action={
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => navigate("/agency/profile")}>
              <Building2 className="mr-2 h-4 w-4" />
              Mon profil
            </Button>
          </div>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      </PageHeader>

      {/* Cartes de statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Biens gérés</CardTitle>
            <Home className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.totalProperties}</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3 ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Taux d'occupation</CardTitle>
            <Percent className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.occupancyRate}%</div>
            <Progress value={stats.occupancyRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Loyers encaissés</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(stats.monthlyRentCollected)}</div>
            <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +8.5% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Loyers en retard</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{formatCurrency(stats.delayedRent)}</div>
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" />
              -12% vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats secondaires */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rotation locative</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rentalTurnover}%</div>
            <p className="text-xs text-muted-foreground mt-1">Taux de rotation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats à expirer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringContracts}</div>
            <p className="text-xs text-muted-foreground mt-1">Dans les 30 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propriétaires actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">Clients actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et revenus */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Loyers encaissés par période */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Loyers encaissés par période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end gap-2">
              {stats.rentByPeriod.map((item, index) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                    style={{ height: `${(item.amount / maxRent) * 100}%`, minHeight: "20px" }}
                  />
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border rounded-lg p-2 shadow-lg z-10 min-w-[100px]">
                    <p className="font-semibold text-sm">{item.month}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.amount)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenus par propriétaire */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenus par propriétaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.ownersRevenue.map((owner, index) => (
                <div key={owner.name} className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(262, 83%, 58%)", "hsl(24, 95%, 53%)"][index] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{owner.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(owner.revenue)}</p>
                  </div>
                  <div className="text-sm font-semibold">{owner.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes clés */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Alertes clés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.priority === "high"
                    ? "bg-red-100 border border-red-200"
                    : alert.priority === "medium"
                    ? "bg-orange-100 border border-orange-200"
                    : "bg-blue-100 border border-blue-200"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    alert.priority === "high"
                      ? "text-red-600"
                      : alert.priority === "medium"
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}
                />
                <span
                  className={`flex-1 text-sm font-medium ${
                    alert.priority === "high"
                      ? "text-red-700"
                      : alert.priority === "medium"
                      ? "text-orange-700"
                      : "text-blue-700"
                  }`}
                >
                  {alert.message}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    alert.priority === "high"
                      ? "text-red-600 hover:text-red-700"
                      : alert.priority === "medium"
                      ? "text-orange-600 hover:text-orange-700"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Voir
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions principales */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Gérer votre agence</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/agency/team")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Équipe</CardTitle>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Gérez les membres de votre équipe et leurs rôles
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Gérer l'équipe
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/agency/owners")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Propriétaires</CardTitle>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Gérez vos clients propriétaires et leurs biens
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Voir les propriétaires
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/agency/properties")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Biens immobiliers</CardTitle>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Gérez tous les biens de votre portefeuille
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Voir les biens
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rapports et activités */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rapports et statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Revenus du mois</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.monthlyRentCollected)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Paiements en attente</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(stats.delayedRent)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Contrats à renouveler</span>
                <span className="font-semibold text-primary">{stats.expiringContracts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">
                  Paiement reçu - Villa Keur Yacine - 1,500,000 CFA
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">
                  Nouveau contrat signé - Immeuble Central Unit 12
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm">
                  Relance envoyée - M. Diop - Bail N°2024-089
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
           SECTION COMPTABILITÉ (RÉSUMÉ)
      ============================================ */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>COMPTABILITÉ</CardTitle>
            </div>
            <Button size="sm" onClick={() => navigate("/agency/accounting")}>
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Revenus</span>
              </div>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(stats.accounting.totalRevenue)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">Dépenses</span>
              </div>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(stats.accounting.totalExpenses)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpLeft className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700">Revenu net</span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {formatCurrency(stats.accounting.netIncome)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700">TVA</span>
              </div>
              <p className="text-xl font-bold text-purple-700">
                {formatCurrency(stats.accounting.taxAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyDashboard;
