import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChargeDialog } from '@/components/dialogs/ChargeDialog';
import { Charge, ChargeFilters, ChargeStats, TYPE_CHARGE_LABELS, MODE_REPARTITION_LABELS, STATUT_PAIEMENT_LABELS } from '@/types/charge';
import ChargesService from '@/services/charges.service';
import chargePdfService from '@/services/charge-pdf.service';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/PageHeader';
import { Receipt, Download, Plus } from 'lucide-react';

export default function ChargesPage() {
  const { toast } = useToast();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [stats, setStats] = useState<ChargeStats>({
    totalCharges: 0,
    montantTotal: 0,
    chargesPayees: 0,
    montantPaye: 0,
    chargesImpayees: 0,
    montantImpaye: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showChargeDialog, setShowChargeDialog] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [filters, setFilters] = useState<ChargeFilters>({});

  const loadCharges = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ChargesService.getAll(filters);
      setCharges(data);
    } catch {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de charger les charges', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await ChargesService.getStats(filters.bienId);
      setStats(statsData);
    } catch {
      console.error('Erreur lors du chargement des statistiques');
    }
  }, [filters.bienId]);

  useEffect(() => {
    loadCharges();
    loadStats();
  }, [loadCharges, loadStats]);

  const handleCreateCharge = () => {
    setSelectedCharge(null);
    setShowChargeDialog(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowChargeDialog(true);
  };

  const handleChargeSuccess = (charge: Charge) => {
    loadCharges();
    loadStats();
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
      try {
        await ChargesService.delete(chargeId);
        toast({ 
          title: 'Succès', 
          description: 'La charge a été supprimée avec succès' 
        });
        loadCharges();
        loadStats();
      } catch {
        toast({ 
          title: 'Erreur', 
          description: 'Impossible de supprimer la charge', 
          variant: 'destructive' 
        });
      }
    }
  };

  const handleDownloadPdf = async (charge: Charge) => {
    await chargePdfService.downloadChargePdf(charge);
  };

  const handleBulkDownload = async () => {
    await chargePdfService.downloadBulkChargesPdf(charges);
  };

  const handleMarquerPaiement = async (chargeId: string, colocataireId: string, montant: number) => {
    try {
      await ChargesService.marquerPaiement(chargeId, colocataireId, montant);
      toast({ 
        title: 'Succès', 
        description: 'Le paiement a été enregistré' 
      });
      loadCharges();
      loadStats();
    } catch {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'enregistrer le paiement', 
        variant: 'destructive' 
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatutBadge = (statut: Charge['statut']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      'brouillon': 'secondary',
      'envoye': 'outline',
      'partiel': 'outline',
      'paye': 'default',
    };
    
    const labels: Record<string, string> = {
      'brouillon': 'Brouillon',
      'envoye': 'Envoyé',
      'partiel': 'Partiel',
      'paye': 'Payé',
    };

    const colors: Record<string, string> = {
      'brouillon': '',
      'envoye': '',
      'partiel': 'bg-yellow-100 text-yellow-800',
      'paye': 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={colors[statut]} variant={variants[statut] || 'secondary'}>
        {labels[statut] || statut}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Gestion des charges"
        icon={Receipt}
        description="Gérez les charges locatives"
        action={
          <>
            <Button variant="outline" onClick={handleBulkDownload}>
              <Download className="mr-2 h-4 w-4" />
              Tout télécharger
            </Button>
            <Button onClick={handleCreateCharge}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une charge
            </Button>
          </>
        }
      >
        Gestion des charges
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalCharges}</div>
            <p className="text-sm text-gray-500">Total des charges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.montantTotal)}</div>
            <p className="text-sm text-gray-500">Montant total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.chargesPayees}</div>
            <p className="text-sm text-gray-500">Charges payées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.chargesImpayees}</div>
            <p className="text-sm text-gray-500">En attente/partiel</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Bien</Label>
              <Select 
                onValueChange={(value) => 
                  setFilters({ ...filters, bienId: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger><SelectValue placeholder="Tous les biens" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les biens</SelectItem>
                  <SelectItem value="bien-1">Appartement Dakar Plateau</SelectItem>
                  <SelectItem value="bien-2">Maison Sacré Cœur</SelectItem>
                  <SelectItem value="bien-3">Villa Almadies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type de charge</Label>
              <Select 
                onValueChange={(value) => 
                  setFilters({ ...filters, type: value === 'all' ? undefined : value as Charge['type'] })
                }
              >
                <SelectTrigger><SelectValue placeholder="Tous les types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(TYPE_CHARGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select 
                onValueChange={(value) => 
                  setFilters({ ...filters, statut: value === 'all' ? undefined : value as Charge['statut'] })
                }
              >
                <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="partiel">Partiel</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Période</Label>
              <Select 
                onValueChange={(value) => {
                  const now = new Date();
                  let dateDebut: string | undefined;
                  let dateFin: string | undefined;
                  
                  switch (value) {
                    case 'mois': {
                      dateDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                      dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
                      break;
                    }
                    case 'trimestre': {
                      const quarter = Math.floor(now.getMonth() / 3);
                      dateDebut = new Date(now.getFullYear(), quarter * 3, 1).toISOString();
                      dateFin = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString();
                      break;
                    }
                    case 'annee':
                      dateDebut = new Date(now.getFullYear(), 0, 1).toISOString();
                      dateFin = new Date(now.getFullYear(), 11, 31).toISOString();
                      break;
                  }
                  setFilters({ ...filters, dateDebut, dateFin });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Toutes les périodes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="mois">Ce mois</SelectItem>
                  <SelectItem value="trimestre">Ce trimestre</SelectItem>
                  <SelectItem value="annee">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des charges</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : charges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune charge trouvée</p>
              <Button onClick={handleCreateCharge}>Créer une charge</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Bien</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Répartition</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {TYPE_CHARGE_LABELS[charge.type] || charge.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{charge.description}</TableCell>
                    <TableCell>{charge.bienNom || 'Non spécifié'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(charge.montantTotal)}</TableCell>
                    <TableCell>
                      {formatDate(charge.periodeDebut)} - {formatDate(charge.periodeFin)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {MODE_REPARTITION_LABELS[charge.modeRepartition]}
                      </span>
                    </TableCell>
                    <TableCell>{getStatutBadge(charge.statut)}</TableCell>
                    <TableCell>{formatDate(charge.dateEcheance)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownloadPdf(charge)}
                          title="Télécharger PDF"
                        >
                          PDF
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditCharge(charge)}
                          title="Modifier"
                        >
                          Modifier
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteCharge(charge.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Charge Dialog */}
      <ChargeDialog 
        open={showChargeDialog} 
        onOpenChange={setShowChargeDialog}
        charge={selectedCharge}
        onSuccess={handleChargeSuccess}
      />
    </div>
  );
}
