import React, { useEffect, useState } from 'react';
import { Home, MapPin, Users, Ruler, Calendar, BedDouble, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import tenantService from '../services/tenant.service';
import { RoomInfo, PropertyInfo } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';

const TenantRoom: React.FC = () => {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoomInfo();
  }, []);

  const loadRoomInfo = async () => {
    try {
      const [roomData, propertyData] = await Promise.all([
        tenantService.getRoomInfo(),
        tenantService.getPropertyInfo(),
      ]);
      setRoom(roomData);
      setProperty(propertyData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="MA CHAMBRE"
        icon={BedDouble}
        description="Informations sur votre espace personnel"
      >
        <h1 className="text-3xl font-bold tracking-tight">Ma chambre</h1>
      </PageHeader>

      {room ? (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="equipements">Équipements</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Room Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Ma chambre
                  </CardTitle>
                  <CardDescription>
                    Chambre {room.number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Logement</p>
                      <p className="font-medium">{room.propertyName}</p>
                    </div>
                    <Badge variant="secondary">Chambre {room.number}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{room.address}</span>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                      <p className="text-xl font-bold">{room.monthlyRent.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacité</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{room.currentOccupants}/{room.capacity} personnes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du logement</CardTitle>
                  <CardDescription>
                    Détails de la propriété
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom du logement</p>
                    <p className="font-medium">{room.propertyName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Adresse complète</p>
                    <p className="font-medium">{room.address}</p>
                  </div>

                  {property && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Surface</p>
                          <p className="font-medium">{property.surface} m²</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Étage</p>
                          <p className="font-medium">{property.floor || 'Rez-de-chaussée'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Contacts */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contacts</CardTitle>
                  <CardDescription>
                    Personnes à contacter en cas de besoin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Propriétaire / Gérant</p>
                      <p className="font-medium">{property?.ownerName || 'Jean Dupont'}</p>
                      <p className="text-sm">{property?.ownerPhone || '06 12 34 56 78'}</p>
                      <Button variant="link" className="h-auto p-0 text-primary mt-2">
                        <Phone className="h-4 w-4 mr-1" />
                        Contacter
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Service technique</p>
                      <p className="font-medium">Seek Support</p>
                      <p className="text-sm">support@seek.com</p>
                      <Button variant="link" className="h-auto p-0 text-primary mt-2">
                        <Mail className="h-4 w-4 mr-1" />
                        Signaler un problème
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
                    Équipements de ma chambre
                  </CardTitle>
                  <CardDescription>
                    Liste des équipements disponibles dans votre espace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="px-4 py-2">
                      <BedDouble className="h-4 w-4 mr-2" />
                      Lit
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bureau
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Chaise de bureau
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Placard
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Étagère
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Équipements du logement
                  </CardTitle>
                  <CardDescription>
                    Équipements communs disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {property?.equipments && property.equipments.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {property.equipments.map((eq) => (
                        <Badge 
                          key={eq.id} 
                          variant={eq.isFunctional ? 'default' : 'destructive'}
                          className="px-4 py-2"
                        >
                          {eq.isFunctional ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          {eq.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Meublé
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        WiFi
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Machine à laver
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Cuisine équipée
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucune chambre attribuée</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore de chambre attribuée. Veuillez contacter le propriétaire.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantRoom;
