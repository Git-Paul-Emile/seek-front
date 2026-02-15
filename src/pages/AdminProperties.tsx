import { useState } from "react";
import { mockProperties, Property, Room, statusLabels, EquipmentType } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Archive, DoorOpen, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PropertiesTable from "@/components/dashboard/PropertiesTable";
import PropertyFormDialog, { PropertyFormData } from "@/components/dashboard/PropertyFormDialog";
import RoomDialog, { RoomFormData } from "@/components/dashboard/RoomDialog";
import RoomsList from "@/components/dashboard/RoomsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PageHeader from "@/components/layout/PageHeader";

const emptyForm: PropertyFormData = {
  title: "",
  type: "appartement",
  price: "",
  status: "libre",
  rentalMode: undefined,
  description: "",
  coverImage: "",
  images: [],
  bedrooms: "",
  bathrooms: "",
  area: "",
  city: "Dakar",
  address: "",
  neighborhood: "",
  lat: "",
  lng: "",
  hospital: "",
  police: "",
  supermarket: "",
  school: "",
};

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>(
    mockProperties.filter((p) => p.ownerId === "owner1" && !p.archived)
  );
  const [archivedProperties, setArchivedProperties] = useState<Property[]>(
    mockProperties.filter((p) => p.ownerId === "owner1" && p.archived)
  );
  
  // Property dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  
  // Room dialog
  const [roomsDialogOpen, setRoomsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Property functions
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      type: p.type,
      price: String(p.price),
      status: p.status,
      rentalMode: p.rentalMode,
      description: p.description,
      coverImage: p.coverImage,
      images: p.images,
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      area: String(p.area),
      city: p.location.city,
      address: p.location.address,
      neighborhood: p.location.neighborhood,
      lat: String(p.location.lat),
      lng: String(p.location.lng),
      hospital: String(p.proximity.hospital),
      police: String(p.proximity.police),
      supermarket: String(p.proximity.supermarket),
      school: String(p.proximity.school),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.price || !form.address) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires (titre, prix, adresse).",
        variant: "destructive"
      });
      return;
    }

    const imagesArray = Array.isArray(form.images) ? form.images : JSON.parse(form.images || "[]");

    const propertyData: Property = {
      id: editingId || `prop-${Date.now()}`,
      title: form.title,
      type: form.type,
      price: Number(form.price),
      status: form.status,
      rentalMode: form.rentalMode,
      description: form.description,
      coverImage: form.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      images: imagesArray.length > 0 
        ? imagesArray 
        : [form.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      location: {
        city: form.city,
        address: form.address,
        neighborhood: form.neighborhood,
        lat: Number(form.lat) || 4.05,
        lng: Number(form.lng) || 9.7,
      },
      proximity: {
        hospital: Number(form.hospital) || 0,
        police: Number(form.police) || 0,
        supermarket: Number(form.supermarket) || 0,
        school: Number(form.school) || 0,
      },
      featured: false,
      archived: false,
      ownerId: "owner1",
      ownerName: "Jean Dupont",
      ownerPhone: "+237 6 90 12 34 56",
      ownerEmail: "jean.dupont@email.com",
      createdAt: editingId 
        ? properties.find(p => p.id === editingId)?.createdAt || new Date().toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      documents: [],
      rooms: editingId ? properties.find(p => p.id === editingId)?.rooms || [] : [],
    };

    if (editingId) {
      setProperties((prev) => prev.map((p) => (p.id === editingId ? propertyData : p)));
      toast({ title: "Modifié", description: "Le bien a été mis à jour." });
    } else {
      setProperties((prev) => [propertyData, ...prev]);
      toast({ title: "Ajouté", description: "Le bien a été ajouté à votre portfolio." });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce bien ?")) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Supprimé", description: "Le bien a été définitivement supprimé." });
    }
  };

  const handleArchive = (id: string) => {
    const propertyToArchive = properties.find((p) => p.id === id);
    if (propertyToArchive) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setArchivedProperties((prev) => [...prev, { ...propertyToArchive, archived: true }]);
      toast({ title: "Archivé", description: "Le bien a été archivé." });
    }
  };

  const handleUnarchive = (id: string) => {
    const propertyToUnarchive = archivedProperties.find((p) => p.id === id);
    if (propertyToUnarchive) {
      setArchivedProperties((prev) => prev.filter((p) => p.id !== id));
      setProperties((prev) => [...prev, { ...propertyToUnarchive, archived: false }]);
      toast({ title: "Désarchivé", description: "Le bien est de nouveau visible." });
    }
  };

  // Room functions
  const openRooms = (property: Property) => {
    setSelectedProperty(property);
    setRoomsDialogOpen(true);
  };

  const openRoomEdit = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomDialogOpen(true);
  };

  const handleRoomSave = (roomForm: RoomFormData) => {
    if (!selectedProperty) return;

    const roomData: Room = {
      id: editingRoomId || `room-${Date.now()}`,
      propertyId: selectedProperty.id,
      name: roomForm.name,
      description: roomForm.description,
      price: Number(roomForm.price),
      status: roomForm.status,
      area: Number(roomForm.area) || 0,
      equipment: roomForm.equipment as EquipmentType[],
      images: [],
      history: editingRoomId 
        ? selectedProperty.rooms?.find(r => r.id === editingRoomId)?.history || []
        : [],
      createdAt: editingRoomId 
        ? selectedProperty.rooms?.find(r => r.id === editingRoomId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      disabled: false,
    };

    const updatedRooms = editingRoomId
      ? (selectedProperty.rooms || []).map((r) => (r.id === editingRoomId ? roomData : r))
      : [...(selectedProperty.rooms || []), roomData];

    const updatedProperty = { ...selectedProperty, rooms: updatedRooms, updatedAt: new Date().toISOString() };

    setProperties((prev) => prev.map((p) => (p.id === selectedProperty.id ? updatedProperty : p)));
    setSelectedProperty(updatedProperty);
    setRoomDialogOpen(false);
    setEditingRoomId(null);
    
    toast({ 
      title: editingRoomId ? "Chambre modifiée" : "Chambre ajoutée", 
      description: `${roomData.name} a été ${editingRoomId ? "mise à jour" : "ajoutée"}.` 
    });
  };

  const handleRoomDelete = (roomId: string) => {
    if (!selectedProperty) return;
    
    if (confirm("Êtes-vous sûr de vouloir supprimer cette chambre ?")) {
      const updatedRooms = (selectedProperty.rooms || []).filter((r) => r.id !== roomId);
      const updatedProperty = { ...selectedProperty, rooms: updatedRooms };
      
      setProperties((prev) => prev.map((p) => (p.id === selectedProperty.id ? updatedProperty : p)));
      setSelectedProperty(updatedProperty);
      
      toast({ title: "Chambre supprimée", description: "La chambre a été supprimée." });
    }
  };

  const handleRoomToggleStatus = (roomId: string) => {
    if (!selectedProperty) return;
    
    const updatedRooms = (selectedProperty.rooms || []).map((r) => 
      r.id === roomId ? { ...r, disabled: !r.disabled } : r
    );
    const updatedProperty = { ...selectedProperty, rooms: updatedRooms };
    
    setProperties((prev) => prev.map((p) => (p.id === selectedProperty.id ? updatedProperty : p)));
    setSelectedProperty(updatedProperty);
    
    toast({ 
      title: updatedRooms.find(r => r.id === roomId)?.disabled ? "Chambre désactivée" : "Chambre activée",
      description: "Le statut de la chambre a été mis à jour."
    });
  };

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const getFilteredProperties = (tab: string) => {
    if (tab === "archived") return archivedProperties;
    
    return properties.filter((p) => {
      switch (tab) {
        case "libre":
          return p.status === "libre";
        case "loue":
          return p.status === "loué";
        case "colocation":
          return p.rentalMode === "colocation";
        case "maintenance":
          return p.status === "en maintenance";
        case "partiel":
          return p.status === "partiellement loué";
        default:
          return true;
      }
    });
  };

  const stats = {
    total: properties.length,
    libre: properties.filter(p => p.status === "libre").length,
    loue: properties.filter(p => p.status === "loué").length,
    colocation: properties.filter(p => p.rentalMode === "colocation").length,
    maintenance: properties.filter(p => p.status === "en maintenance").length,
  };

  const currentRoom = editingRoomId && selectedProperty 
    ? selectedProperty.rooms?.find(r => r.id === editingRoomId) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      
      <PageHeader
        title="Mes biens"
        icon={Building2}
        description="Gérez et suivez toutes vos annonces"
        action={
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter un bien
          </Button>
        }
      >
        Mes biens immobiliers
      </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700">Libres</p>
            <p className="text-2xl font-bold text-green-700">{stats.libre}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Loués</p>
            <p className="text-2xl font-bold text-blue-700">{stats.loue}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700">Colocation</p>
            <p className="text-2xl font-bold text-purple-700">{stats.colocation}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700">Maintenance</p>
            <p className="text-2xl font-bold text-orange-700">{stats.maintenance}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Annonces</h2>
            <TabsList>
              <TabsTrigger value="all">Tous ({properties.length})</TabsTrigger>
              <TabsTrigger value="libre">Libres ({stats.libre})</TabsTrigger>
              <TabsTrigger value="loue">Loués ({stats.loue})</TabsTrigger>
              <TabsTrigger value="colocation">Colocation ({stats.colocation})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({stats.maintenance})</TabsTrigger>
              <TabsTrigger value="archived">
                <Archive className="w-3 h-3 mr-1" /> Archivés ({archivedProperties.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {activeTab === "archived" ? (
              archivedProperties.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Ces biens sont archivés et ne sont plus visibles par les locataires.
                  </p>
                  <PropertiesTable
                    properties={archivedProperties}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onArchive={handleUnarchive}
                    showArchive={true}
                    onViewRooms={undefined}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun bien archivé</p>
                </div>
              )
            ) : (
              <PropertiesTable
                properties={getFilteredProperties(activeTab)}
                onEdit={openEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                showArchive={true}
                onViewRooms={openRooms}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Property Form Dialog */}
        <PropertyFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          form={form}
          onFieldChange={updateField}
          onSave={handleSave}
          isEditing={!!editingId}
        />

        {/* Rooms Management Dialog */}
        <Dialog open={roomsDialogOpen} onOpenChange={setRoomsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProperty.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedProperty.location.city} - {selectedProperty.location.address}
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingRoomId(null);
                      setRoomDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Ajouter une chambre
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DoorOpen className="w-4 h-4" />
                    Chambres ({selectedProperty.rooms?.length || 0})
                  </h3>
                  <RoomsList
                    rooms={selectedProperty.rooms || []}
                    onEdit={openRoomEdit}
                    onDelete={handleRoomDelete}
                    onToggleStatus={handleRoomToggleStatus}
                  />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Room Form Dialog */}
        <RoomDialog
          open={roomDialogOpen}
          onOpenChange={setRoomDialogOpen}
          room={currentRoom}
          onSave={handleRoomSave}
          isEditing={!!editingRoomId}
        />
      </div>
    );
};

export default AdminProperties;
