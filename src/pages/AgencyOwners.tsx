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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Archive,
  FileText,
  Calendar,
  Percent,
  Edit,
  Send,
  Check,
  X,
  Building,
  MapPin,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const AgencyOwners: React.FC = () => {
  const { toast } = useToast();
  const [owners, setOwners] = useState<AgencyOwner[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isMandateDialogOpen, setIsMandateDialogOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<AgencyOwner | null>(null);
  
  // Formulaire d'invitation
  const [ownerEmail, setOwnerEmail] = useState('');
  
  // Formulaire de création de compte
  const [newOwner, setNewOwner] = useState({
    fullName: '',
    email: '',
    phone: '',
    ownerType: 'PARTICULAR' as 'PARTICULAR' | 'COMPANY',
    companyName: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ownersData, propertiesData, mandatesData] = await Promise.all([
        agencyService.getOwners(),
        agencyService.getProperties(),
        agencyService.getMandates(),
      ]);
      setOwners(ownersData);
      setProperties(propertiesData);
      setMandates(mandatesData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
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
      setProperties([
        {
          id: 'p1',
          agencyId: '1',
          propertyId: 'prop1',
          propertyName: 'Villa Mermoz',
          propertyAddress: 'Rue 10, Mermoz',
          propertyType: 'HOUSE',
          ownerName: 'Seydou Diop',
          ownerEmail: 'seydou.diop@email.com',
          managementFee: 8,
          status: 'active',
          addedAt: '2024-01-15',
        },
        {
          id: 'p2',
          agencyId: '1',
          propertyId: 'prop2',
          propertyName: 'Appartement Point E',
          propertyAddress: 'Immeuble ABC, Point E',
          propertyType: 'APARTMENT',
          ownerName: 'Seydou Diop',
          ownerEmail: 'seydou.diop@email.com',
          managementFee: 10,
          status: 'active',
          addedAt: '2024-01-20',
        },
      ]);
      setMandates([
        {
          id: 'm1',
          agencyId: '1',
          ownerId: 'o1',
          ownerName: 'Seydou Diop',
          propertyId: 'prop1',
          propertyName: 'Villa Mermoz',
          type: 'GESTION_COMPLETE',
          startDate: '2024-01-15',
          endDate: '2025-01-15',
          managementFeePercent: 8,
          isActive: true,
          createdAt: '2024-01-15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = owners.filter(
    (owner) =>
      owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inviter un propriétaire existant
  const handleInviteOwner = async () => {
    if (!ownerEmail) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un email',
        variant: 'destructive',
      });
      return;
    }

    try {
      await agencyService.inviteOwner({ email: ownerEmail });
      toast({
        title: 'Invitation envoyée',
        description: `Une invitation a été envoyée à ${ownerEmail}`,
      });
      setIsAddDialogOpen(false);
      setOwnerEmail('');
      fetchData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'invitation",
        variant: 'destructive',
      });
    }
  };

  // Créer un nouveau compte propriétaire
  const handleCreateOwner = async () => {
    if (!newOwner.fullName || !newOwner.email || !newOwner.phone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      await agencyService.createOwnerAccount(newOwner);
      toast({
        title: 'Compte créé',
        description: 'Le compte propriétaire a été créé avec succès',
      });
      setIsCreateDialogOpen(false);
      setNewOwner({
        fullName: '',
        email: '',
        phone: '',
        ownerType: 'PARTICULAR',
        companyName: '',
        address: '',
        city: '',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  // Archiver/désactiver un propriétaire
  const handleToggleOwnerStatus = async (ownerId: string) => {
    const owner = owners.find(o => o.id === ownerId);
    if (!owner) return;

    const action = owner.isActive ? 'désactiver' : 'activer';
    if (!confirm(`Êtes-vous sûr de vouloir ${action} ce propriétaire ?`)) return;

    try {
      if (owner.isActive) {
        await agencyService.archiveOwner(ownerId);
      } else {
        await agencyService.activateOwner(ownerId);
      }
      
      setOwners(owners.map(o => 
        o.id === ownerId ? { ...o, isActive: !o.isActive } : o
      ));
      
      toast({
        title: owner.isActive ? 'Propriétaire archivé' : 'Propriétaire réactivé',
        description: `Le propriétaire a été ${action} avec succès`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  // Ouvrir les détails d'un propriétaire
  const handleViewDetails = (owner: AgencyOwner) => {
    setSelectedOwner(owner);
    setIsDetailsDialogOpen(true);
  };

  // Obtenir les propriétés d'un propriétaire
  const getOwnerProperties = (ownerEmail: string) => {
    return properties.filter(p => p.ownerEmail === ownerEmail);
  };

  // Obtenir les mandats d'un propriétaire
  const getOwnerMandates = (ownerId: string) => {
    return mandates.filter(m => m.ownerId === ownerId);
  };

  // Gérer le mandat de gestion
  const handleManageMandate = (owner: AgencyOwner) => {
    setSelectedOwner(owner);
    setIsMandateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="PROPRIÉTAIRES"
        icon={Users}
        description="Gérez les propriétaires confiés à votre agence"
        action={
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un propriétaire</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation à un propriétaire existant pour rejoindre votre agence
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
                  <Button onClick={handleInviteOwner}>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Créer un compte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un compte propriétaire</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte propriétaire et liez-le à votre agence
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet *</Label>
                      <Input
                        id="fullName"
                        placeholder="Seydou Diop"
                        value={newOwner.fullName}
                        onChange={(e) => setNewOwner({ ...newOwner, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerType">Type</Label>
                      <Select
                        value={newOwner.ownerType}
                        onValueChange={(value: 'PARTICULAR' | 'COMPANY') => 
                          setNewOwner({ ...newOwner, ownerType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PARTICULAR">Particulier</SelectItem>
                          <SelectItem value="COMPANY">Entreprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {newOwner.ownerType === 'COMPANY' && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Raison sociale</Label>
                      <Input
                        id="companyName"
                        placeholder="Nom de l'entreprise"
                        value={newOwner.companyName}
                        onChange={(e) => setNewOwner({ ...newOwner, companyName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="proprietaire@exemple.com"
                      value={newOwner.email}
                      onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      placeholder="+221 77 123 45 67"
                      value={newOwner.phone}
                      onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        placeholder="Adresse"
                        value={newOwner.address}
                        onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Dakar"
                        value={newOwner.city}
                        onChange={(e) => setNewOwner({ ...newOwner, city: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateOwner}>
                    <Check className="mr-2 h-4 w-4" />
                    Créer le compte
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Propriétaires</h1>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Propriétaires</p>
                <p className="text-2xl font-bold mt-1">{owners.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Actifs</p>
                <p className="text-2xl font-bold mt-1">{owners.filter(o => o.isActive).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
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
              <div className="p-3 bg-purple-100 rounded-full">
                <Building className="h-6 w-6 text-purple-600" />
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
                  {(owners.reduce((sum, o) => sum + o.totalRevenue, 0) / 1000).toFixed(0)}k XOF
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
                    <Building className="h-4 w-4 text-gray-500" />
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

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(owner)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleManageMandate(owner)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Mandat
                </Button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant={owner.isActive ? "outline" : "default"}
                  size="sm"
                  className={owner.isActive ? "text-orange-500 hover:text-orange-600" : ""}
                  onClick={() => handleToggleOwnerStatus(owner.id)}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  {owner.isActive ? 'Archiver' : 'Réactiver'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun propriétaire trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec votre recherche
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog des détails du propriétaire */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du propriétaire</DialogTitle>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-6">
              {/* Informations du propriétaire */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {selectedOwner.ownerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedOwner.ownerName}</h3>
                  <p className="text-gray-500">{selectedOwner.ownerEmail}</p>
                  {selectedOwner.ownerPhone && (
                    <p className="text-gray-500">{selectedOwner.ownerPhone}</p>
                  )}
                </div>
                <Badge variant={selectedOwner.isActive ? 'default' : 'destructive'} className="ml-auto">
                  {selectedOwner.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <Tabs defaultValue="properties">
                <TabsList>
                  <TabsTrigger value="properties">
                    <Building className="h-4 w-4 mr-2" />
                    Biens ({getOwnerProperties(selectedOwner.ownerEmail).length})
                  </TabsTrigger>
                  <TabsTrigger value="mandates">
                    <FileText className="h-4 w-4 mr-2" />
                    Mandats ({getOwnerMandates(selectedOwner.ownerId).length})
                  </TabsTrigger>
                  <TabsTrigger value="financial">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financiers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="mt-4">
                  <div className="space-y-4">
                    {getOwnerProperties(selectedOwner.ownerEmail).length > 0 ? (
                      getOwnerProperties(selectedOwner.ownerEmail).map((property) => (
                        <Card key={property.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{property.propertyName}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {property.propertyAddress}
                                </p>
                                <Badge variant="outline" className="mt-2">
                                  {property.propertyType}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Commission</p>
                                <p className="font-semibold">{property.managementFee}%</p>
                                <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                                  {property.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Aucun bien enregistré pour ce propriétaire
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="mandates" className="mt-4">
                  <div className="space-y-4">
                    {getOwnerMandates(selectedOwner.ownerId).length > 0 ? (
                      getOwnerMandates(selectedOwner.ownerId).map((mandate) => (
                        <Card key={mandate.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{mandate.propertyName}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Type: {mandate.type === 'GESTION_COMPLETE' ? 'Gestion complète' : 'Gestion locative'}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Début: {mandate.startDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Fin: {mandate.endDate}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Honoraires</p>
                                <p className="font-semibold flex items-center gap-1">
                                  <Percent className="h-4 w-4" />
                                  {mandate.managementFeePercent}%
                                </p>
                                <Badge variant={mandate.isActive ? 'default' : 'secondary'}>
                                  {mandate.isActive ? 'Actif' : 'Expiré'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Aucun mandat de gestion pour ce propriétaire
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-500">Revenus totaux générés</p>
                        <p className="text-2xl font-bold mt-1">
                          {selectedOwner.totalRevenue.toLocaleString()} XOF
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-500">Commission de l'agence</p>
                        <p className="text-2xl font-bold mt-1">
                          {(selectedOwner.totalRevenue * 0.08).toLocaleString()} XOF
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des mandats */}
      <Dialog open={isMandateDialogOpen} onOpenChange={setIsMandateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des mandats</DialogTitle>
            <DialogDescription>
              Gérez les mandats de gestion pour {selectedOwner?.ownerName}
            </DialogDescription>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Créer un nouveau mandat</h4>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Type de mandat</Label>
                    <Select defaultValue="GESTION_COMPLETE">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GESTION_COMPLETE">Gestion complète</SelectItem>
                        <SelectItem value="GESTION_LOCATIVE">Gestion locative simple</SelectItem>
                        <SelectItem value="TRANSACTION">Transaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Honoraires (%)</Label>
                    <Input type="number" placeholder="8" defaultValue={8} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input type="date" />
                  </div>
                </div>
                <Button className="mt-4 w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le mandat
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Mandats existants</h4>
                {getOwnerMandates(selectedOwner.ownerId).length > 0 ? (
                  getOwnerMandates(selectedOwner.ownerId).map((mandate) => (
                    <Card key={mandate.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{mandate.propertyName}</h5>
                            <p className="text-sm text-gray-500">
                              {mandate.type === 'GESTION_COMPLETE' ? 'Gestion complète' : mandate.type}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {mandate.startDate} - {mandate.endDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{mandate.managementFeePercent}%</Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Aucun mandat existant
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgencyOwners;
