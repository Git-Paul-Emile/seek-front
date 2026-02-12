import React, { useEffect, useState } from 'react';
import { agencyService } from '@/services/agency-auth.service';
import type { AgencyOwner } from '@/types/agency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Mail,
  Phone,
  Building2,
  DollarSign,
  MoreHorizontal,
  Eye,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const AgencyOwners: React.FC = () => {
  const { toast } = useToast();
  const [owners, setOwners] = useState<AgencyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const data = await agencyService.getOwners();
        setOwners(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des propriétaires:', error);
        // Données mock pour le développement
        setOwners([
          {
            id: '1',
            agencyId: '1',
            ownerId: 'o1',
            ownerName: 'Seydou Diop',
            ownerEmail: 'seydou.diop@email.com',
            ownerPhone: '+221 77 123 45 67',
            propertiesCount: 3,
            totalRevenue: 1500000,
            isActive: true,
            addedAt: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            agencyId: '1',
            ownerId: 'o2',
            ownerName: 'Fatou Seck',
            ownerEmail: 'fatou.seck@email.com',
            ownerPhone: '+221 77 234 56 78',
            propertiesCount: 2,
            totalRevenue: 980000,
            isActive: true,
            addedAt: '2024-02-01T09:00:00Z',
          },
          {
            id: '3',
            agencyId: '1',
            ownerId: 'o3',
            ownerName: 'Mamadou Faye',
            ownerEmail: 'mamadou.faye@email.com',
            propertiesCount: 1,
            totalRevenue: 450000,
            isActive: true,
            addedAt: '2024-02-10T14:30:00Z',
          },
          {
            id: '4',
            agencyId: '1',
            ownerId: 'o4',
            ownerName: 'Astou Ndiaye',
            ownerEmail: 'astou.ndiaye@email.com',
            ownerPhone: '+221 77 456 78 90',
            propertiesCount: 4,
            totalRevenue: 2100000,
            isActive: false,
            addedAt: '2024-02-05T11:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const filteredOwners = owners.filter(
    (owner) =>
      owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOwner = async () => {
    if (!ownerEmail) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un email',
        variant: 'destructive',
      });
      return;
    }

    try {
      await agencyService.addOwner(ownerEmail);
      toast({
        title: 'Propriétaire ajouté',
        description: 'Le propriétaire a été ajouté avec succès',
      });
      setIsAddDialogOpen(false);
      setOwnerEmail('');
      // Recharger la liste
      const data = await agencyService.getOwners();
      setOwners(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveOwner = async (ownerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce propriétaire ?')) return;

    try {
      await agencyService.removeOwner(ownerId);
      setOwners(owners.filter((o) => o.id !== ownerId));
      toast({
        title: 'Propriétaire retiré',
        description: 'Le propriétaire a été retiré avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="PROPRIÉTAIRES"
        icon={Users}
        description="Gérez les propriétaires confiés à votre agence"
        action={
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un propriétaire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un propriétaire</DialogTitle>
                <DialogDescription>
                  Entrez l'email du propriétaire à ajouter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-email">Email du propriétaire</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    placeholder="proprietaire@exemple.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddOwner}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Propriétaires</h1>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Propriétaires</p>
                <p className="text-2xl font-bold mt-1">{owners.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Biens gérés</p>
                <p className="text-2xl font-bold mt-1">
                  {owners.reduce((sum, o) => sum + o.propertiesCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus totaux</p>
                <p className="text-2xl font-bold mt-1">
                  {owners
                    .reduce((sum, o) => sum + o.totalRevenue, 0)
                    .toLocaleString()}{' '}
                  XOF
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un propriétaire..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary">
          {filteredOwners.length} propriétaire(s)
        </Badge>
      </div>

      {/* Liste des propriétaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => (
          <Card key={owner.id} className={!owner.isActive ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {owner.ownerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{owner.ownerName}</h3>
                    {!owner.isActive && (
                      <Badge variant="destructive">Inactif</Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{owner.ownerEmail}</span>
                </div>
                {owner.ownerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{owner.ownerPhone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Biens</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">{owner.propertiesCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Revenus</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {(owner.totalRevenue / 1000).toFixed(0)}k XOF
                  </p>
                </div>
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
                  onClick={() => handleRemoveOwner(owner.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Retirer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun propriétaire trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec votre recherche
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgencyOwners;
