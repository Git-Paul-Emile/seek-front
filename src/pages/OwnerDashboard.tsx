import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerDashboard() {
  const navigate = useNavigate();

  const handleCreateProperty = (type: "CLASSIC" | "COLOCATION") => {
    navigate(`/owner/properties/new?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Message de Bienvenue */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre espace propriétaire ! 👋
          </h1>
          <p className="text-gray-600">
            Commencez dès maintenant en ajoutant votre premier bien. Les locataires vous attendent !
          </p>
        </div>

        {/* Sélection du type de publication */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Quel type de bien souhaitez-vous publier ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location classique */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 group"
              onClick={() => handleCreateProperty("CLASSIC")}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Home className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Location classique</CardTitle>
                <CardDescription>
                  Un logement pour un seul ménage
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-500 mb-4">
                  Appartements, maisons, studios en location traditionnelle avec bail unique.
                </p>
                <Button className="w-full group-hover:bg-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une annonce
                </Button>
              </CardContent>
            </Card>

            {/* Colocation */}
            <Card
              className="cursor-pointer transition-all hover:shadow-lg hover:border-purple-300 group"
              onClick={() => handleCreateProperty("COLOCATION")}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Colocation</CardTitle>
                <CardDescription>
                  Plusieurs chambres dans un même logement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-500 mb-4">
                  Logements partagés avec plusieurs locataires ayant chacun leur chambre mais共用 les espaces communs.
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une annonce
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <p className="text-sm text-gray-500">Biens publiés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-500">Demandes de visite</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-500">Candidatures</p>
            </CardContent>
          </Card>
        </div>

        {/* Tutoriel rapide */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Guide de création d'annonce
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p><strong> Titre de l'annonce</strong> - Décrivez votre bien en quelques mots accrocheurs</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p><strong> Photos de qualité</strong> - Les locataires apprécient les photos lumineuses et nettes</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p><strong> Prix et charges</strong> - Soyez transparent sur les coûts pour attirer des candidatures sérieuses</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <p><strong> Publication</strong> - Validez et votre annonce sera visible immédiatement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
