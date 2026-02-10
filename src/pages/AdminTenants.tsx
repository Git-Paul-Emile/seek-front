import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { TenantDialog } from "@/components/dialogs/TenantDialog";
import { ColocataireDialog } from "@/components/dialogs/ColocataireDialog";
import {
  Tenant,
  Colocataire,
  Caution,
  mockTenants,
  mockColocataires,
  mockCautions,
  tenantStatusLabels,
  colocataireStatusLabels,
  cautionStatusLabels,
} from "@/data/tenants";
import { mockProperties, mockRooms, Property, Room } from "@/data/properties";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [colocataires, setColocataires] = useState<Colocataire[]>(mockColocataires);
  const [cautions, setCautions] = useState<Caution[]>(mockCautions);
  const [properties] = useState<Property[]>(mockProperties);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);

  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [colocataireDialogOpen, setColocataireDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [cautionDialogOpen, setCautionsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedColocataire, setSelectedColocataire] = useState<Colocataire | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const activeTenants = tenants.filter((t) => t.status === "actif");
  const activeColocataires = colocataires.filter((c) => c.status === "actif");
  const totalMonthlyRent =
    activeTenants.reduce((sum, t) => sum + t.rentAmount, 0) +
    activeColocataires.reduce((sum, c) => sum + c.rentAmount, 0);
  const totalCautions = cautions
    .filter((c) => c.status === "versee")
    .reduce((sum, c) => sum + c.amount, 0);

  const handleAddTenant = (tenantData: Partial<Tenant>) => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      ...tenantData,
      status: "en_attente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Tenant;
    setTenants([...tenants, newTenant]);
  };

  const handleEditTenant = (tenantData: Partial<Tenant>) => {
    if (selectedTenant) {
      setTenants(
        tenants.map((t) =>
          t.id === selectedTenant.id ? { ...t, ...tenantData, updatedAt: new Date().toISOString() } : t
        )
      );
      setSelectedTenant(null);
    }
  };

  const handleAddColocataire = (colocataireData: Partial<Colocataire>) => {
    const newColocataire: Colocataire = {
      id: `coloc-${Date.now()}`,
      ...colocataireData,
      status: "actif",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Colocataire;
    setColocataires([...colocataires, newColocataire]);

    // Update room status
    if (colocataireData.roomId) {
      setRooms(
        rooms.map((r) =>
          r.id === colocataireData.roomId ? { ...r, status: "occupée" as const } : r
        )
      );
    }
  };

  const handleEditColocataire = (colocataireData: Partial<Colocataire>) => {
    if (selectedColocataire) {
      setColocataires(
        colocataires.map((c) =>
          c.id === selectedColocataire.id
            ? { ...c, ...colocataireData, updatedAt: new Date().toISOString() }
            : c
        )
      );
      setSelectedColocataire(null);
    }
  };

  const handleExitTenant = (tenantId: string) => {
    setTenants(
      tenants.map((t) =>
        t.id === tenantId
          ? {
              ...t,
              status: "sorti" as const,
              exitDate: new Date().toISOString().split("T")[0],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    setExitDialogOpen(false);
    setSelectedTenant(null);
  };

  const handleExitColocataire = (colocataireId: string, replacementId?: string) => {
    setColocataires(
      colocataires.map((c) =>
        c.id === colocataireId
          ? {
              ...c,
              status: replacementId ? "remplace" as const : "sorti" as const,
              exitDate: new Date().toISOString().split("T")[0],
              replacedById: replacementId,
              replacementDate: replacementId ? new Date().toISOString().split("T")[0] : undefined,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Free up the room
    const colocataire = colocataires.find((c) => c.id === colocataireId);
    if (colocataire && !replacementId) {
      setRooms(
        rooms.map((r) =>
          r.id === colocataire.roomId ? { ...r, status: "libre" as const } : r
        )
      );
    }

    setExitDialogOpen(false);
    setSelectedColocataire(null);
  };

  const handleReplaceColocataire = (oldId: string, newColocataire: Colocataire) => {
    handleExitColocataire(oldId, newColocataire.id);
    handleAddColocataire(newColocataire);
  };

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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider font-body">
              Gestion des occupants
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Locataires & Colocataires
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos locataires et colocataires
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeTenants.length}</div>
            <p className="text-xs text-muted-foreground">Locataires actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeColocataires.length}</div>
            <p className="text-xs text-muted-foreground">Colocataires actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {totalMonthlyRent.toLocaleString()} CFA
            </div>
            <p className="text-xs text-muted-foreground">Loyer mensuel total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {totalCautions.toLocaleString()} CFA
            </div>
            <p className="text-xs text-muted-foreground">Total cautions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
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
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="sorti">Sorti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Tenants and Colocataires */}
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
          <TabsTrigger value="cautions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cautions ({cautions.length})
          </TabsTrigger>
        </TabsList>

        {/* Tenants Tab */}
        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des locataires</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedTenant(null);
                    setTenantDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un locataire
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Locataire
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Contact
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Bien / Chambre
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Loyer
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Statut
                      </th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                              {tenant.firstName[0]}
                              {tenant.lastName[0]}
                            </div>
                            <div>
                              <span className="font-medium">
                                {tenant.firstName} {tenant.lastName}
                              </span>
                              {tenant.guarantorName && (
                                <p className="text-xs text-muted-foreground">
                                  Garant: {tenant.guarantorName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {tenant.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {tenant.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {tenant.propertyName || "Non assigné"}
                            </div>
                            {tenant.roomName && (
                              <div className="flex items-center gap-2 text-sm">
                                <Bed className="h-3 w-3 text-muted-foreground" />
                                {tenant.roomName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {tenant.rentAmount.toLocaleString()} CFA/mois
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Échéance: {tenant.rentDueDay} du mois
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              tenant.status === "actif"
                                ? "bg-green-500/10 text-green-500"
                                : tenant.status === "sorti"
                                ? "bg-gray-500/10 text-gray-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }
                          >
                            {tenantStatusLabels[tenant.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setTenantDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {tenant.status === "actif" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setExitDialogOpen(true);
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colocataires Tab */}
        <TabsContent value="colocataires">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des colocataires</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedColocataire(null);
                    setColocataireDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un colocataire
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Colocataire
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Contact
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Chambre
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Loyer
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Statut
                      </th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColocataires.map((colocataire) => (
                      <tr key={colocataire.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                              {colocataire.firstName[0]}
                              {colocataire.lastName[0]}
                            </div>
                            <div>
                              <span className="font-medium">
                                {colocataire.firstName} {colocataire.lastName}
                              </span>
                              {colocataire.parentName && (
                                <p className="text-xs text-muted-foreground">
                                  Responsable: {colocataire.parentName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {colocataire.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {colocataire.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              {colocataire.propertyName}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Bed className="h-3 w-3 text-muted-foreground" />
                              {colocataire.roomName}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <div className="font-medium">
                            {colocataire.rentAmount.toLocaleString()} CFA/mois
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              colocataire.status === "actif"
                                ? "bg-green-500/10 text-green-500"
                                : colocataire.status === "sorti"
                                ? "bg-gray-500/10 text-gray-500"
                                : colocataire.status === "remplace"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }
                          >
                            {colocataireStatusLabels[colocataire.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedColocataire(colocataire);
                                setColocataireDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {colocataire.status === "actif" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedColocataire(colocataire);
                                  setExitDialogOpen(true);
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cautions Tab */}
        <TabsContent value="cautions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des cautions</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedTenant(null);
                    setCautionsDialogOpen(true);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Nouvelle caution
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Locataire
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Montant
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date de versement
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Statut
                      </th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date de restitution
                      </th>
                      <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cautions.map((caution) => {
                      const tenant = tenants.find((t) => t.id === caution.tenantId);
                      const colocataire = colocataires.find(
                        (c) => c.id === caution.colocataireId
                      );
                      const person = tenant || colocataire;

                      return (
                        <tr key={caution.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <span className="font-medium">
                              {tenant
                                ? `${tenant.firstName} ${tenant.lastName}`
                                : colocataire
                                ? `${colocataire.firstName} ${colocataire.lastName}`
                                : "Inconnu"}
                            </span>
                          </td>
                          <td className="p-4 font-medium">
                            {caution.amount.toLocaleString()} CFA
                          </td>
                          <td className="p-4">
                            {new Date(caution.paymentDate).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={
                                caution.status === "versee"
                                  ? "bg-green-500/10 text-green-500"
                                  : caution.status === "restituee"
                                  ? "bg-gray-500/10 text-gray-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {cautionStatusLabels[caution.status]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {caution.restitutionDate
                              ? new Date(caution.restitutionDate).toLocaleDateString("fr-FR")
                              : "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {caution.status === "versee" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCautions(
                                      cautions.map((c) =>
                                        c.id === caution.id
                                          ? {
                                              ...c,
                                              status: "restituee" as const,
                                              restitutionDate: new Date()
                                                .toISOString()
                                                .split("T")[0],
                                              restitutionAmount: c.amount,
                                              updatedAt: new Date().toISOString(),
                                            }
                                          : c
                                      )
                                    );
                                  }}
                                >
                                  Restituer
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tenant Dialog */}
      <TenantDialog
        open={tenantDialogOpen}
        onOpenChange={setTenantDialogOpen}
        tenant={selectedTenant || undefined}
        properties={properties}
        onSave={selectedTenant ? handleEditTenant : handleAddTenant}
      />

      {/* Colocataire Dialog */}
      <ColocataireDialog
        open={colocataireDialogOpen}
        onOpenChange={setColocataireDialogOpen}
        colocataire={selectedColocataire || undefined}
        properties={properties}
        rooms={rooms}
        onSave={selectedColocataire ? handleEditColocataire : handleAddColocataire}
      />

      {/* Exit Dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sortir un occupant</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir marquer cet occupant comme sorti ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTenant && (
              <div className="space-y-4">
                <p>
                  <strong>Locataire :</strong> {selectedTenant.firstName}{" "}
                  {selectedTenant.lastName}
                </p>
                <Label htmlFor="exitDate">Date de sortie</Label>
                <Input
                  id="exitDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
                <Label htmlFor="exitReason">Motif de sortie</Label>
                <textarea
                  id="exitReason"
                  className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background"
                  placeholder="Raison du départ..."
                />
              </div>
            )}
            {selectedColocataire && (
              <div className="space-y-4">
                <p>
                  <strong>Colocataire :</strong> {selectedColocataire.firstName}{" "}
                  {selectedColocataire.lastName}
                </p>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    Voulez-vous ajouter un remplaçant pour cette chambre ?
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setExitDialogOpen(false);
                    setColocataireDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un remplaçant
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTenant) {
                  handleExitTenant(selectedTenant.id);
                } else if (selectedColocataire) {
                  handleExitColocataire(selectedColocataire.id);
                }
              }}
            >
              Confirmer la sortie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Caution Dialog */}
      <Dialog open={cautionDialogOpen} onOpenChange={setCautionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle caution</DialogTitle>
            <DialogDescription>
              Enregistrer une nouvelle caution
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cautionTenant">Locataire / Colocataire</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un occupant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={`tenant-${t.id}`}>
                      {t.firstName} {t.lastName} (Locataire)
                    </SelectItem>
                  ))}
                  {colocataires
                    .filter((c) => c.status === "actif")
                    .map((c) => (
                      <SelectItem key={c.id} value={`coloc-${c.id}`}>
                        {c.firstName} {c.lastName} (Colocataire)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cautionAmount">Montant de la caution (FCFA)</Label>
              <Input id="cautionAmount" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cautionPaymentDate">Date de versement</Label>
              <Input id="cautionPaymentDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cautionNotes">Notes</Label>
              <textarea
                id="cautionNotes"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background"
                placeholder="Notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCautionsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                setCautionsDialogOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTenants;
