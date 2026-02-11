import React, { useEffect, useState } from 'react';
import { Users, MessageCircle, Mail, Phone, Calendar, UserPlus, Clock, Shield, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import tenantService from '../services/tenant.service';
import { Colocataire, ColocationRules } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';

const TenantFlatmates: React.FC = () => {
  const [colocataires, setColocataires] = useState<Colocataire[]>([]);
  const [colocationRules, setColocationRules] = useState<ColocationRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colocData, rulesData] = await Promise.all([
        tenantService.getColocataires(),
        tenantService.getColocationRules(),
      ]);
      setColocataires(colocData);
      setColocationRules(rulesData);
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
      <PageHeader
        title="COLOCATAIRES"
        icon={UserPlus}
        description="Vos compagnons de colocation"
      >
        <h1 className="text-3xl font-bold tracking-tight">Colocataires</h1>
      </PageHeader>

      <Tabs defaultValue="flatmates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="flatmates">Mes colocataires</TabsTrigger>
          <TabsTrigger value="rules">Règles de vie</TabsTrigger>
        </TabsList>

        <TabsContent value="flatmates" className="space-y-6">
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
                      {colocataire.roomNumber}
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
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {colocationRules ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Quiet Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Horaires de calme
                  </CardTitle>
                  <CardDescription>
                    Moments où le silence est requis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Heures de silence</p>
                        <p className="text-sm text-muted-foreground">
                          {colocationRules.quietHoursStart} - {colocationRules.quietHoursEnd}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {colocationRules.noiseLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Durant ces horaires, merci de respecter le calme pour le repos de tous.
                  </p>
                </CardContent>
              </Card>

              {/* Guest Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Politique des invités
                  </CardTitle>
                  <CardDescription>
                    Règles concernant les visiteurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {colocationRules.guestPolicy}
                  </p>
                </CardContent>
              </Card>

              {/* Cleaning Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Ménage
                  </CardTitle>
                  <CardDescription>
                    Organisation du nettoyage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {colocationRules.cleaningSchedule}
                  </p>
                </CardContent>
              </Card>

              {/* Shared Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Charges communes
                  </CardTitle>
                  <CardDescription>
                    Gestion des dépenses partagées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {colocationRules.sharedExpenses}
                  </p>
                </CardContent>
              </Card>

              {/* Additional Rules */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Règles complémentaires
                  </CardTitle>
                  <CardDescription>
                    Pour une colocation harmonieuse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {colocationRules.additionalRules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-sm">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Informations importantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>En cas de conflit, privilégiez toujours le dialogue</li>
                    <li>Signaler tout problème au propriétaire ou au gestionnaire</li>
                    <li>Respectez les règles établies pour le bien-être de tous</li>
                    <li>Communiquez à l'avance en cas d'absence prolongée</li>
                    <li>Tenez les colocataires informés de vos invités</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune règle définie</h3>
                <p className="text-muted-foreground">
                  Les règles de colocation n'ont pas encore été établies pour votre logement.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantFlatmates;
