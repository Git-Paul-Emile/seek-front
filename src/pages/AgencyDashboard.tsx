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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/layout/PageHeader";

const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title="TABLEAU DE BORD"
        icon={LayoutDashboard}
        description="Voici un aperçu de votre espace agence"
        action={
          <Button variant="outline" onClick={() => navigate("/agency/profile")}>
            <Building2 className="mr-2 h-4 w-4" />
            Mon profil
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Biens gérés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Propriétaires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Revenus (mois)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Taux occupation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions principales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">Gérer votre agence</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gestion des équipes */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/agency/team")}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Équipe</CardTitle>
              <CardDescription>
                Gérez les membres de votre équipe et leurs rôles
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Gérer l'équipe
              </Button>
            </CardContent>
          </Card>

          {/* Gestion des propriétaires */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/agency/owners")}>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Propriétaires</CardTitle>
              <CardDescription>
                Gérez vos clients propriétaires et leurs biens
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Voir les propriétaires
              </Button>
            </CardContent>
          </Card>

          {/* Gestion des biens */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/agency/properties")}>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Home className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Biens immobiliers</CardTitle>
              <CardDescription>
                Gérez tous les biens de votre portefeuille
              </CardDescription>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rapports et statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Revenus du mois</span>
                <span className="font-semibold text-green-600">0 CFA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Paiements en attente</span>
                <span className="font-semibold text-orange-600">0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Contrats à renouveler</span>
                <span className="font-semibold text-primary">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground">
                Aucune activité récente
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;
