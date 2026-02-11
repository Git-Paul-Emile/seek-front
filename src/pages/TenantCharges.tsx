import React, { useEffect, useState } from 'react';
import { Receipt, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import tenantService from '../services/tenant.service';
import PageHeader from '../components/layout/PageHeader';

const TenantCharges: React.FC = () => {
  const [charges, setCharges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      const data = await tenantService.getPendingCharges();
      setCharges(data);
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
        title="CHARGES"
        icon={FileText}
        description="Consultez et réglez vos charges"
      >
        <h1 className="text-3xl font-bold tracking-tight">Mes charges</h1>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Charges en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {charges.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0).toLocaleString()} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Charges payées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {charges.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()} €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total charges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {charges.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charges List */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des charges</CardTitle>
          <CardDescription>
            Liste de toutes vos charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {charges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      {new Date(charge.period).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{charge.type}</Badge>
                    </TableCell>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell className="font-medium">
                      {charge.amount.toLocaleString()} €
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {charge.status === 'paid' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <Badge 
                          variant={charge.status === 'paid' ? 'default' : 'secondary'}
                        >
                          {charge.status === 'paid' ? 'Payée' : 'En attente'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {charge.status === 'pending' && (
                        <Button size="sm">Régler</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-4" />
              <p>Aucune charge enregistrée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanations */}
      <Card>
        <CardHeader>
          <CardTitle>Explications des charges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">Charges locatives</p>
            <p className="text-sm text-muted-foreground">
              Correspondent aux dépenses liées à l'utilisation et à l'entretien courant du logement.
              Elles comprennent notamment l'eau, l'électricité (parties communes), le ménage, etc.
            </p>
          </div>
          <div>
            <p className="font-medium">Provision pour charges</p>
            <p className="text-sm text-muted-foreground">
              Somme versée mensuellement avec le loyer. Un récapitulatif annuel est fourni
              pour régulariser les éventuelles différences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantCharges;
