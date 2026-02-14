import { Property, propertyTypes, propertyStatuses, rentalModes, typeLabels, statusLabels, rentalModeLabels, cities } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, X, Plus, FileText } from "lucide-react";
import { useState } from "react";

export interface PropertyFormData {
  title: string;
  type: Property["type"];
  price: string;
  status: Property["status"];
  rentalMode: Property["rentalMode"];
  description: string;
  coverImage: string;
  images: string | string[];
  bedrooms: string;
  bathrooms: string;
  area: string;
  city: string;
  address: string;
  neighborhood: string;
  lat: string;
  lng: string;
  hospital: string;
  police: string;
  supermarket: string;
  school: string;
  virtualTourUrl: string;
  documents: string | { name: string; url: string; type: string }[];
}

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PropertyFormData;
  onFieldChange: (key: string, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

const PropertyFormDialog = ({ open, onOpenChange, form, onFieldChange, onSave, isEditing }: PropertyFormDialogProps) => {
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  const handleAddImage = () => {
    if (newImageUrl) {
      const currentImages = typeof form.images === "string" ? JSON.parse(form.images || "[]") : (form.images || []);
      const newImages = [...currentImages, newImageUrl];
      onFieldChange("images", JSON.stringify(newImages));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = typeof form.images === "string" ? JSON.parse(form.images || "[]") : (form.images || []);
    const newImages = currentImages.filter((_: string, i: number) => i !== index);
    onFieldChange("images", JSON.stringify(newImages));
  };

  const handleAddDocument = () => {
    if (newDocName && newDocUrl) {
      const currentDocs = typeof form.documents === "string" ? JSON.parse(form.documents || "[]") : (form.documents || []);
      const newDoc = { name: newDocName, url: newDocUrl, type: "autre" };
      const newDocs = [...currentDocs, newDoc];
      onFieldChange("documents", JSON.stringify(newDocs));
      setNewDocName("");
      setNewDocUrl("");
    }
  };

  const handleRemoveDocument = (index: number) => {
    const currentDocs = typeof form.documents === "string" ? JSON.parse(form.documents || "[]") : (form.documents || []);
    const newDocs = currentDocs.filter((_: { name: string; url: string; type: string }, i: number) => i !== index);
    onFieldChange("documents", JSON.stringify(newDocs));
  };

  const getDisplayImages = (): string[] => {
    if (Array.isArray(form.images)) return form.images;
    try {
      return JSON.parse(form.images || "[]");
    } catch {
      return [];
    }
  };

  const getDisplayDocuments = (): { name: string; url: string; type: string }[] => {
    if (Array.isArray(form.documents)) return form.documents;
    try {
      return JSON.parse(form.documents || "[]");
    } catch {
      return [];
    }
  };

  const displayImages = getDisplayImages();
  const displayDocuments = getDisplayDocuments();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Modifier le bien" : "Ajouter un nouveau bien"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Titre */}
          <div className="sm:col-span-2">
            <Label>Titre du bien *</Label>
            <Input 
              value={form.title} 
              onChange={(e) => onFieldChange("title", e.target.value)} 
              placeholder="Ex: Villa moderne avec piscine à Bonapriso" 
            />
          </div>

          {/* Type de bien */}
          <div>
            <Label>Type de bien</Label>
            <Select value={form.type} onValueChange={(v) => onFieldChange("type", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
              <SelectContent>
                {propertyTypes.map((t) => (
                  <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statut */}
          <div>
            <Label>Statut du bien</Label>
            <Select value={form.status} onValueChange={(v) => onFieldChange("status", v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionner le statut" /></SelectTrigger>
              <SelectContent>
                {propertyStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prix */}
          <div>
            <Label>Prix (FCFA) *</Label>
            <Input 
              type="number" 
              value={form.price} 
              onChange={(e) => onFieldChange("price", e.target.value)} 
              placeholder="Ex: 150000"
            />
          </div>

          {/* Mode de location */}
          <div>
            <Label>Mode de location</Label>
            <Select 
              value={form.rentalMode || ""} 
              onValueChange={(v) => onFieldChange("rentalMode", v)}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner le mode" /></SelectTrigger>
              <SelectContent>
                {rentalModes.map((m) => (
                  <SelectItem key={m} value={m}>{rentalModeLabels[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Surface */}
          <div>
            <Label>Surface (m²)</Label>
            <Input 
              type="number" 
              value={form.area} 
              onChange={(e) => onFieldChange("area", e.target.value)} 
              placeholder="Ex: 120"
            />
          </div>

          {/* Chambres */}
          <div>
            <Label>Nombre de chambres</Label>
            <Input 
              type="number" 
              value={form.bedrooms} 
              onChange={(e) => onFieldChange("bedrooms", e.target.value)} 
              placeholder="Ex: 3"
            />
          </div>

          {/* Salles de bain */}
          <div>
            <Label>Nombre de salles de bain</Label>
            <Input 
              type="number" 
              value={form.bathrooms} 
              onChange={(e) => onFieldChange("bathrooms", e.target.value)} 
              placeholder="Ex: 2"
            />
          </div>

          {/* Ville */}
          <div>
            <Label>Ville</Label>
            <Select value={form.city} onValueChange={(v) => onFieldChange("city", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Adresse */}
          <div>
            <Label>Adresse *</Label>
            <Input 
              value={form.address} 
              onChange={(e) => onFieldChange("address", e.target.value)} 
              placeholder="Quartier, rue, numéro..." 
            />
          </div>

          {/* Coordonnées GPS */}
          <div>
            <Label>Latitude</Label>
            <Input 
              type="number" 
              step="0.0001" 
              value={form.lat} 
              onChange={(e) => onFieldChange("lat", e.target.value)} 
              placeholder="Ex: 4.0511"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input 
              type="number" 
              step="0.0001" 
              value={form.lng} 
              onChange={(e) => onFieldChange("lng", e.target.value)} 
              placeholder="Ex: 9.7679"
            />
          </div>

          {/* URL image de couverture */}
          <div className="sm:col-span-2">
            <Label>URL image de couverture</Label>
            <Input 
              value={form.coverImage} 
              onChange={(e) => onFieldChange("coverImage", e.target.value)} 
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Galerie photos */}
          <div className="sm:col-span-2">
            <Label>Photos supplémentaires</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newImageUrl} 
                onChange={(e) => setNewImageUrl(e.target.value)} 
                placeholder="URL de la photo..." 
                className="flex-1"
              />
              <Button type="button" onClick={handleAddImage} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {displayImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {displayImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Photo ${index + 1}`} 
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea 
              value={form.description} 
              onChange={(e) => onFieldChange("description", e.target.value)} 
              rows={4}
              placeholder="Décrivez votre bien en détail..."
            />
          </div>

          {/* Proximité */}
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
              Proximité (distance en km)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Hôpital</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={form.hospital} 
                  onChange={(e) => onFieldChange("hospital", e.target.value)} 
                />
              </div>
              <div>
                <Label className="text-xs">Police</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={form.police} 
                  onChange={(e) => onFieldChange("police", e.target.value)} 
                />
              </div>
              <div>
                <Label className="text-xs">Supermarché</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={form.supermarket} 
                  onChange={(e) => onFieldChange("supermarket", e.target.value)} 
                />
              </div>
              <div>
                <Label className="text-xs">École</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={form.school} 
                  onChange={(e) => onFieldChange("school", e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* URL visite virtuelle */}
          <div className="sm:col-span-2">
            <Label>URL visite virtuelle (optionnel)</Label>
            <Input 
              value={form.virtualTourUrl} 
              onChange={(e) => onFieldChange("virtualTourUrl", e.target.value)} 
              placeholder="https://..."
            />
          </div>

          {/* Documents */}
          <div className="sm:col-span-2">
            <Label>Documents (contrats, actes, diagnostics...)</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newDocName} 
                onChange={(e) => setNewDocName(e.target.value)} 
                placeholder="Nom du document..." 
                className="flex-1"
              />
              <Input 
                value={newDocUrl} 
                onChange={(e) => setNewDocUrl(e.target.value)} 
                placeholder="URL du document..." 
                className="flex-1"
              />
              <Button type="button" onClick={handleAddDocument} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {displayDocuments.length > 0 && (
              <div className="space-y-2">
                {displayDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            {isEditing ? "Enregistrer les modifications" : "Ajouter le bien"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormDialog;
