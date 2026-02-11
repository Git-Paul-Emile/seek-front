import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import tenantService from '../services/tenant.service';

interface Colocataire {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  roomNumber: string;
  moveInDate: string;
  isActive: boolean;
}

const TenantFlatmates: React.FC = () => {
  const [colocataires, setColocataires] = useState<Colocataire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadColocataires();
  }, []);

  const loadColocataires = async () => {
    try {
      const data = await tenantService.getColocataires();
      setColocataires(data);
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
        <Card>
          <CardContent>
            <div className="h-64 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes colocataires</h1>
        <p className="text-muted-foreground">
          Vos compagnons de colocation
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <p className="font-medium">Total de colocataires</p>
          <p className="text-2xl font-bold">{colocataires.length}</p>
        </div>
      </div>

      {/* Colocataires List */}
      {colocataires.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {colocataires.map((colocataire) => (
            <Card key={colocataire.id}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={colocataire.profilePhoto} alt={colocataire.firstName} />
                    <AvatarFallback>
                      {colocataire.firstName.charAt(0)}{colocataire.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>
                  {colocataire.firstName} {colocataire.lastName}
                </CardTitle>
                <CardDescription>
                  Chambre {colocataire.roomNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={colocataire.isActive ? 'default' : 'secondary'}>
                    {colocataire.isActive ? 'Actif' : 'Ancien colocataire'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Arrivé le {new Date(colocataire.moveInDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{colocataire.email}</span>
                  </div>
                  {colocataire.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{colocataire.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun autre colocataire</h3>
            <p className="text-muted-foreground">
              Vous êtes le seul occupant de votre logement pour le moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Règles de vie commune</CardTitle>
          <CardDescription>
            Pour une colocation harmonieuse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Respect des horaires de calme (22h - 8h)</li>
            <li>Nettoyage轮流 des espaces communs</li>
            <li>Communication ouverte en cas de problème</li>
            <li>Respect des effets personnels de chacun</li>
            <li>Prévenir en cas de retard de paiement</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantFlatmates;
