import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Lock, Globe, CreditCard, MapPin, FileText, Users } from "lucide-react";
import { CURRENCY, GEOGRAPHIC_ZONES, LEASE_CONTRACT_TEMPLATES, COLOCATION_RULES } from "@/config/seek-config";
import { getCurrentOwner, updateOwnerProfile, changeOwnerPassword, setCurrentOwner, type Proprietaire } from "@/lib/owner-api";



const AdminSettings = () => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState('xof');
  const [timezone, setTimezone] = useState('utc');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentOwner, setCurrentOwner] = useState<Proprietaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmMotDePasse: '',
  });


  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    ville: '',
    adresse: '',
  });


  useEffect(() => {
  const owner = getCurrentOwner();
  setCurrentOwner(owner);
  
  if (owner) {
    setFormData({
      fullName: owner.nom_complet || '',
      phone: owner.telephone || '',
      email: owner.email || '',
      whatsapp: owner.whatsapp || '',
      ville: owner.ville || '',
      adresse: owner.adresse || '',
    });
  }
  setLoading(false);
}, []);

const handleSaveProfile = async () => {
  setIsSaving(true);
  try {
    const result = await updateOwnerProfile({
      nom_complet: formData.fullName,
      email: formData.email || undefined,
      adresse: formData.adresse || undefined,
      whatsapp: formData.whatsapp || undefined,
      ville: formData.ville || undefined,
    });
    
    if (result.success && result.owner) {
      setCurrentOwner(result.owner);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Échec de la mise à jour",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Une erreur est survenue",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};

const handlePasswordChange = async () => {
  if (passwordData.nouveauMotDePasse !== passwordData.confirmMotDePasse) {
    toast({
      title: "Erreur",
      description: "Les mots de passe ne correspondent pas",
      variant: "destructive",
    });
    return;
  }

  if (passwordData.nouveauMotDePasse.length < 6) {
    toast({
      title: "Erreur",
      description: "Le mot de passe doit contenir au moins 6 caractères",
      variant: "destructive",
    });
    return;
  }

  setIsSaving(true);
  try {
    const result = await changeOwnerPassword(
      passwordData.ancienMotDePasse,
      passwordData.nouveauMotDePasse
    );
    
    if (result.success) {
      toast({
        title: "Succès",
        description: "Mot de passe modifié avec succès",
      });
      setPasswordData({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' });
      setIsChangingPassword(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Échec du changement de mot de passe",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Une erreur est survenue",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};



  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Settings className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wider font-body">Paramètres</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold">Paramètres du compte</h1>
      <p className="text-muted-foreground mt-1">Gérez vos informations et préférences</p>

      <Tabs defaultValue="general" className="space-y-6">
       

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Informations personnelles</CardTitle>
              </div>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom et Prénom</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName || ''} 
                  onChange={handleInputChange}
                  placeholder="Votre nom complet"
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange}
                  placeholder="+221 XX XXX XXXX"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Le téléphone ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email || ''} 
                  onChange={handleInputChange}
                  placeholder="email@exemple.com"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  value={formData.whatsapp || ''} 
                  onChange={handleInputChange}
                  placeholder="+221 XX XXX XXXX"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input 
                  id="ville" 
                  value={formData.ville || ''} 
                  onChange={handleInputChange}
                  placeholder="Dakar"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse Personnelle</Label>
                <Input 
                  id="adresse" 
                  value={formData.adresse || ''} 
                  onChange={handleInputChange}
                  placeholder="Adresse personnelle"
                  disabled={!isEditing}
                />
              </div>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      if (currentOwner) {
                        setFormData({
                          fullName: currentOwner.nom_complet || '',
                          phone: currentOwner.telephone || '',
                          email: currentOwner.email || '',
                          whatsapp: currentOwner.whatsapp || '',
                          ville: currentOwner.ville || '',
                          adresse: currentOwner.adresse || '',
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Modifier le profil
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Sécurité</CardTitle>
              </div>
              <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isChangingPassword ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ancienMotDePasse">Mot de passe actuel</Label>
                    <Input 
                      id="ancienMotDePasse" 
                      type="password" 
                      value={passwordData.ancienMotDePasse}
                      onChange={(e) => setPasswordData({...passwordData, ancienMotDePasse: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nouveauMotDePasse">Nouveau mot de passe</Label>
                    <Input 
                      id="nouveauMotDePasse" 
                      type="password"
                      value={passwordData.nouveauMotDePasse}
                      onChange={(e) => setPasswordData({...passwordData, nouveauMotDePasse: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmMotDePasse">Confirmer le mot de passe</Label>
                    <Input 
                      id="confirmMotDePasse" 
                      type="password"
                      value={passwordData.confirmMotDePasse}
                      onChange={(e) => setPasswordData({...passwordData, confirmMotDePasse: e.target.value})}
                    />
                    {passwordData.nouveauMotDePasse && passwordData.confirmMotDePasse && 
                     passwordData.nouveauMotDePasse !== passwordData.confirmMotDePasse && (
                      <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmMotDePasse: '' });
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={isSaving || !passwordData.ancienMotDePasse || !passwordData.nouveauMotDePasse}
                      className="flex-1"
                    >
                      {isSaving ? 'Modification...' : 'Confirmer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Cliquez sur le bouton ci-dessous pour changer votre mot de passe</p>
                  <Button onClick={() => setIsChangingPassword(true)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de devise */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Devise - {CURRENCY.name}</CardTitle>
              </div>
              <CardDescription>Configurez la devise par défaut pour l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Devise par défaut</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="xof">{CURRENCY.code} - {CURRENCY.name}</option>
                    <option value="eur">EUR - Euro</option>
                    <option value="usd">USD - Dollar Américain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Symbole</Label>
                  <Input value={CURRENCY.symbol} disabled />
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Exemple de format</h4>
                <p className="text-2xl font-bold">{CURRENCY.format(150000)}</p>
                <p className="text-sm text-muted-foreground">Format standard: 150 000 {CURRENCY.symbol}</p>
              </div>

              <div className="space-y-2">
                <Label>Préfixe/Symbole personnalisé</Label>
                <Input defaultValue={CURRENCY.symbol} placeholder="ex:FCFA" />
              </div>
              
              <Button className="w-full">Enregistrer les préférences de devise</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frais de dossier</CardTitle>
              <CardDescription>Configurez les frais appliqués aux transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Frais de dossier locataire</Label>
                  <Input type="number" defaultValue="10000" />
                  <p className="text-sm text-muted-foreground">En {CURRENCY.code}</p>
                </div>
                <div className="space-y-2">
                  <Label>Frais de dossier propriétaire</Label>
                  <Input type="number" defaultValue="0" />
                  <p className="text-sm text-muted-foreground">En {CURRENCY.code}</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Commission location (%)</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Commission vente (%)</Label>
                  <Input type="number" defaultValue="3" />
                </div>
              </div>
              
              <Button className="w-full">Enregistrer les frais</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones géographiques */}
        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Zones géographiques du Sénégal</CardTitle>
              </div>
              <CardDescription>Gérez les régions et localités couvertes par votre agence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Région principale</Label>
                <select 
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">Sélectionnez une région</option>
                  {GEOGRAPHIC_ZONES.regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRegion && (
                <div className="space-y-2">
                  <Label>Départements</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    {GEOGRAPHIC_ZONES.regions
                      .find((r) => r.id === selectedRegion)
                      ?.departments.map((dept) => (
                        <div key={dept.id} className="flex items-center gap-2 p-2 border rounded">
                          <input type="checkbox" defaultChecked />
                          <span>{dept.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Localités populaires (Dakar)</Label>
                <div className="grid gap-2 md:grid-cols-4">
                  {GEOGRAPHIC_ZONES.localities.dakar.map((locality) => (
                    <div key={locality} className="flex items-center gap-2 p-2 border rounded">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">{locality}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Code postal Dakar</Label>
                  <Input defaultValue={GEOGRAPHIC_ZONES.postalCodes.dakar} />
                </div>
                <div className="space-y-2">
                  <Label>Code postal Thiès</Label>
                  <Input defaultValue={GEOGRAPHIC_ZONES.postalCodes.thies} />
                </div>
                <div className="space-y-2">
                  <Label>Code postal Saint-Louis</Label>
                  <Input defaultValue={GEOGRAPHIC_ZONES.postalCodes['saint-louis']} />
                </div>
              </div>

              <Button className="w-full">Enregistrer les zones géographiques</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modèles de contrats */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Modèles de contrats sénégalais</CardTitle>
              </div>
              <CardDescription>Gérez les modèles de contrats disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {LEASE_CONTRACT_TEMPLATES.types.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Clauses: {template.clauses.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <h4 className="font-medium">Mentions légales obligatoires</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {LEASE_CONTRACT_TEMPLATES.mandatoryMentions.map((mention, index) => (
                  <li key={index}>{mention}</li>
                ))}
              </ul>

              <Button className="w-full">Enregistrer les modèles de contrats</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Règles de colocation */}
        <TabsContent value="colocation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Règles de colocation</CardTitle>
              </div>
              <CardDescription>Configurez les règles pour les locations en colocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-medium">Nombre maximum de colocataires par type de bien</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(COLOCATION_RULES.maxRoommatesByPropertyType).map(([type, max]) => (
                  <div key={type} className="space-y-2">
                    <Label className="capitalize">{type}</Label>
                    <Input type="number" defaultValue={max} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Surface minimum par chambre (m²)</Label>
                  <Input type="number" defaultValue={COLOCATION_RULES.bedroomRules.minSurface} />
                </div>
                <div className="space-y-2">
                  <Label>Salle de bain minimum (ratio)</Label>
                  <Input type="number" step="0.1" defaultValue={COLOCATION_RULES.bathroomRatio.minimum} />
                  <p className="text-sm text-muted-foreground">1 salle de bain pour X colocataires</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Clause de solidarité</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Activer la clause de solidarité</p>
                    <p className="text-sm text-muted-foreground">{COLOCATION_RULES.solidarityClause.description}</p>
                  </div>
                  <Switch defaultChecked={COLOCATION_RULES.solidarityClause.enabled} />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Préavis minimum (mois)</Label>
                  <Input type="number" defaultValue={COLOCATION_RULES.noticePeriodForRoommateDeparture.minimum} />
                </div>
                <div className="space-y-2">
                  <Label>Préavis recommandé (mois)</Label>
                  <Input type="number" defaultValue={COLOCATION_RULES.noticePeriodForRoommateDeparture.recommended} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Surface cuisine minimum (m²)</Label>
                  <Input type="number" defaultValue={COLOCATION_RULES.commonSpaces.kitchenMinSurface} />
                </div>
                <div className="space-y-2">
                  <Label>Surface salon minimum (m²)</Label>
                  <Input type="number" defaultValue={COLOCATION_RULES.commonSpaces.livingRoomMinSurface} />
                </div>
              </div>

              <Button className="w-full">Enregistrer les règles de colocation</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>Actions irréversibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Supprimer le compte</p>
              <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte et toutes les données</p>
            </div>
            <Button variant="destructive">Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
