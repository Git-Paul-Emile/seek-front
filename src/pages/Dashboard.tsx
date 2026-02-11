import { useState } from "react";
import { mockProperties, Property } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCards from "@/components/dashboard/StatsCards";
import PropertiesTable from "@/components/dashboard/PropertiesTable";
import PropertyFormDialog, { PropertyFormData } from "@/components/dashboard/PropertyFormDialog";
import PageHeader from "@/components/layout/PageHeader";

const emptyForm: PropertyFormData = {
  title: "",
  type: "appartement",
  price: "",
  status: "à vendre",
  description: "",
  coverImage: "",
  images: [],
  bedrooms: "",
  bathrooms: "",
  area: "",
  city: "Douala",
  address: "",
  lat: "",
  lng: "",
  hospital: "",
  police: "",
  supermarket: "",
  school: "",
  virtualTourUrl: "",
  documents: [],
  rentalMode: undefined,
};

const Dashboard = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties.filter((p) => p.ownerId === "owner1"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

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
      description: p.description,
      coverImage: p.coverImage,
      images: p.images,
      bedrooms: String(p.bedrooms),
      bathrooms: String(p.bathrooms),
      area: String(p.area),
      city: p.location.city,
      address: p.location.address,
      lat: String(p.location.lat),
      lng: String(p.location.lng),
      hospital: String(p.proximity.hospital),
      police: String(p.proximity.police),
      supermarket: String(p.proximity.supermarket),
      school: String(p.proximity.school),
      virtualTourUrl: p.virtualTourUrl || "",
      documents: p.documents.map(d => ({ name: d.name, url: d.url, type: d.type })),
      rentalMode: p.rentalMode,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.price || !form.address) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires.", variant: "destructive" });
      return;
    }

    // Ensure images is always an array
    const imagesArray = Array.isArray(form.images) ? form.images : (typeof form.images === "string" ? JSON.parse(form.images || "[]") : []);

    // Ensure documents is properly formatted
    const docsArray = Array.isArray(form.documents) 
      ? form.documents.map((d, i) => ({
          id: `doc-${Date.now()}-${i}`,
          name: d.name,
          url: d.url,
          type: d.type as "contrat" | "acte" | "diagnostic" | "photo" | "autre",
          uploadedAt: new Date().toISOString()
        }))
      : [];

    const propertyData: Property = {
      id: editingId || `prop-${Date.now()}`,
      title: form.title,
      type: form.type,
      price: Number(form.price),
      status: form.status,
      rentalMode: form.rentalMode,
      description: form.description,
      coverImage: form.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      images: imagesArray.length > 0 ? imagesArray : [form.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
      location: {
        city: form.city,
        address: form.address,
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
      createdAt: editingId ? properties.find(p => p.id === editingId)?.createdAt || new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      virtualTourUrl: form.virtualTourUrl || undefined,
      documents: docsArray,
      rooms: editingId ? properties.find(p => p.id === editingId)?.rooms || [] : [],
    };

    if (editingId) {
      setProperties((prev) => prev.map((p) => (p.id === editingId ? propertyData : p)));
      toast({ title: "Modifié", description: "L'annonce a été mise à jour." });
    } else {
      setProperties((prev) => [propertyData, ...prev]);
      toast({ title: "Ajouté", description: "Votre annonce a été publiée." });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Supprimé", description: "L'annonce a été supprimée." });
  };

  const updateField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const filteredProperties = activeTab === "all"
    ? properties
    : properties.filter((p) => {
        if (activeTab === "vente") return p.status === "à vendre";
        if (activeTab === "location") return p.status === "loué";
        if (activeTab === "clos") return p.status === "vendu" || p.status === "loué";
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tableau de bord"
        icon={LayoutDashboard}
        description="Gérez vos biens immobiliers"
        action={
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter un bien
          </Button>
        }
      >
        Bienvenue, Jean
      </PageHeader>

      {/* Stats */}
      <StatsCards properties={properties} />

      {/* properties section */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Mes annonces</h2>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="vente">Vente</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="clos">Clos</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={activeTab} className="mt-0">
            <PropertiesTable
              properties={filteredProperties}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Dialog */}
      <PropertyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onFieldChange={updateField}
        onSave={handleSave}
        isEditing={!!editingId}
      />
    </div>
  );
};

export default Dashboard;
