import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Property, 
  PropertyType, 
  PropertyStatus, 
  RentalMode,
  propertyTypes, 
  propertyStatuses, 
  rentalModes,
  typeLabels, 
  statusLabels, 
  rentalModeLabels,
  cities,
  mockProperties,
  PropertyDocument,
  Room
} from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Upload,
  X,
  FileText,
  Image,
  Grid,
  List,
  Filter,
  RefreshCw,
  UploadCloud,
  MapPinHouse,
  Download,
  File,
  FileImage,
  FileUp,
  User,
  Home as HomeIcon,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import RoomManagement from '@/components/dashboard/RoomManagement';

// Types pour le formulaire
interface PropertyFormData {
  title: string;
  type: PropertyType;
  price: string;
  status: PropertyStatus;
  rentalMode: RentalMode | '';
  description: string;
  coverImage: string;
  images: UploadedFile[];
  documents: UploadedDocument[];
  bedrooms: string;
  bathrooms: string;
  area: string;
  city: string;
  neighborhood: string;
  address: string;
  lat: string;
  lng: string;
  hospital: string;
  police: string;
  supermarket: string;
  school: string;
  virtualTourUrl: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  isAgencyProperty: boolean;
}

// Type pour fichier uploadé
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  fileType?: string;
  size?: number;
}

// Type pour document uploadé
interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  type: PropertyDocument['type'];
  uploadedAt: string;
}

// Couleurs des badges de statut
const statusColors: Record<PropertyStatus, string> = {
  'libre': 'bg-green-100 text-green-800',
  'loué': 'bg-blue-100 text-blue-800',
  'partiellement loué': 'bg-yellow-100 text-yellow-800',
  'en maintenance': 'bg-orange-100 text-orange-800',
  'à vendre': 'bg-purple-100 text-purple-800',
  'vendu': 'bg-gray-100 text-gray-800',
};

// Valeur initiale du formulaire
const emptyFormData: PropertyFormData = {
  title: '',
  type: 'appartement',
  price: '',
  status: 'libre',
  rentalMode: '',
  description: '',
  coverImage: '',
  images: [],
  documents: [],
  bedrooms: '',
  bathrooms: '',
  area: '',
  city: '',
  neighborhood: '',
  address: '',
  lat: '',
  lng: '',
  hospital: '',
  police: '',
  supermarket: '',
  school: '',
  virtualTourUrl: '',
  ownerId: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  isAgencyProperty: false,
};

const PropertyManagement: React.FC = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  
  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Formulaire
  const [formData, setFormData] = useState<PropertyFormData>(emptyFormData);
  const [isEditing, setIsEditing] = useState(false);
  
  // Champs temporaires
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<PropertyDocument['type']>('autre');
  const [isUploading, setIsUploading] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Charger les biens
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProperties(mockProperties);
      } catch (error) {
        console.error('Erreur lors de la récupération des biens:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les biens',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  // Quartiers uniques
  const neighborhoods = useMemo(() => {
    const allNeighborhoods = properties.map(p => p.location.address.split(',')[0].trim());
    return [...new Set(allNeighborhoods)].sort();
  }, [properties]);

  // Propriétaires uniques
  const owners = useMemo(() => {
    const allOwners = properties.map(p => p.ownerName);
    return [...new Set(allOwners)].sort();
  }, [properties]);

  // Filtrer les biens
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = !filterCity || filterCity === 'all' || property.location.city === filterCity;
      const matchesType = !filterType || filterType === 'all' || property.type === filterType;
      const matchesStatus = !filterStatus || filterStatus === 'all' || property.status === filterStatus;
      const matchesNeighborhood = !filterNeighborhood || filterNeighborhood === 'all' || 
        property.location.address.includes(filterNeighborhood);
      const matchesOwner = !filterOwner || filterOwner === 'all' || property.ownerName === filterOwner;
      
      return matchesSearch && matchesCity && matchesType && matchesStatus && matchesNeighborhood && matchesOwner;
    });
  }, [properties, searchTerm, filterCity, filterType, filterStatus, filterNeighborhood, filterOwner]);

  // Statistiques
  const stats = useMemo(() => ({
    total: properties.length,
    libre: properties.filter(p => p.status === 'libre').length,
    loué: properties.filter(p => p.status === 'loué').length,
    partiellementLoué: properties.filter(p => p.status === 'partiellement loué').length,
    enMaintenance: properties.filter(p => p.status === 'en maintenance').length,
    tauxOccupation: properties.length > 0 
      ? Math.round(((properties.filter(p => p.status !== 'libre' && p.status !== 'en maintenance').length) / properties.length) * 100)
      : 0,
  }), [properties]);

  // Générer un ID unique
  const generateId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Gérer l'upload de l'image de couverture
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await simulateFileUpload(file, 'cover');
      handleFieldChange('coverImage', imageUrl);
      toast({
        title: 'Image uploadée',
        description: 'L\'image de couverture a été téléchargée avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec du téléchargement de l\'image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Gérer l'upload de photos supplémentaires
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const imageUrl = await simulateFileUpload(file, 'image');
          return {
            id: generateId(),
            name: file.name,
            url: imageUrl,
            type: 'image' as const,
            fileType: file.type,
            size: file.size,
          };
        })
      );

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      toast({
        title: 'Images uploadées',
        description: `${newImages.length} image(s) téléchargée(s) avec succès.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec du téléchargement des images.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Gérer l'upload de documents
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const newDocs = await Promise.all(
        files.map(async (file) => {
          const docUrl = await simulateFileUpload(file, 'document');
          return {
            id: generateId(),
            name: newDocName || file.name,
            url: docUrl,
            type: newDocType,
            uploadedAt: new Date().toISOString(),
          };
        })
      );

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocs],
      }));

      toast({
        title: 'Documents uploadés',
        description: `${newDocs.length} document(s) téléchargé(s) avec succès.`,
      });

      setNewDocName('');
      setNewDocType('autre');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec du téléchargement des documents.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Simuler l'upload de fichier (en production, cela enverrait au serveur)
  const simulateFileUpload = (file: File, type: 'cover' | 'image' | 'document'): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Créer une URL locale pour le fichier
        const objectUrl = URL.createObjectURL(file);
        resolve(objectUrl);
      }, 500);
    });
  };

  // Supprimer une image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Supprimer un document
  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Ouvrir le dialog d'ajout
  const handleOpenAddDialog = () => {
    setFormData({ ...emptyFormData, isAgencyProperty: true });
    setIsEditing(false);
    setIsAddDialogOpen(true);
  };

  // Ouvrir le dialog de modification
  const handleOpenEditDialog = (property: Property) => {
    setFormData({
      title: property.title,
      type: property.type,
      price: property.price.toString(),
      status: property.status,
      rentalMode: property.rentalMode || '',
      description: property.description,
      coverImage: property.coverImage,
      images: property.images.map(img => ({
        id: generateId(),
        name: `image-${img}`,
        url: img,
        type: 'image' as const,
      })),
      documents: property.documents.map(doc => ({
        ...doc,
        id: generateId(),
      })),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      city: property.location.city,
      neighborhood: property.location.address.split(',')[0].trim(),
      address: property.location.address,
      lat: property.location.lat.toString(),
      lng: property.location.lng.toString(),
      hospital: property.proximity.hospital.toString(),
      police: property.proximity.police.toString(),
      supermarket: property.proximity.supermarket.toString(),
      school: property.proximity.school.toString(),
      virtualTourUrl: property.virtualTourUrl || '',
      ownerId: property.ownerId,
      ownerName: property.ownerName,
      ownerPhone: property.ownerPhone,
      ownerEmail: property.ownerEmail,
      isAgencyProperty: false,
    });
    setIsEditing(true);
    setIsEditDialogOpen(true);
  };

  // Ouvrir le dialog de visualisation
  const handleOpenViewDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsViewDialogOpen(true);
  };

  // Gérer les changements de champs
  const handleFieldChange = (key: keyof PropertyFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Sauvegarder le bien (ajout ou modification)
  const handleSave = () => {
    if (!formData.title || !formData.price || !formData.city || !formData.address) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    const propertyData: Property = {
      id: isEditing && selectedProperty ? selectedProperty.id : `prop-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      price: parseInt(formData.price),
      status: formData.status,
      rentalMode: formData.rentalMode as RentalMode || undefined,
      description: formData.description,
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      images: formData.images.map(img => img.url),
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseInt(formData.area) || 0,
      location: {
        city: formData.city,
        address: formData.neighborhood ? `${formData.neighborhood}, ${formData.address}` : formData.address,
        lat: parseFloat(formData.lat) || 0,
        lng: parseFloat(formData.lng) || 0,
      },
      proximity: {
        hospital: parseFloat(formData.hospital) || 0,
        police: parseFloat(formData.police) || 0,
        supermarket: parseFloat(formData.supermarket) || 0,
        school: parseFloat(formData.school) || 0,
      },
      featured: false,
      archived: false,
      ownerId: formData.ownerId || `owner-${Date.now()}`,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      ownerEmail: formData.ownerEmail,
      createdAt: isEditing && selectedProperty ? selectedProperty.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      virtualTourUrl: formData.virtualTourUrl || undefined,
      documents: formData.documents,
    };

    if (isEditing) {
      setProperties(prev => prev.map(p => p.id === propertyData.id ? propertyData : p));
      toast({
        title: 'Bien modifié',
        description: 'Les informations du bien ont été mises à jour',
      });
      setIsEditDialogOpen(false);
    } else {
      setProperties(prev => [...prev, propertyData]);
      toast({
        title: 'Bien ajouté',
        description: 'Le bien a été ajouté avec succès',
      });
      setIsAddDialogOpen(false);
    }
  };

  // Supprimer un bien
  const handleDelete = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.')) return;
    
    setProperties(prev => prev.filter(p => p.id !== id));
    toast({
      title: 'Bien supprimé',
      description: 'Le bien a été supprimé avec succès',
    });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCity('all');
    setFilterType('all');
    setFilterStatus('all');
    setFilterNeighborhood('all');
    setFilterOwner('all');
  };

  // Formulaire de bien (commun pour ajout et modification)
  const PropertyForm = ({ onSubmit }: { onSubmit: () => void }) => (
    <div className="space-y-6">
      {/* Type de propriété */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="agencyProperty"
            checked={formData.isAgencyProperty}
            onChange={() => handleFieldChange('isAgencyProperty', true)}
            className="w-4 h-4"
          />
          <Label htmlFor="agencyProperty" className="cursor-pointer">
            Bien au nom de l'agence
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="ownerProperty"
            checked={!formData.isAgencyProperty}
            onChange={() => handleFieldChange('isAgencyProperty', false)}
            className="w-4 h-4"
          />
          <Label htmlFor="ownerProperty" className="cursor-pointer">
            Bien d'un propriétaire
          </Label>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Informations</TabsTrigger>
          <TabsTrigger value="location">Localisation</TabsTrigger>
          <TabsTrigger value="photos">Photos & Plans</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Onglet Informations de base */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Titre du bien *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ex: Villa moderne avec piscine à Bonapriso"
              />
            </div>

            <div>
              <Label htmlFor="type">Type de bien *</Label>
              <Select value={formData.type} onValueChange={(v) => handleFieldChange('type', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select value={formData.status} onValueChange={(v) => handleFieldChange('status', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner le statut" /></SelectTrigger>
                <SelectContent>
                  {propertyStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                placeholder="Ex: 150000"
              />
            </div>

            <div>
              <Label htmlFor="rentalMode">Mode de location</Label>
              <Select 
                value={formData.rentalMode || 'none'} 
                onValueChange={(v) => handleFieldChange('rentalMode', v === 'none' ? '' : v)}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner le mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non applicable</SelectItem>
                  {rentalModes.map((m) => (
                    <SelectItem key={m} value={m}>{rentalModeLabels[m]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedrooms">Nombre de chambres</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleFieldChange('bedrooms', e.target.value)}
                placeholder="Ex: 3"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Nombre de salles de bain</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleFieldChange('bathrooms', e.target.value)}
                placeholder="Ex: 2"
              />
            </div>

            <div>
              <Label htmlFor="area">Surface (m²)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleFieldChange('area', e.target.value)}
                placeholder="Ex: 120"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              placeholder="Décrivez votre bien en détail..."
            />
          </div>

          {/* Informations du propriétaire (si applicable) */}
          {!formData.isAgencyProperty && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h4 className="font-medium">Informations du propriétaire</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName">Nom du propriétaire *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Téléphone</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleFieldChange('ownerPhone', e.target.value)}
                    placeholder="+237 6 XX XX XX XX"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleFieldChange('ownerEmail', e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Onglet Localisation */}
        <TabsContent value="location" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Select value={formData.city} onValueChange={(v) => handleFieldChange('city', v)}>
                <SelectTrigger><SelectValue placeholder="Sélectionner la ville" /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="neighborhood">Quartier</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                placeholder="Ex: Bonapriso"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="Rue, numéro, point de repère..."
              />
            </div>

            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => handleFieldChange('lat', e.target.value)}
                placeholder="Ex: 4.0511"
              />
            </div>

            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => handleFieldChange('lng', e.target.value)}
                placeholder="Ex: 9.7679"
              />
            </div>
          </div>

          {/* Proximité */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Proximité (distance en km)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="hospital" className="text-xs">Hôpital</Label>
                <Input
                  id="hospital"
                  type="number"
                  step="0.1"
                  value={formData.hospital}
                  onChange={(e) => handleFieldChange('hospital', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="police" className="text-xs">Police</Label>
                <Input
                  id="police"
                  type="number"
                  step="0.1"
                  value={formData.police}
                  onChange={(e) => handleFieldChange('police', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supermarket" className="text-xs">Supermarché</Label>
                <Input
                  id="supermarket"
                  type="number"
                  step="0.1"
                  value={formData.supermarket}
                  onChange={(e) => handleFieldChange('supermarket', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="school" className="text-xs">École</Label>
                <Input
                  id="school"
                  type="number"
                  step="0.1"
                  value={formData.school}
                  onChange={(e) => handleFieldChange('school', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="virtualTourUrl">URL visite virtuelle</Label>
            <Input
              id="virtualTourUrl"
              value={formData.virtualTourUrl}
              onChange={(e) => handleFieldChange('virtualTourUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </TabsContent>

        {/* Onglet Photos & Plans */}
        <TabsContent value="photos" className="space-y-4 mt-4">
          {/* Image de couverture */}
          <div>
            <Label>Image de couverture</Label>
            <div className="mt-2">
              {formData.coverImage ? (
                <div className="relative group">
                  <img
                    src={formData.coverImage}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => coverImageInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Remplacer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleFieldChange('coverImage', '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => coverImageInputRef.current?.click()}
                >
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <UploadCloud className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isUploading ? 'Upload en cours...' : 'Cliquez pour télécharger l\'image de couverture'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos supplémentaires / Plans */}
          <div>
            <Label>Photos supplémentaires / Plans</Label>
            <div className="mt-2">
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Upload en cours...' : 'Cliquez pour télécharger des photos ou plans'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Plusieurs fichiers acceptés</p>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(img.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* Upload de documents */}
          <div>
            <Label>Documents liés au bien</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <Input
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Nom du document..."
                className="flex-1"
              />
              <Select value={newDocType} onValueChange={(v) => setNewDocType(v as PropertyDocument['type'])}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrat">Contrat</SelectItem>
                  <SelectItem value="acte">Acte</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => docInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Upload...' : 'Parcourir'}
                </Button>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier)</p>
          </div>

          {/* Liste des documents */}
          {formData.documents.length > 0 && (
            <div className="space-y-2 mt-4">
              {formData.documents.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => isEditing ? setIsEditDialogOpen(false) : setIsAddDialogOpen(false)}>
          Annuler
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Enregistrer les modifications' : 'Ajouter le bien'}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="GESTION DES BIENS"
        icon={Building2}
        description="Gérez l'ensemble de votre portefeuille immobilier"
        action={
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un bien
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Biens</h1>
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
              <p className="text-sm font-medium text-gray-500">Libres</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.libre}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Loués</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.loué}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Part. loués</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.partiellementLoué}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.enMaintenance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taux d'occupation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taux d'occupation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={stats.tauxOccupation} className="flex-1" />
            <span className="text-sm font-medium">{stats.tauxOccupation}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {propertyTypes.map((t) => (
                  <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {propertyStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterNeighborhood} onValueChange={setFilterNeighborhood}>
              <SelectTrigger>
                <SelectValue placeholder="Quartier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les quartiers</SelectItem>
                {neighborhoods.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger>
                <SelectValue placeholder="Propriétaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les propriétaires</SelectItem>
                {owners.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mode d'affichage */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          {filteredProperties.length} bien(s) trouvé(s)
        </Badge>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des biens */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={property.coverImage}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-2 right-2 ${statusColors[property.status]}`}>
                  {statusLabels[property.status]}
                </Badge>
                {property.rentalMode === 'colocation' && (
                  <Badge className="absolute top-2 left-2 bg-purple-100 text-purple-800">
                    Colocation
                  </Badge>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{property.location.city}</span>
                      <span>-</span>
                      <span className="line-clamp-1">{property.location.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(property)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(property)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span>{property.bedrooms} ch.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{property.bathrooms} sdb</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-primary">
                      {new Intl.NumberFormat('fr-FR').format(property.price)} F
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Propriétaire: {property.ownerName}</span>
                  <span>{typeLabels[property.type]}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredProperties.map((property) => (
                <div key={property.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <img
                    src={property.coverImage}
                    alt={property.title}
                    className="w-20 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{property.title}</h3>
                      <Badge className={`${statusColors[property.status]} text-xs`}>
                        {statusLabels[property.status]}
                      </Badge>
                      {property.rentalMode === 'colocation' && (
                        <Badge variant="secondary" className="text-xs">Colocation</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location.city}
                      </span>
                      <span>{property.location.address}</span>
                      <span>{property.bedrooms} ch. | {property.bathrooms} sdb | {property.area} m²</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {new Intl.NumberFormat('fr-FR').format(property.price)} F
                    </p>
                    <p className="text-xs text-gray-500">{typeLabels[property.type]}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewDialog(property)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(property)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun bien trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec vos critères de recherche
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog d'ajout */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau bien</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un bien à votre portefeuille
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleSave} />
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le bien</DialogTitle>
            <DialogDescription>
              Modifiez les informations du bien
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleSave} />
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProperty?.title}</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              {/* Image principale */}
              <img
                src={selectedProperty.coverImage}
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              {/* Galerie photos */}
              {selectedProperty.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Galerie photos</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedProperty.images.map((img, idx) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <img
                          src={img}
                          alt={`Photo ${idx + 1}`}
                          className="w-32 h-24 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(img, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{typeLabels[selectedProperty.type]}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge className={statusColors[selectedProperty.status]}>
                    {statusLabels[selectedProperty.status]}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Prix</p>
                  <p className="font-medium text-primary">
                    {new Intl.NumberFormat('fr-FR').format(selectedProperty.price)} F
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Surface</p>
                  <p className="font-medium">{selectedProperty.area} m²</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Chambres</p>
                  <p className="font-medium">{selectedProperty.bedrooms}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Salles de bain</p>
                  <p className="font-medium">{selectedProperty.bathrooms}</p>
                </div>
                {selectedProperty.rentalMode && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Mode</p>
                    <p className="font-medium">{rentalModeLabels[selectedProperty.rentalMode]}</p>
                  </div>
                )}
              </div>

              {/* Onglet Chambres pour la colocation */}
              {selectedProperty.rentalMode === 'colocation' && (
                <div className="border-t pt-6">
                  <Tabs defaultValue="rooms" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="info">Informations</TabsTrigger>
                      <TabsTrigger value="rooms">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Chambres ({selectedProperty.rooms?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-4 mt-4">
                      {/* Localisation */}
                      <div>
                        <h4 className="font-medium mb-2">Localisation</h4>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedProperty.location.address}, {selectedProperty.location.city}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedProperty.description && (
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-gray-600">{selectedProperty.description}</p>
                        </div>
                      )}

                      {/* Informations propriétaire */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Informations du propriétaire</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Nom:</span>
                            <span className="ml-2">{selectedProperty.ownerName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Téléphone:</span>
                            <span className="ml-2">{selectedProperty.ownerPhone}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2">{selectedProperty.ownerEmail}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="rooms" className="mt-4">
                      <RoomManagement
                        property={selectedProperty}
                        onPropertyUpdate={(updatedProperty) => {
                          setProperties(prev => prev.map(p => 
                            p.id === updatedProperty.id ? updatedProperty : p
                          ));
                          setSelectedProperty(updatedProperty);
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4 mt-4">
                      {selectedProperty.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedProperty.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="h-5 w-5 text-gray-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Télécharger
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                          <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p>Aucun document disponible</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Affichage normal sans onglet */}
              {selectedProperty.rentalMode !== 'colocation' && (
                <>
                  {/* Localisation */}
                  <div>
                    <h4 className="font-medium mb-2">Localisation</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProperty.location.address}, {selectedProperty.location.city}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProperty.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-600">{selectedProperty.description}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedProperty.documents.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="space-y-2">
                        {selectedProperty.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-gray-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations propriétaire */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Informations du propriétaire</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Nom:</span>
                        <span className="ml-2">{selectedProperty.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Téléphone:</span>
                        <span className="ml-2">{selectedProperty.ownerPhone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2">{selectedProperty.ownerEmail}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;
