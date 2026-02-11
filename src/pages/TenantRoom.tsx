import React, { useEffect, useState } from 'react';
import { Home, MapPin, Users, Ruler, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import tenantService from '../services/tenant.service';
import { RoomInfo } from '../types/tenant';

const TenantRoom: React.FC = () => {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoomInfo();
  }, []);

  const loadRoomInfo = async () => {
    try {
      const data = await tenantService.getRoomInfo();
      setRoom(data);
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
      <div>
        <h1 className="text-3xl font-bold">Ma chambre</h1>
        <p className="text-muted-foreground">
          Informations sur votre espace de vie
        </p>
      </div>

      {room ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Room Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Détails de la chambre
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

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Équipements disponibles</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Meublé</Badge>
                  <Badge variant="outline">WiFi</Badge>
                  <Badge variant="outline">Machine à laver</Badge>
                  <Badge variant="outline">Cuisine équipée</Badge>
                </div>
              </div>
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
                  <p className="text-sm text-muted-foreground">Propriétaire / Gérant</p>
                  <p className="font-medium">Jean Dupont</p>
                  <p className="text-sm">06 12 34 56 78</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Contacter
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Service technique</p>
                  <p className="font-medium">Seek Support</p>
                  <p className="text-sm">support@seek.com</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Signaler un problème
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
