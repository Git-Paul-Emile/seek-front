import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, MoreVertical, Building2, User, Calendar, DollarSign, PenTool, Download, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PageHeader from '@/components/layout/PageHeader';
import { managementMandateService } from '@/services/management-mandate.service';
import { CreateMandateInput, ManagementMandate, MandateService, DEFAULT_MANDATE_SERVICES } from '@/types/lease-contract';
import { ElectronicSignature } from '@/components/documents/ElectronicSignature';
import { generateSignatureInfo } from '@/lib/signature-utils';

// Mock data
const mockOwners = [
  { id: 'owner-1', fullName: 'Mamadou Diop', email: 'mamadou@email.com', phone: '77 123 45 67' },
  { id: 'owner-2', fullName: 'Fatou Sall', email: 'fatou@email.com', phone: '78 987 65 43' },
];

const mockProperties = [
  { id: 'prop-1', address: 'Rue 12, Cité Biagui', type: 'Appartement', surface: 75, rooms: 3 },
  { id: 'prop-2', address: 'Avenue Cheikh Anta Diop', type: 'Maison', surface: 120, rooms: 4 },
  { id: 'prop-3', address: 'Zone de Captage', type: 'Studio', surface: 35, rooms: 1 },
];

const mockAgency = { id: 'agency-1', name: 'Seek Immobilier' };

export function AgencyManagementMandates() {
  const { toast } = useToast();
  const [mandates, setMandates] = useState<ManagementMandate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [selectedMandate, setSelectedMandate] = useState<ManagementMandate | null>(null);
  const [signerRole, setSignerRole] = useState<'owner' | 'agency'>('agency');

  // Create form state
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [durationValue, setDurationValue] = useState('12');
  const [durationUnit, setDurationUnit] = useState<'months' | 'years'>('months');
  const [commissionPercentage, setCommissionPercentage] = useState('10');
  const [services, setServices] = useState<MandateService[]>(DEFAULT_MANDATE_SERVICES);
  const [terms, setTerms] = useState('');
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [autoRenewal, setAutoRenewal] = useState(false);

  useEffect(() => {
    loadMandates();
  }, []);

  const loadMandates = () => {
    const storedMandates = managementMandateService.getAll();
    setMandates(storedMandates);
  };

  const handleCreateMandate = () => {
    if (!selectedOwnerId || selectedPropertyIds.length === 0 || !startDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    const owner = mockOwners.find(o => o.id === selectedOwnerId);
    if (!owner) return;

    const input: CreateMandateInput = {
      ownerId: selectedOwnerId,
      propertyIds: selectedPropertyIds,
      startDate,
      duration: {
        value: parseInt(durationValue),
        unit: durationUnit,
      },
      commissionPercentage: parseFloat(commissionPercentage),
      services,
      terms,
      signatureEnabled,
      autoRenewal,
    };

    const properties = mockProperties.filter(p => selectedPropertyIds.includes(p.id));
    const newMandate = managementMandateService.create(input, owner, mockAgency, properties);
    setMandates([...mandates, newMandate]);
    setShowCreateDialog(false);
    resetForm();
    toast({
      title: 'Mandat créé',
      description: 'Le mandat de gestion a été créé avec succès.',
    });
  };

  const handleSign = (signatureData: string) => {
    if (!selectedMandate) return;

    const signatureInfo = generateSignatureInfo(signatureData, 'electronique');

    if (signerRole === 'agency') {
      managementMandateService.signAgency(selectedMandate.id, signatureData);
    } else {
      managementMandateService.signOwner(selectedMandate.id, signatureData);
    }

    loadMandates();
    setShowSignDialog(false);
    toast({
      title: 'Signature enregistrée',
      description: 'La signature a été enregistrée avec succès.',
    });
  };

  const handleTerminate = (mandateId: string) => {
    managementMandateService.terminate(mandateId);
    loadMandates();
    toast({
      title: 'Mandat résilié',
      description: 'Le mandat de gestion a été résilié avec succès.',
    });
  };

  const handleDelete = (mandateId: string) => {
    managementMandateService.delete(mandateId);
    loadMandates();
    toast({
      title: 'Mandat supprimé',
      description: 'Le mandat de gestion a été supprimé.',
    });
  };

  const resetForm = () => {
    setSelectedOwnerId('');
    setSelectedPropertyIds([]);
    setStartDate('');
    setDurationValue('12');
    setCommissionPercentage('10');
    setServices(DEFAULT_MANDATE_SERVICES);
    setTerms('');
    setSignatureEnabled(true);
    setAutoRenewal(false);
  };

  const toggleService = (serviceId: string) => {
    setServices(services.map(s =>
      s.id === serviceId ? { ...s, included: !s.included } : s
    ));
  };

  const filteredMandates = mandates.filter(mandate => {
    const matchesSearch =
      mandate.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.properties.some(p => p.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mandate.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || mandate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge variant="default">Actif</Badge>;
      case 'en_attente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'expire':
        return <Badge variant="destructive">Expiré</Badge>;
      case 'resilie':
        return <Badge variant="outline">Résilié</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Mandats de gestion"
        icon={FileText}
        description="Gérez les mandats de gestion avec les propriétaires"
        action={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Mandat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un mandat de gestion</DialogTitle>
                <DialogDescription>
                  Créez un nouveau mandat de gestion pour un propriétaire.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Owner Selection */}
                <div className="space-y-2">
                  <Label>Propriétaire</Label>
                  <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un propriétaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.fullName} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Properties Selection */}
                <div className="space-y-2">
                  <Label>Propriétés à gérer</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                    {mockProperties.map((property) => (
                      <div key={property.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${property.id}`}
                          checked={selectedPropertyIds.includes(property.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPropertyIds([...selectedPropertyIds, property.id]);
                            } else {
                              setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== property.id));
                            }
                          }}
                        />
                        <Label htmlFor={`property-${property.id}`} className="text-sm cursor-pointer">
                          {property.address}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durée du mandat</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        className="w-20"
                        min="1"
                      />
                      <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as 'months' | 'years')}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="months">Mois</SelectItem>
                          <SelectItem value="years">Années</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Commission */}
                <div className="space-y-2">
                  <Label>Commission (%)</Label>
                  <Input
                    type="number"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Commission sur les loyers perçus
                  </p>
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <Label>Services inclus</Label>
                  <div className="border rounded-md p-3 space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={service.included}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                          <Label htmlFor={`service-${service.id}`} className="text-sm">
                            {service.name}
                          </Label>
                        </div>
                        {service.price && (
                          <span className="text-xs text-muted-foreground">
                            {service.price}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-2">
                  <Label htmlFor="terms">Conditions particulières</Label>
                  <Textarea
                    id="terms"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Conditions spécifiques du mandat..."
                    rows={3}
                  />
                </div>

                {/* Options */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sigEnabled"
                      checked={signatureEnabled}
                      onCheckedChange={(c) => setSignatureEnabled(c as boolean)}
                    />
                    <Label htmlFor="sigEnabled">Signature électronique</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoRenew"
                      checked={autoRenewal}
                      onCheckedChange={(c) => setAutoRenewal(c as boolean)}
                    />
                    <Label htmlFor="autoRenew">Renouvellement auto</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateMandate}>
                  Créer le mandat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        Mandats de gestion
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mandats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mandates.filter(m => m.status === 'actif').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {mandates.filter(m => m.status === 'en_attente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission moy.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mandates.length > 0
                ? (mandates.reduce((sum, m) => sum + m.commissionPercentage, 0) / mandates.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par propriétaire, propriété..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="expire">Expiré</SelectItem>
            <SelectItem value="resilie">Résilié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mandates List */}
      <div className="grid gap-4">
        {filteredMandates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Aucun mandat trouvé</h3>
            <p className="text-muted-foreground">
              Créez votre premier mandat de gestion pour commencer.
            </p>
          </div>
        ) : (
          filteredMandates.map((mandate) => (
            <Card key={mandate.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Mandat de gestion</h3>
                      {getStatusBadge(mandate.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Propriétaire:</span>
                        <span className="font-medium">{mandate.owner.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Commission:</span>
                        <span className="font-medium">{mandate.commissionPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Biens:</span>
                        <span className="font-medium">
                          {mandate.properties.map(p => p.address).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expiration:</span>
                        <span className="font-medium">
                          {format(new Date(mandate.endDate), 'dd/MM/yyyy')}
                        </span>
                        {mandate.status === 'actif' && (
                          <span className="text-xs text-muted-foreground">
                            ({differenceInDays(new Date(mandate.endDate), new Date())} jours)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Signature Status */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <PenTool className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Signatures:</span>
                      </div>
                      <Badge variant={mandate.ownerSignature ? 'default' : 'outline'}>
                        Propriétaire
                      </Badge>
                      <Badge variant={mandate.agencySignature ? 'default' : 'outline'}>
                        Agence
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Référence: {mandate.id} • Créé le {format(new Date(mandate.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {mandate.status === 'en_attente' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedMandate(mandate);
                            setSignerRole('agency');
                            setShowSignDialog(true);
                          }}>
                            <PenTool className="h-4 w-4 mr-2" />
                            Signer (Agence)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedMandate(mandate);
                            setSignerRole('owner');
                            setShowSignDialog(true);
                          }}>
                            <PenTool className="h-4 w-4 mr-2" />
                            Signer (Propriétaire)
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </DropdownMenuItem>
                      {mandate.status === 'actif' && (
                        <DropdownMenuItem
                          onClick={() => handleTerminate(mandate.id)}
                          className="text-destructive"
                        >
                          Résilier le mandat
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(mandate.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Signature Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Signer le mandat</DialogTitle>
            <DialogDescription>
              Signez le mandat de gestion pour {signerRole === 'agency' ? "l'agence" : "le propriétaire"}.
            </DialogDescription>
          </DialogHeader>
          {selectedMandate && (
            <ElectronicSignature
              signerName={signerRole === 'agency' ? mockAgency.name : selectedMandate.owner.fullName}
              signerRole={signerRole === 'agency' ? 'Agence' : 'Propriétaire'}
              onSign={handleSign}
              onCancel={() => setShowSignDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
