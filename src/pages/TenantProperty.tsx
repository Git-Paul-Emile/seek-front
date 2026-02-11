import React, { useEffect, useState } from 'react';
import { Home, MapPin, Bed, Bath, Square, Wifi, Wind, Tv, Refrigerator, WashingMachine, ChefHat, Car, Shield, Phone, Mail, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import tenantService from '../services/tenant.service';
import { PropertyInfo, Equipment } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';

const TenantProperty: React.FC = () => {
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPropertyInfo();
  }, []);

  const loadPropertyInfo = async () => {
    try {
      const data = await tenantService.getPropertyInfo();
      setProperty(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipmentIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'wifi': <Wifi className="h-4 w-4" />,
      'climatisation': <Wind className="h-4 w-4" />,
      'tv': <Tv className="h-4 w-4" />,
      'refrigerateur': <Refrigerator className="h-4 w-4" />,
      'machine_a_laver': <WashingMachine className="h-4 w-4" />,
      'cuisine_equipee': <ChefHat className="h-4 w-4" />,
      'parking': <Car className="h-4 w-4" />,
      'securite': <Shield className="h-4 w-4" />,
    };
    return icons[type] || <CheckCircle className="h-4 w-4" />;
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
        title="MON LOGEMENT"
        icon={Home}
        description="Informations sur votre lieu de vie"
      >
        <h1 className="text-3xl font-bold tracking-tight">Mon logement</h1>
      </PageHeader>

      {property ? (
        <Tabs defaultValue="informations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="equipements">Équipements</TabsTrigger>
          </TabsList>

          <TabsContent value="informations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {property.name}
                  </CardTitle>
                  <CardDescription>
                    Votre domicile actuel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg">{property.address}</span>
                  </div>
                  
                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{property.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Square className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Surface</p>
                        <p className="font-medium">{property.surface} m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salles de bain</p>
                        <p className="font-medium">{property.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pièces</p>
                        <p className="font-medium">{property.rooms}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                  <CardDescription>
                    Détails de votre logement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Type de bien</span>
                      <span className="font-medium">{property.type}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Surface totale</span>
                      <span className="font-medium">{property.surface} m²</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Nombre de pièces</span>
                      <span className="font-medium">{property.rooms}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Salles de bain</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Étage</span>
                      <span className="font-medium">{property.floor || 'Rez-de-chaussée'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Situation</CardTitle>
                  <CardDescription>
                    Localisation et environnement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Ville</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Quartier</span>
                      <span className="font-medium">{property.district}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Proximités</span>
                      <span className="font-medium text-sm">{property.proximity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contacts</CardTitle>
                  <CardDescription>
                    Personnes à contacter en cas de besoin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Propriétaire / Gérant</p>
                          <p className="text-sm text-muted-foreground">{property.ownerName}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{property.ownerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{property.ownerEmail}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Contacter
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Service technique</p>
                          <p className="text-sm text-muted-foreground">Dépannages & entretiens</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{property.technicalPhone || 'Non disponible'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{property.technicalEmail || 'Non disponible'}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        Signaler un problème
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Urgence 24h/24</p>
                          <p className="text-sm text-muted-foreground">Ligne d'urgence</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{property.emergencyPhone || 'Non disponible'}</span>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" className="w-full mt-3">
                        Appeler en urgence
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipements" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Équipements disponibles
                  </CardTitle>
                  <CardDescription>
                    Liste de tous les équipements inclus dans votre logement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{property.equipments?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Équipements</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-3xl font-bold">{property.equipments?.filter((e: Equipment) => e.isFunctional).length || 0}</p>
                      <p className="text-sm text-muted-foreground">Fonctionnels</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-center">
                      <p className="text-3xl font-bold">{property.equipments?.filter((e: Equipment) => !e.isFunctional).length || 0}</p>
                      <p className="text-sm text-muted-foreground">En maintenance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {property.equipments && property.equipments.length > 0 ? (
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {property.equipments.map((equipment: Equipment, index: number) => (
                    <Card key={index} className={equipment.isFunctional ? '' : 'opacity-60'}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            equipment.isFunctional 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-amber-100 text-amber-600'
                          }`}>
                            {getEquipmentIcon(equipment.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{equipment.name}</p>
                              <Badge variant={equipment.isFunctional ? 'default' : 'secondary'}>
                                {equipment.isFunctional ? 'OK' : 'Maintenance'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {equipment.description}
                            </p>
                            {equipment.quantity && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Quantité: {equipment.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="lg:col-span-2">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun équipement</h3>
                    <p className="text-muted-foreground">
                      Aucun équipement n'est référencé pour ce logement.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Équipements inclus</CardTitle>
                  <CardDescription>
                    Ces équipements sont fournis avec votre logement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {property.includedEquipments?.map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucune information</h3>
            <p className="text-muted-foreground">
              Impossible de charger les informations du logement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantProperty;
