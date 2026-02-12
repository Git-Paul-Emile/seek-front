import React, { useEffect, useState } from 'react';
import { agencyService } from '@/services/agency-auth.service';
import type { AgencyProperty } from '@/types/agency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Search,
  MapPin,
  Home,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Building,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const AgencyProperties: React.FC = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [managementFee, setManagementFee] = useState(10);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await agencyService.getProperties();
        setProperties(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des biens:', error);
        // Données mock pour le développement
        setProperties([
          {
            id: '1',
            agencyId: '1',
            propertyId: 'p1',
            propertyName: 'Villa des Almadies',
            propertyAddress: 'Rue 10, Almadies',
            propertyType: 'Villa',
            ownerName: 'Seydou Diop',
            ownerEmail: 'seydou.diop@email.com',
            managementFee: 10,
            status: 'active',
            addedAt: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            agencyId: '1',
            propertyId: 'p2',
            propertyName: 'Appartement Mermoz',
            propertyAddress: 'Sacré Cœur 3',
            propertyType: 'Appartement',
            ownerName: 'Fatou Seck',
            ownerEmail: 'fatou.seck@email.com',
            managementFee: 12,
            status: 'active',
            addedAt: '2024-02-01T09:00:00Z',
          },
          {
            id: '3',
            agencyId: '1',
            propertyId: 'p3',
            propertyName: 'Maison Rufisque',
            propertyAddress: 'Quartier Golf',
            propertyType: 'Maison',
            ownerName: 'Mamadou Faye',
            ownerEmail: 'mamadou.faye@email.com',
            managementFee: 8,
            status: 'pending',
            addedAt: '2024-02-10T14:30:00Z',
          },
          {
            id: '4',
            agencyId: '1',
            propertyId: 'p4',
            propertyName: 'Studio Point E',
            propertyAddress: 'Point E',
            propertyType: 'Studio',
            ownerName: 'Astou Ndiaye',
            ownerEmail: 'astou.ndiaye@email.com',
            managementFee: 15,
            status: 'inactive',
            addedAt: '2024-02-05T11:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(
    (property) =>
      property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProperty = async () => {
    if (!propertyId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un bien',
        variant: 'destructive',
      });
      return;
    }

    try {
      await agencyService.addProperty(propertyId, managementFee);
      toast({
        title: 'Bien ajouté',
        description: 'Le bien a été ajouté à votre agence',
      });
      setIsAddDialogOpen(false);
      setPropertyId('');
      setManagementFee(10);
      // Recharger la liste
      const data = await agencyService.getProperties();
      setProperties(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveProperty = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce bien ?')) return;

    try {
      await agencyService.removeProperty(id);
      setProperties(properties.filter((p) => p.id !== id));
      toast({
        title: 'Bien retiré',
        description: 'Le bien a été retiré avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === 'active').length,
    pending: properties.filter((p) => p.status === 'pending').length,
    inactive: properties.filter((p) => p.status === 'inactive').length,
    avgFee:
      properties.length > 0
        ? properties.reduce((sum, p) => sum + p.managementFee, 0) / properties.length
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="PROPRIÉTÉS"
        icon={Building}
        description="Gérez les biens confiés à votre agence"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un bien
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un bien</DialogTitle>
                <DialogDescription>
                  Ajouter un bien à gérer par votre agence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="property-id">Bien à ajouter</Label>
                  <Input
                    id="property-id"
                    placeholder="ID du bien"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="management-fee">Commission (%)</Label>
                  <Input
                    id="management-fee"
                    type="number"
                    min={1}
                    max={50}
                    value={managementFee}
                    onChange={(e) => setManagementFee(Number(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProperty}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Propriétés</h1>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Inactifs</p>
              <p className="text-2xl font-bold mt-1 text-gray-600">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Commission moy.</p>
              <p className="text-2xl font-bold mt-1">{stats.avgFee.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un bien..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary">
          {filteredProperties.length} bien(s)
        </Badge>
      </div>

      {/* Taux d'occupation */}
      <Card>
        <CardHeader>
          <CardTitle>Taux d'occupation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={(stats.active / stats.total) * 100} className="flex-1" />
            <span className="text-sm font-medium">
              {stats.total > 0
                ? Math.round((stats.active / stats.total) * 100)
                : 0}
              %
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Liste des biens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{property.propertyName}</h3>
                    <Badge className={statusColors[property.status]}>
                      {property.status === 'active'
                        ? 'Actif'
                        : property.status === 'pending'
                        ? 'En attente'
                        : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{property.propertyAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="h-4 w-4" />
                  <span>{property.propertyType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Commission: {property.managementFee}%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Propriétaire</p>
                <p className="font-medium">{property.ownerName}</p>
                <p className="text-sm text-gray-600">{property.ownerEmail}</p>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-600"
                  onClick={() => handleRemoveProperty(property.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Retirer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun bien trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec votre recherche
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgencyProperties;
