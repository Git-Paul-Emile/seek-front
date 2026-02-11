import React, { useEffect, useState } from 'react';
import { Users, Home, ChefHat, Sofa, Bath, Flower, Car, WashingMachine, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import tenantService from '../services/tenant.service';
import { CommonSpace, Equipment } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';

const TenantCommonSpaces: React.FC = () => {
  const [commonSpaces, setCommonSpaces] = useState<CommonSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommonSpaces();
  }, []);

  const loadCommonSpaces = async () => {
    try {
      const data = await tenantService.getCommonSpaces();
      setCommonSpaces(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpaceIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'kitchen': <ChefHat className="h-5 w-5" />,
      'living_room': <Sofa className="h-5 w-5" />,
      'bathroom': <Bath className="h-5 w-5" />,
      'garden': <Flower className="h-5 w-5" />,
      'terrasse': <Home className="h-5 w-5" />,
      'parking': <Car className="h-5 w-5" />,
      'buanderie': <WashingMachine className="h-5 w-5" />,
    };
    return icons[type] || <Home className="h-5 w-5" />;
  };

  const getSpaceLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'kitchen': 'Cuisine',
      'living_room': 'Salon',
      'bathroom': 'Salle de bain',
      'garden': 'Jardin',
      'terrasse': 'Terrasse',
      'parking': 'Parking',
      'buanderie': 'Buanderie',
      'autre': 'Autre',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
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
        title="ESPACES COMMUNS"
        icon={Users}
        description="Les espaces partagés de votre colocation"
      >
        <h1 className="text-3xl font-bold tracking-tight">Espaces communs</h1>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Colocataires</p>
              <p className="text-2xl font-bold">{commonSpaces.length > 0 ? commonSpaces[0].sharedWith + 1 : 2}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Espaces communs</p>
              <p className="text-2xl font-bold">{commonSpaces.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Tous accessibles</p>
              <p className="text-2xl font-bold">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Common Spaces List */}
      {commonSpaces.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {commonSpaces.map((space) => (
            <Card key={space.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getSpaceIcon(space.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{space.name}</CardTitle>
                      <CardDescription>{getSpaceLabel(space.type)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {space.sharedWith} personne{space.sharedWith > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  {space.description}
                </p>

                {space.surface && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Surface:</span>
                    <span className="font-medium">{space.surface} m²</span>
                  </div>
                )}

                {space.equipments && space.equipments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {space.equipments.map((eq: Equipment, idx: number) => (
                        <Badge key={idx} variant="outline" className={eq.isFunctional ? '' : 'opacity-50'}>
                          {eq.isFunctional ? (
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                          )}
                          {eq.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {space.rules && space.rules.length > 0 && (
                  <div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Règles d'utilisation
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {space.rules.map((rule: string, idx: number) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun espace commun</h3>
            <p className="text-muted-foreground">
              Aucun espace commun n'est référencé pour votre logement.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Conseils pour une colocation harmonieuse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Communication</h4>
              <p className="text-sm text-muted-foreground">
                Parlez ouvertement avec vos colocataires en cas de problème. La communication est la clé d'une bonne entente.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Respect</h4>
              <p className="text-sm text-muted-foreground">
                Respectez les espaces et les affaires de chacun. rangez toujours vos affaires personnelles.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Propreté</h4>
              <p className="text-sm text-muted-foreground">
                Maintenez les espaces communs propres. Un planning de nettoyage peut aider à partager les tâches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantCommonSpaces;
