import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import PageHeader from "@/components/layout/PageHeader";
import {
  Settings,
  CreditCard,
  MapPin,
  FileText,
  Users,
  Bell,
  Globe,
  Save,
  Loader2,
} from "lucide-react";
import { CURRENCY, GEOGRAPHIC_ZONES, LEASE_CONTRACT_TEMPLATES, COLOCATION_RULES } from "@/config/seek-config";
import { useToast } from "@/components/ui/use-toast";

const AgencySettings: React.FC = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState('xof');
  const [selectedRegion, setSelectedRegion] = useState('');

  const handleSave = async () => {
    setSaving(true);
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Paramètres enregistrés',
      description: 'Vos paramètres ont été sauvegardés avec succès.',
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PARAMÈTRES"
        icon={Settings}
        description="Configurez les paramètres de votre agence"
        action={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de l'agence</h1>
      </PageHeader>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" /> Général
          </TabsTrigger>
          <TabsTrigger value="currency" className="gap-2">
            <CreditCard className="h-4 w-4" /> Devise
          </TabsTrigger>
          <TabsTrigger value="regions" className="gap-2">
            <MapPin className="h-4 w-4" /> Zones
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="h-4 w-4" /> Contrats
          </TabsTrigger>
          <TabsTrigger value="colocation" className="gap-2">
            <Users className="h-4 w-4" /> Colocation
          </TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configurez les notifications par défaut</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Envoyer les notifications par email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS notifications</p>
                  <p className="text-sm text-muted-foreground">Envoyer les notifications urgentes par SMS</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp notifications</p>
                  <p className="text-sm text-muted-foreground">Envoyer les notifications par WhatsApp</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rappels automatiques</p>
                  <p className="text-sm text-muted-foreground">Envoyer les rappels de paiement automatiquement</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coordonnées de l'agence</CardTitle>
              <CardDescription>Ces informations seront utilisées dans les communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input defaultValue="contact@seek.sn" placeholder="contact@agence.sn" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input defaultValue="+221 77 123 45 67" placeholder="+221 XX XXX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input defaultValue="+221 77 123 45 67" placeholder="+221 XX XXX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label>Site web</Label>
                  <Input defaultValue="https://seek.sn" placeholder="https://agence.sn" />
                </div>
              </div>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frais et commissions</CardTitle>
              <CardDescription>Configurez les frais appliqués par votre agence</CardDescription>
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
              <CardDescription>Sélectionnez les zones couvertes par votre agence</CardDescription>
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

              <Separator />

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
                {Object.entries(GEOGRAPHIC_ZONES.postalCodes).slice(0, 6).map(([city, code]) => (
                  <div key={city} className="space-y-2">
                    <Label className="capitalize">Code postal {city}</Label>
                    <Input defaultValue={code} />
                  </div>
                ))}
              </div>
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
                      <Switch defaultChecked />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Clauses: {template.clauses.slice(0, 5).join(', ')}...
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <h4 className="font-medium">Mentions légales obligatoires</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {LEASE_CONTRACT_TEMPLATES.mandatoryMentions.slice(0, 5).map((mention, index) => (
                  <li key={index}>{mention}</li>
                ))}
              </ul>
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
                    <p className="text-sm">Activer la clause de solidarité par défaut</p>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencySettings;
