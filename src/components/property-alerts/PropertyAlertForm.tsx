import { useState, useEffect, useMemo } from "react";
import { Bell, Mail, Smartphone, MessageSquare, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cities, getNeighborhoodsForCity } from "@/data/properties";
import { SearchFiltersState } from "@/components/properties/SearchFilters";
import { NotificationChannel, propertyAlertService } from "@/services/property-alert.service";
import { useToast } from "@/hooks/use-toast";

interface PropertyAlertFormProps {
  onAlertCreated?: () => void;
  initialCriteria?: Partial<SearchFiltersState>;
}

const defaultFilters: SearchFiltersState = {
  city: "",
  neighborhood: "",
  minPrice: "",
  maxPrice: "",
  category: "all",
  bedrooms: "all",
  furnished: "tous",
  availability: "tous",
  availableFrom: "",
  sortBy: "date-desc",
};

function PropertyAlertForm({ onAlertCreated, initialCriteria }: PropertyAlertFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>(defaultFilters);
  const [channels, setChannels] = useState<NotificationChannel[]>(['email']);
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  // Charger les paramètres existants
  useEffect(() => {
    const settings = propertyAlertService.getNotificationSettings();
    setContactInfo({
      email: settings.email,
      phone: settings.phone,
    });
  }, []);

  // Utiliser les critères initiaux si fournis
  useEffect(() => {
    if (initialCriteria) {
      setFilters(prev => ({
        ...prev,
        city: initialCriteria.city || "",
        neighborhood: initialCriteria.neighborhood || "",
        minPrice: initialCriteria.minPrice || "",
        maxPrice: initialCriteria.maxPrice || "",
        category: initialCriteria.category || "all",
        bedrooms: initialCriteria.bedrooms || "all",
        furnished: initialCriteria.furnished || "tous",
        availability: initialCriteria.availability || "tous",
      }));
    }
  }, [initialCriteria]);

  const neighborhoods = useMemo(() => {
    return getNeighborhoodsForCity(filters.city);
  }, [filters.city]);

  const updateFilter = (key: keyof SearchFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateCity = (value: string) => {
    setFilters(prev => ({ ...prev, city: value, neighborhood: "" }));
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async () => {
    if (channels.length === 0) {
      toast({
        title: "Canal requis",
        description: "Veuillez sélectionner au moins un canal de notification",
        variant: "destructive",
      });
      return;
    }

    if (!contactInfo.email && channels.includes('email')) {
      toast({
        title: "Email requis",
        description: "Veuillez fournir une adresse email",
        variant: "destructive",
      });
      return;
    }

    if (!contactInfo.phone && (channels.includes('sms') || channels.includes('whatsapp'))) {
      toast({
        title: "Numéro requis",
        description: "Veuillez fournir un numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sauvegarder les paramètres de notification
      propertyAlertService.saveNotificationSettings({
        enableEmail: channels.includes('email'),
        enableSms: channels.includes('sms'),
        enableWhatsapp: channels.includes('whatsapp'),
        email: contactInfo.email,
        phone: contactInfo.phone,
      });

      // Convertir les filtres en critères
      const criteria = propertyAlertService.filtersToCriteria(filters);

      // Générer un nom basé sur les critères
      const alertName = [
        criteria.city || "Toutes villes",
        criteria.category === 'logement_entier' ? "Logement" : criteria.category === 'chambre' ? "Chambre" : "Bien",
      ].join(" ");

      // Créer l'alerte
      const userId = "guest_user";
      
      propertyAlertService.create({
        userId,
        name: alertName,
        criteria,
        channels,
        enabled: true,
      });

      toast({
        title: "Alerte créée",
        description: "Vous serez notifié lorsqu'un bien correspondant sera disponible",
      });

      setOpen(false);
      setFilters(defaultFilters);
      onAlertCreated?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'alerte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== "" && v !== "all" && v !== "tous" && v !== "date-desc"
  ).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Créer une alerte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une alerte immobilière</DialogTitle>
          <DialogDescription>
            Définissez vos critères de recherche et choisissez comment recevoir les alertes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Critères de recherche */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Critères de recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ville */}
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Select value={filters.city} onValueChange={updateCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quartier */}
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Select
                    value={filters.neighborhood}
                    onValueChange={(v) => updateFilter("neighborhood", v)}
                    disabled={!filters.city || neighborhoods.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoods.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix min */}
                <div className="space-y-2">
                  <Label>Prix min (FCFA)</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                  />
                </div>

                {/* Prix max */}
                <div className="space-y-2">
                  <Label>Prix max (FCFA)</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  />
                </div>

                {/* Type de bien */}
                <div className="space-y-2">
                  <Label>Type de bien</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(v) => updateFilter("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="logement_entier">Logement entier</SelectItem>
                      <SelectItem value="chambre">Chambre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chambres */}
                <div className="space-y-2">
                  <Label>Chambres</Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(v) => updateFilter("bedrooms", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="1">1 chambre</SelectItem>
                      <SelectItem value="2">2 chambres</SelectItem>
                      <SelectItem value="3">3 chambres</SelectItem>
                      <SelectItem value="4+">4+ chambres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtres actifs */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {filters.city && filters.city !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      {filters.city}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => updateCity("")} />
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      Min: {parseInt(filters.minPrice).toLocaleString()} CFA
                      <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("minPrice", "")} />
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      Max: {parseInt(filters.maxPrice).toLocaleString()} CFA
                      <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("maxPrice", "")} />
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vos coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canaux de notification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recevoir les alertes par</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Email */}
                <div className={`border rounded-lg p-4 flex-1 min-w-[150px] transition-colors ${
                  channels.includes('email') ? 'border-primary bg-primary/5' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="channel-email"
                      checked={channels.includes('email')}
                      onCheckedChange={() => toggleChannel('email')}
                    />
                    <Label htmlFor="channel-email" className="cursor-pointer flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                  </div>
                </div>

                {/* SMS */}
                <div className={`border rounded-lg p-4 flex-1 min-w-[150px] transition-colors ${
                  channels.includes('sms') ? 'border-primary bg-primary/5' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="channel-sms"
                      checked={channels.includes('sms')}
                      onCheckedChange={() => toggleChannel('sms')}
                    />
                    <Label htmlFor="channel-sms" className="cursor-pointer flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      SMS
                    </Label>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className={`border rounded-lg p-4 flex-1 min-w-[150px] transition-colors ${
                  channels.includes('whatsapp') ? 'border-primary bg-primary/5' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="channel-whatsapp"
                      checked={channels.includes('whatsapp')}
                      onCheckedChange={() => toggleChannel('whatsapp')}
                    />
                    <Label htmlFor="channel-whatsapp" className="cursor-pointer flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Créer l'alerte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for X icon (inline)
function X({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

export default PropertyAlertForm;
