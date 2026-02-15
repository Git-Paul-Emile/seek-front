import { Property, propertyTypes, propertyStatuses, rentalModes, typeLabels, statusLabels, rentalModeLabels } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getVillesSenegal, Ville } from "@/lib/ville-api";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import type { FormattedAddress } from "@/hooks/useAddressAutocomplete";
import { ImageUploader, ImageFile } from "@/components/ui/ImageUploader";
import axiosInstance from "@/api/axiosConfig";

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
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loadingVilles, setLoadingVilles] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Charger les villes du Sénégal depuis l'API
  useEffect(() => {
    const fetchVilles = async () => {
      if (open) {
        setLoadingVilles(true);
        try {
          const data = await getVillesSenegal();
          setVilles(data);
        } catch (error) {
          console.error('Erreur lors du chargement des villes:', error);
        } finally {
          setLoadingVilles(false);
        }
      }
    };
    fetchVilles();
  }, [open]);

  // Gérer l'upload des images
  const handleImagesChange = (newImages: ImageFile[]) => {
    setImages(newImages);
  };

  // Fonction pour uploader les images et retourner les URLs
  const uploadImagesToServer = async (): Promise<{ cover: string | null; images: string[] }> => {
    if (images.length === 0) {
      return { cover: null, images: [] };
    }

    setIsUploadingImages(true);

    try {
      const formData = new FormData();
      
      // Debug: Show what we're sending
      console.log('[Debug] Images to upload:', images);
      
      // Trouver la cover
      const coverImage = images.find(img => img.isCover);
      const additionalImages = images.filter(img => !img.isCover);
      
      console.log('[Debug] Cover image:', coverImage);
      console.log('[Debug] Additional images:', additionalImages);
      
      if (coverImage) {
        formData.append('cover', coverImage.file, coverImage.file.name);
      }
      
      additionalImages.forEach((img) => {
        formData.append('images', img.file, img.file.name);
      });

      // Debug: Show FormData entries
      for (const [key, value] of formData.entries()) {
        console.log('[Debug] FormData entry:', key, value instanceof File ? value.name : value);
      }

      // Let the browser set the Content-Type (with boundary)
      const response = await axiosInstance.post('/biens/upload-images', formData);

      setIsUploadingImages(false);

      return {
        cover: response.data.data.cover?.url || null,
        images: response.data.data.images?.map((img: { url: string }) => img.url) || []
      };
    } catch (error) {
      console.error('Erreur upload images:', error);
      setIsUploadingImages(false);
      throw error;
    }
  };

  // Gérer la sauvegarde avec upload d'images
  const handleSave = async () => {
    try {
      // Uploader les images d'abord
      const uploadResult = await uploadImagesToServer();
      
      // Mettre à jour les champs coverImage et images
      if (uploadResult.cover) {
        onFieldChange("coverImage", uploadResult.cover);
      }
      if (uploadResult.images.length > 0) {
        onFieldChange("images", JSON.stringify(uploadResult.images));
      }
      
      // Appeler la fonction onSave originale
      onSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

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
            <Select value={form.city} onValueChange={(v) => onFieldChange("city", v)} disabled={loadingVilles}>
              <SelectTrigger>
                {loadingVilles ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Sélectionner une ville" />
                )}
              </SelectTrigger>
              <SelectContent>
                {villes.map((ville) => (
                  <SelectItem key={ville.id} value={ville.nom}>{ville.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Adresse avec autocomplétion */}
          <div className="sm:col-span-2">
            <AddressAutocomplete
              value={form.address}
              onAddressChange={(value) => onFieldChange("address", value)}
              onAddressSelect={(data: FormattedAddress) => {
                // Remplir automatiquement les champs associés lors de la sélection
                onFieldChange("address", data.address);
                if (data.city) {
                  onFieldChange("city", data.city);
                }
                // Les coordonnées GPS sont calculées automatiquement par le backend via géocodage
              }}
              label="Adresse"
              placeholder="Commencez à taper une adresse pour voir les suggestions..."
              required={true}
              countryCode="sn"
              minChars={2}
              debounceMs={300}
              maxSuggestions={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Les coordonnées GPS et les établissements proches seront calculés automatiquement
            </p>
          </div>

          {/* Upload de photos */}
          <div className="sm:col-span-2">
            <Label>Photos du bien *</Label>
            <ImageUploader
              value={images}
              onChange={handleImagesChange}
              maxImages={10}
              minImages={3}
              maxFileSize={5 * 1024 * 1024}
              disabled={isUploadingImages}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Uploadez vos photos directement. La première photo sera utilisée comme image principale.
            </p>
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
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploadingImages}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isUploadingImages}>
            {isUploadingImages ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Ajouter le bien"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormDialog;
