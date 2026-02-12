import React, { useEffect, useState } from 'react';
import { agencyAuth, agencyService } from '@/services/agency-auth.service';
import type { Agency, AgencyUpdateProfile } from '@/types/agency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  Loader2,
  Save,
  Upload,
  User,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const AgencyProfile: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AgencyUpdateProfile>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await agencyService.getProfile();
        setProfile(data);
        setFormData({
          name: data.name,
          legalName: data.legalName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          postalCode: data.postalCode,
          licenseNumber: data.licenseNumber,
          taxId: data.taxId,
          website: data.website,
          description: data.description,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // Données mock pour le développement
        setProfile({
          id: '1',
          name: 'Immo Dakar',
          legalName: 'SARL Immo Dakar',
          email: 'contact@immodakar.sn',
          phone: '+221 33 123 45 67',
          address: '123 Rue de la République',
          city: 'Dakar',
          country: 'Sénégal',
          postalCode: '11000',
          licenseNumber: '1234-A',
          taxId: '123 456 789',
          website: 'https://immodakar.sn',
          description: 'Agence immobilière spécialisée dans la gestion de biens résidentiels et commerciaux au Sénégal.',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-10T14:30:00Z',
        });
        setFormData({
          name: 'Immo Dakar',
          legalName: 'SARL Immo Dakar',
          email: 'contact@immodakar.sn',
          phone: '+221 33 123 45 67',
          address: '123 Rue de la République',
          city: 'Dakar',
          country: 'Sénégal',
          postalCode: '11000',
          licenseNumber: '1234-A',
          taxId: '123 456 789',
          website: 'https://immodakar.sn',
          description: 'Agence immobilière spécialisée dans la gestion de biens résidentiels et commerciaux au Sénégal.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof AgencyUpdateProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await agencyService.updateProfile(formData);
      toast({
        title: 'Profil mis à jour',
        description: 'Votre profil a été modifié avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="PROFIL"
        icon={User}
        description="Gérez les informations de votre agence"
        action={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Profil de l'agence</h1>
      </PageHeader>

      {/* Logo et informations de base */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Les informations de base de votre agence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white" />
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Changer le logo
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG jusqu'à 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'agence</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalName">Raison sociale</Label>
                <Input
                  id="legalName"
                  value={formData.legalName || ''}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Licence et informations légales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations légales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Numéro de licence</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Numéro fiscal (TVA/SIRET)</Label>
                <Input
                  id="taxId"
                  value={formData.taxId || ''}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statut du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statut du compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile?.isActive ? 'Compte actif' : 'Compte inactif'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Membre depuis {new Date(profile?.createdAt || '').toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyProfile;
