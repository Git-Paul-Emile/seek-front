import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  UserPlus,
  Home,
  Phone,
  Mail,
  DollarSign,
  Search,
  Edit,
  ArrowRightLeft,
  AlertCircle,
  Building2,
  Bed,
  History,
  GraduationCap,
  Briefcase,
  Clock,
  MoreHorizontal,
  Eye,
  Plus,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { TenantHistoryDialog } from '@/components/dialogs/TenantHistoryDialog';
import {
  Tenant,
  Colocataire,
  Caution,
  TenantHistory,
  ColocataireHistory,
  mockTenants,
  mockColocataires,
  mockCautions,
  mockTenantHistory,
  mockColocataireHistory,
  tenantStatusLabels,
  colocataireStatusLabels,
  cautionStatusLabels,
  tenantSegmentLabels,
  TenantSegment,
} from '@/data/tenants';
import { mockProperties, mockRooms, Property, Room } from '@/data/properties';

const AgencyTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [colocataires, setColocataires] = useState<Colocataire[]>(mockColocataires);
  const [cautions, setCautions] = useState<Caution[]>(mockCautions);
  const [tenantHistory, setTenantHistory] = useState<TenantHistory[]>(mockTenantHistory);
  const [colocataireHistory, setColocataireHistory] = useState<ColocataireHistory[]>(mockColocataireHistory);
  const [properties] = useState<Property[]>(mockProperties);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);

  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [colocataireDialogOpen, setColocataireDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedColocataire, setSelectedColocataire] = useState<Colocataire | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  // Stats
  const activeTenants = tenants.filter((t) => t.status === "actif");
  const activeColocataires = colocataires.filter((c) => c.status === "actif");
  const totalMonthlyRent =
    activeTenants.reduce((sum, t) => sum + t.rentAmount, 0) +
    activeColocataires.reduce((sum, c) => sum + c.rentAmount, 0);
  const totalCautions = cautions
    .filter((c) => c.status === "versee")
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredTenants = tenants.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)
  );

  const filteredColocataires = colocataires.filter(
    (c) =>
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="LOCATAIRES & COLOCATAIRES"
        icon={Users}
        description="Gérez les locataires et colocataires de votre agence"
        action={
          <div className="flex gap-2">
            <Dialog open={tenantDialogOpen} onOpenChange={setTenantDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un locataire
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={colocataireDialogOpen} onOpenChange={setColocataireDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Ajouter un colocataire
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Occupants</h1>
      </PageHeader>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Locataires actifs</p>
                <p className="text-2xl font-bold mt-1">{activeTenants.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Colocataires actifs</p>
                <p className="text-2xl font-bold mt-1">{activeColocataires.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Home className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Loyer mensuel</p>
                <p className="text-2xl font-bold mt-1">{totalMonthlyRent.toLocaleString()} XOF</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total cautions</p>
                <p className="text-2xl font-bold mt-1">{totalCautions.toLocaleString()} XOF</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un locataire ou colocataire..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="sorti">Sorti</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les segments</SelectItem>
            <SelectItem value="etudiant">Étudiant</SelectItem>
            <SelectItem value="salarie">Salarié</SelectItem>
            <SelectItem value="court_terme">Court terme</SelectItem>
            <SelectItem value="stagiaire">Stagiaire</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Locataires ({tenants.length})
          </TabsTrigger>
          <TabsTrigger value="colocataires" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Colocataires ({colocataires.length})
          </TabsTrigger>
        </TabsList>

        {/* Locataires */}
        <TabsContent value="tenants">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {tenant.firstName[0]}{tenant.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {tenant.firstName} {tenant.lastName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={tenant.status === "actif" ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}
                        >
                          {tenantStatusLabels[tenant.status]}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{tenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{tenant.phone}</span>
                    </div>
                    {tenant.propertyName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{tenant.propertyName}</span>
                      </div>
                    )}
                    {tenant.roomName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="h-4 w-4" />
                        <span>{tenant.roomName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Loyer</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {tenant.rentAmount.toLocaleString()} XOF
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {tenant.segment === "etudiant" ? (
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                        ) : tenant.segment === "salarie" ? (
                          <Briefcase className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-500">Type</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {tenantSegmentLabels[tenant.segment]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedTenant(tenant);
                      setHistoryDialogOpen(true);
                    }}>
                      <History className="h-4 w-4 mr-1" />
                      Historique
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Colocataires */}
        <TabsContent value="colocataires">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColocataires.map((colocataire) => (
              <Card key={colocataire.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {colocataire.firstName[0]}{colocataire.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {colocataire.firstName} {colocataire.lastName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            colocataire.status === "actif"
                              ? "bg-green-500/10 text-green-500"
                              : colocataire.status === "sorti"
                              ? "bg-gray-500/10 text-gray-500"
                              : "bg-blue-500/10 text-blue-500"
                          }
                        >
                          {colocataireStatusLabels[colocataire.status]}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{colocataire.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{colocataire.phone}</span>
                    </div>
                    {colocataire.propertyName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{colocataire.propertyName}</span>
                      </div>
                    )}
                    {colocataire.roomName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Bed className="h-4 w-4" />
                        <span>{colocataire.roomName}</span>
                      </div>
                    )}
                    {colocataire.parentName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Responsable: {colocataire.parentName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Loyer</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {colocataire.rentAmount.toLocaleString()} XOF
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {colocataire.segment === "etudiant" ? (
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                        ) : colocataire.segment === "salarie" ? (
                          <Briefcase className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-500">Type</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {tenantSegmentLabels[colocataire.segment]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedColocataire(colocataire);
                      setHistoryDialogOpen(true);
                    }}>
                      <History className="h-4 w-4 mr-1" />
                      Historique
                    </Button>
                    {colocataire.status === "actif" && (
                      <Button variant="outline" size="sm">
                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                        Remplacer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message si vide */}
      {filteredTenants.length === 0 && filteredColocataires.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun occupant trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec votre recherche
            </p>
          </CardContent>
        </Card>
      )}

      {/* Historique Dialog */}
      <TenantHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        tenant={selectedTenant}
        colocataire={selectedColocataire}
        tenantHistory={tenantHistory}
        colocataireHistory={colocataireHistory}
      />
    </div>
  );
};

export default AgencyTenants;
