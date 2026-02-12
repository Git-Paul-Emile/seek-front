import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2,
  Users,
  Home,
  ArrowRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  LayoutDashboard,
  Calculator,
  FileSpreadsheet,
  FileBarChart,
  Receipt,
  Wallet,
  Building,
  CreditCard,
  TrendingDown,
  Calendar,
  PieChart,
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/layout/PageHeader";

// Données fictives pour la démo
const mockData = {
  totalProperties: 48,
  occupancyRate: 87,
  monthlyRentCollected: 12500000,
  delayedRent: 1850000,
  ownersRevenue: [
    { name: "Diop Family", revenue: 4500000, percentage: 36, id: 1 },
    { name: "Sarr Corp", revenue: 3200000, percentage: 26, id: 2 },
    { name: "Ndiaye Ltd", revenue: 2800000, percentage: 22, id: 3 },
    { name: "Autres", revenue: 2000000, percentage: 16, id: 4 },
  ],
  accounting: {
    totalRevenue: 15600000,
    totalExpenses: 3200000,
    netIncome: 12400000,
    pendingInvoices: 1850000,
    taxAmount: 2100000,
    expensesByCategory: [
      { category: "Maintenance", amount: 1200000, percentage: 37.5, id: 1 },
      { category: "Assurances", amount: 800000, percentage: 25, id: 2 },
      { category: "Frais de gestion", amount: 700000, percentage: 21.875, id: 3 },
      { category: "Divers", amount: 500000, percentage: 15.625, id: 4 },
    ],
    revenueByProperty: [
      { property: "Villa Keur Xba", revenue: 3500000, id: 1 },
      { property: "Immeuble Central", revenue: 2800000, id: 2 },
      { property: "Appartement Plateau", revenue: 2200000, id: 3 },
      { property: "Maison Médina", revenue: 1800000, id: 4 },
      { property: "Studio Ouakam", revenue: 1500000, id: 5 },
    ],
    revenueByTenant: [
      { tenant: "M. Diop", amount: 450000, months: 6, id: 1 },
      { tenant: "Mme Sarr", amount: 380000, months: 6, id: 2 },
      { tenant: "M. Ndiaye", amount: 350000, months: 6, id: 3 },
      { tenant: "Mme Bâ", amount: 320000, months: 6, id: 4 },
      { tenant: "M. Fall", amount: 280000, months: 6, id: 5 },
    ],
    transactions: [
      { id: 1, date: "2024-01-15", description: "Loyer Villa Keur Xba", amount: 1500000, type: "income", category: "Loyer", property: "Villa Keur Xba", status: "completed" },
      { id: 2, date: "2024-01-14", description: "Maintenance Immeuble Central", amount: -250000, type: "expense", category: "Maintenance", property: "Immeuble Central", status: "completed" },
      { id: 3, date: "2024-01-13", description: "Loyer Appartement Plateau", amount: 850000, type: "income", category: "Loyer", property: "Appartement Plateau", status: "completed" },
      { id: 4, date: "2024-01-12", description: "Assurance annuelle", amount: -150000, type: "expense", category: "Assurances", property: "Immeuble Central", status: "pending" },
      { id: 5, date: "2024-01-11", description: "Loyer Maison Médina", amount: 1200000, type: "income", category: "Loyer", property: "Maison Médina", status: "completed" },
      { id: 6, date: "2024-01-10", description: "Frais de gestion", amount: -100000, type: "expense", category: "Frais de gestion", property: "Tous", status: "completed" },
    ],
    invoices: [
      { id: 1, number: "FAC-2024-001", client: "M. Diop", amount: 450000, dueDate: "2024-02-01", status: "pending" },
      { id: 2, number: "FAC-2024-002", client: "Mme Sarr", amount: 380000, dueDate: "2024-02-01", status: "paid" },
      { id: 3, number: "FAC-2024-003", client: "M. Ndiaye", amount: 350000, dueDate: "2024-01-25", status: "overdue" },
      { id: 4, number: "FAC-2024-004", client: "Mme Bâ", amount: 320000, dueDate: "2024-02-05", status: "pending" },
    ],
    taxDeclarations: [
      { id: 1, type: "TVA", period: "Janvier 2024", amount: 210000, status: "pending", dueDate: "2024-02-15" },
      { id: 2, type: "TVA", period: "Décembre 2023", amount: 195000, status: "paid", dueDate: "2024-01-15" },
      { id: 3, type: "Impôt sur revenu", period: "2023", amount: 1500000, status: "pending", dueDate: "2024-03-31" },
    ],
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

const AgencyAccounting: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState("month");
  const [stats] = useState(mockData);
  
  // Récupérer l'onglet actif depuis les query params
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "overview");

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title="COMPTABILITÉ"
        icon={Calculator}
        description="Gestion financière complète de votre agence"
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
            <Button variant="outline" onClick={() => navigate("/agency/dashboard")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Comptabilité</h1>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            navigate(`/agency/accounting?tab=${value}`, { replace: true });
          }}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="properties">Par bien</TabsTrigger>
          <TabsTrigger value="tenants">Par locataire</TabsTrigger>
          <TabsTrigger value="tax">TVA / Impôts</TabsTrigger>
        </TabsList>

        {/* ============ APERÇU ============ */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Cartes de synthèse financière */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Revenus totaux</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-700 truncate">
                  {formatCurrency(stats.accounting.totalRevenue)}
                </div>
                <p className="text-xs text-green-600 mt-1">Ce mois</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Dépenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-700 truncate">
                  {formatCurrency(stats.accounting.totalExpenses)}
                </div>
                <p className="text-xs text-red-600 mt-1">Ce mois</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Revenu net</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-700 truncate">
                  {formatCurrency(stats.accounting.netIncome)}
                </div>
                <p className="text-xs text-blue-600 mt-1">Après dépenses</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Factures en attente</CardTitle>
                <Receipt className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-700 truncate">
                  {formatCurrency(stats.accounting.pendingInvoices)}
                </div>
                <p className="text-xs text-orange-600 mt-1">Paiements dus</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">TVA / Impôts</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-700 truncate">
                  {formatCurrency(stats.accounting.taxAmount)}
                </div>
                <p className="text-xs text-purple-600 mt-1">À déclarer</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et tableaux */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenus par propriétaire */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Revenus par propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.ownersRevenue.map((owner, index) => (
                    <div key={owner.id} className="flex items-center gap-4">
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

            {/* Dépenses par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Dépenses par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.accounting.expensesByCategory.map((expense) => (
                    <div key={expense.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{expense.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <Progress
                        value={expense.percentage}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export comptable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Export comptable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Export Excel</h4>
                      <p className="text-xs text-muted-foreground">.xlsx</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Écritures comptables, balances et grand livre
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Générer Excel
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileBarChart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Export PDF</h4>
                      <p className="text-xs text-muted-foreground">.pdf</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Rapports financiers et documents officiels
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Générer PDF
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Déclaration fiscale</h4>
                      <p className="text-xs text-muted-foreground">.xml / .pdf</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Pour l'administration fiscale
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Déclarer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TRANSACTIONS ============ */}
        <TabsContent value="transactions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Journal des transactions
                </CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher une transaction..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="income">Revenus</SelectItem>
                    <SelectItem value="expense">Dépenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {stats.accounting.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.property} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{transaction.date}</span>
                      <span
                        className={`font-semibold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ PAR BIEN ============ */}
        <TabsContent value="properties" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.accounting.revenueByProperty.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {property.property}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revenus totaux</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(property.revenue)}
                      </span>
                    </div>
                    <Progress
                      value={(property.revenue / stats.accounting.totalRevenue) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {((property.revenue / stats.accounting.totalRevenue) * 100).toFixed(1)}% du total
                      </span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Propriétaire</p>
                      <p className="font-medium">Diop Family</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============ PAR LOCATAIRE ============ */}
        <TabsContent value="tenants" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Revenus par locataire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.accounting.revenueByTenant.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tenant.tenant}</p>
                        <p className="text-sm text-muted-foreground">
                          {tenant.months} mois de contrat
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(tenant.amount * tenant.months)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(tenant.amount)}/mois
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Factures */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Factures
                </CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle facture
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.accounting.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          invoice.status === "paid"
                            ? "bg-green-100"
                            : invoice.status === "overdue"
                            ? "bg-red-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {invoice.status === "paid" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : invoice.status === "overdue" ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client} • Échéance: {invoice.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TVA / IMPÔTS ============ */}
        <TabsContent value="tax" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  TVA à payer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-700 truncate">
                  {formatCurrency(stats.accounting.taxAmount)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Date limite: 15 février 2024
                </p>
                <Button className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Déclarer TVA
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  TVA collectée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600 truncate">
                  {formatCurrency(210000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  TVA sur les loyers encaissés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  TVA déductible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600 truncate">
                  {formatCurrency(85000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  TVA sur les dépenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Déclarations fiscales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Déclarations fiscales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.accounting.taxDeclarations.map((declaration) => (
                  <div
                    key={declaration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          declaration.status === "paid"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {declaration.status === "paid" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{declaration.type} - {declaration.period}</p>
                        <p className="text-sm text-muted-foreground">
                          Date limite: {declaration.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(declaration.amount)}</span>
                      {declaration.status === "pending" ? (
                        <Button variant="outline" size="sm">
                          <Calculator className="mr-2 h-4 w-4" />
                          Déclarer
                        </Button>
                      ) : (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Payée
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export fiscal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export pour l'administration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Fichier XML (DGID)</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Format compatible avec la Direction Générale des Impôts
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger XML
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Justificatifs PDF</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Documents justificatifs pour votre déclaration
                  </p>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyAccounting;
