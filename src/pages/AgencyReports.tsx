import React, { useState } from 'react';
import { 
  FileBarChart, 
  FileSpreadsheet, 
  Download, 
  Calendar,
  Building,
  UserCheck,
  PieChart,
  FileText,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { agencyAuth } from '@/services/agency-auth.service';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Données fictives pour les graphiques
const monthlyData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Fév', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Avr', revenue: 2780, expenses: 3908 },
  { name: 'Mai', revenue: 1890, expenses: 4800 },
  { name: 'Juin', revenue: 2390, expenses: 3800 },
  { name: 'Juil', revenue: 3490, expenses: 4300 },
];

const annualData = [
  { name: '2020', revenue: 40000, expenses: 24000 },
  { name: '2021', revenue: 45000, expenses: 30000 },
  { name: '2022', revenue: 52000, expenses: 35000 },
  { name: '2023', revenue: 48000, expenses: 32000 },
  { name: '2024', revenue: 60000, expenses: 40000 },
];

const propertyData = [
  { name: 'Appartement T2', revenue: 12000, occupancy: 95 },
  { name: 'Maison T3', revenue: 18000, occupancy: 100 },
  { name: 'Studio', revenue: 8000, occupancy: 85 },
  { name: 'T4 Duplex', revenue: 22000, occupancy: 90 },
];

const chargesData = [
  { name: 'Copropriété', value: 4500 },
  { name: 'Électricité', value: 2800 },
  { name: 'Eau', value: 1500 },
  { name: 'Assurance', value: 1200 },
  { name: 'Entretiens', value: 2000 },
  { name: 'Divers', value: 800 },
];

const AgencyReports: React.FC = () => {
  const user = agencyAuth.currentUser;
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');

  const handleExportPDF = (reportType: string) => {
    // Simulation d'export PDF
    alert(`Export PDF du ${reportType} en cours...`);
  };

  const handleExportExcel = (reportType: string) => {
    // Simulation d'export Excel
    alert(`Export Excel du ${reportType} en cours...`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rapports & Exports</h1>
          <p className="text-muted-foreground">
            Générez et exportez vos rapports financiers et analytiques
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportPDF('rapport global')}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExportExcel('rapport global')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">Mensuel</span>
          </TabsTrigger>
          <TabsTrigger value="annual" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            <span className="hidden lg:inline">Annuel</span>
          </TabsTrigger>
          <TabsTrigger value="owner" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden lg:inline">Propriétaire</span>
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden lg:inline">Par Bien</span>
          </TabsTrigger>
          <TabsTrigger value="charges" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden lg:inline">Charges</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden lg:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Rapport Mensuel */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport Mensuel</CardTitle>
                  <CardDescription>
                    Aperçu des revenus et dépenses du mois en cours
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="quarter">Ce trimestre</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenus" />
                  <Bar dataKey="expenses" fill="#82ca9d" name="Dépenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport Annuel */}
        <TabsContent value="annual" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport Annuel</CardTitle>
                  <CardDescription>
                    Évolution des revenus et dépenses sur plusieurs années
                  </CardDescription>
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenus" />
                  <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Dépenses" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport par Propriétaire */}
        <TabsContent value="owner" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport par Propriétaire</CardTitle>
                  <CardDescription>
                    Performance financière par propriétaire
                  </CardDescription>
                </div>
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Tous les propriétaires" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les propriétaires</SelectItem>
                    <SelectItem value="owner1">Dupont Jean</SelectItem>
                    <SelectItem value="owner2">Martin Marie</SelectItem>
                    <SelectItem value="owner3">Bernard Pierre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Revenus</CardDescription>
                    <CardTitle className="text-2xl">24 500 €</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">+12% vs mois dernier</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Dépenses</CardDescription>
                    <CardTitle className="text-2xl">8 200 €</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">-5% vs mois dernier</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Taux d'Occupation</CardDescription>
                    <CardTitle className="text-2xl">92%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">4 biens sur 5 occupés</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport par Bien */}
        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport par Bien</CardTitle>
                  <CardDescription>
                    Performance par propriété
                  </CardDescription>
                </div>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Tous les biens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les biens</SelectItem>
                    <SelectItem value="prop1">Appartement T2 - Paris</SelectItem>
                    <SelectItem value="prop2">Maison T3 - Lyon</SelectItem>
                    <SelectItem value="prop3">Studio - Marseille</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={propertyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenus (€)" />
                  <Bar dataKey="occupancy" fill="#82ca9d" name="Taux d'occupation (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapport des Charges */}
        <TabsContent value="charges" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rapport des Charges</CardTitle>
                  <CardDescription>
                    Répartition des charges par catégorie
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Détail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={chargesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chargesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <h4 className="font-semibold">Détail des Charges</h4>
                  {chargesData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value.toLocaleString()} €</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span>{chargesData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export PDF / Excel</CardTitle>
              <CardDescription>
                Téléchargez vos rapports dans différents formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Rapport Mensuel</CardTitle>
                    <CardDescription>
                      PDF - Synthèse du mois en cours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => handleExportPDF('rapport mensuel')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger PDF
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Rapport Mensuel</CardTitle>
                    <CardDescription>
                      Excel - Données détaillées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={() => handleExportExcel('rapport mensuel')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger Excel
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Rapport Annuel</CardTitle>
                    <CardDescription>
                      PDF - Synthèse de l'année
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => handleExportPDF('rapport annuel')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger PDF
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Rapport Annuel</CardTitle>
                    <CardDescription>
                      Excel - Données complètes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={() => handleExportExcel('rapport annuel')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger Excel
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <UserCheck className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>État Propriétaire</CardTitle>
                    <CardDescription>
                      PDF - Situation par propriétaire
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => handleExportPDF('état propriétaire')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger PDF
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <Building className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>État des Biens</CardTitle>
                    <CardDescription>
                      Excel - Inventaire complet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={() => handleExportExcel('état biens')}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger Excel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyReports;
