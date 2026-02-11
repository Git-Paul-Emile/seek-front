import React, { useEffect, useState } from 'react';
import { 
  Receipt, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Droplets, 
  Zap, 
  Wifi, 
  ChevronDown, 
  ChevronUp,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import PageHeader from '../components/layout/PageHeader';
import ChargePaymentDialog from '../components/dialogs/ChargePaymentDialog';
import chargesService from '../services/charges.service';
import tenantAuthService from '../services/tenant-auth.service';
import { TYPE_CHARGE_LABELS, STATUT_PAIEMENT_LABELS, ModeRepartition, Charge } from '../types/charge';

// Types pour les charges du colocataire
interface TenantCharge {
  id: string;
  type: string;
  description: string;
  period: string;
  amount: number;
  quotePart: number;
  status: 'paid' | 'pending' | 'partial';
  modeRepartition: ModeRepartition;
  totalAmount: number;
  dueDate: string;
}

const TenantCharges: React.FC = () => {
  const [charges, setCharges] = useState<TenantCharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedCharge, setExpandedCharge] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<TenantCharge | null>(null);
  const [paymentEnabled, setPaymentEnabled] = useState(true); // À configurable selon les settings

  // Simuler les données de charges pour le colocataire actuel
  const currentTenantId = 'colocataire-1'; // À remplacer par l'ID réel du colocataire connecté

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      setIsLoading(true);
      // Récupérer toutes les charges depuis le service
      const allCharges = await chargesService.getAll();
      
      // Filtrer pour le colocataire actuel et transformer les données
      const tenantCharges: TenantCharge[] = allCharges
        .filter(charge => {
          // Vérifier si le colocataire est concerné par cette charge
          if (charge.detailsPaiement) {
            return charge.detailsPaiement.some(dp => dp.colocataireId === currentTenantId);
          }
          return false;
        })
        .map(charge => {
          const detail = charge.detailsPaiement?.find(dp => dp.colocataireId === currentTenantId);
          const period = `${new Date(charge.periodeDebut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(charge.periodeFin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
          
          return {
            id: charge.id,
            type: charge.type,
            description: charge.description,
            period,
            amount: detail?.montant || 0,
            quotePart: detail?.montant || 0,
            status: detail?.statut === 'paye' ? 'paid' : detail?.statut === 'partiel' ? 'partial' : 'pending',
            modeRepartition: charge.modeRepartition,
            totalAmount: charge.montantTotal,
            dueDate: charge.dateEcheance
          };
        });

      setCharges(tenantCharges);
    } catch (error) {
      console.error('Erreur:', error);
      // Données de démonstration en cas d'erreur
      setCharges(getDemoCharges());
    } finally {
      setIsLoading(false);
    }
  };

  // Données de démonstration
  const getDemoCharges = (): TenantCharge[] => [
    {
      id: '1',
      type: 'eau',
      description: 'Facture d\'eau - Trimestre 1',
      period: 'Janv. - Mars 2024',
      amount: 22500,
      quotePart: 22500,
      status: 'pending',
      modeRepartition: 'egal',
      totalAmount: 45000,
      dueDate: '2024-02-15'
    },
    {
      id: '2',
      type: 'electricite',
      description: 'Électricité - Janvier 2024',
      period: 'Janv. 2024',
      amount: 30000,
      quotePart: 30000,
      status: 'paid',
      modeRepartition: 'prorata',
      totalAmount: 75000,
      dueDate: '2024-03-01'
    },
    {
      id: '3',
      type: 'internet',
      description: 'Internet mensuel',
      period: 'Févr. 2024',
      amount: 12500,
      quotePart: 12500,
      status: 'pending',
      modeRepartition: 'egal',
      totalAmount: 25000,
      dueDate: '2024-03-01'
    },
    {
      id: '4',
      type: 'eau',
      description: 'Facture d\'eau - Trimestre 4',
      period: 'Oct. - Déc. 2023',
      amount: 20000,
      quotePart: 20000,
      status: 'paid',
      modeRepartition: 'egal',
      totalAmount: 40000,
      dueDate: '2024-01-15'
    },
    {
      id: '5',
      type: 'electricite',
      description: 'Électricité - Février 2024',
      period: 'Févr. 2024',
      amount: 35000,
      quotePart: 35000,
      status: 'partial',
      modeRepartition: 'prorata',
      totalAmount: 70000,
      dueDate: '2024-03-15'
    }
  ];

  const filteredCharges = selectedType === 'all' 
    ? charges 
    : charges.filter(c => c.type === selectedType);

  const pendingCharges = filteredCharges.filter(c => c.status === 'pending' || c.status === 'partial');
  const paidCharges = filteredCharges.filter(c => c.status === 'paid');

  const totalPending = pendingCharges.reduce((sum, c) => sum + c.quotePart, 0);
  const totalPaid = paidCharges.reduce((sum, c) => sum + c.quotePart, 0);
  const totalAll = filteredCharges.reduce((sum, c) => sum + c.quotePart, 0);

  const handlePayment = async (chargeId: string, amount: number) => {
    try {
      // Simuler le paiement
      console.log(`Paiement de ${amount} € pour la charge ${chargeId}`);
      
      // Mettre à jour la charge dans la liste
      setCharges(prev => prev.map(c => 
        c.id === chargeId ? { ...c, status: 'paid' as const } : c
      ));
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      throw error;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'eau': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'electricite': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'internet': return <Wifi className="h-4 w-4 text-green-500" />;
      default: return <Receipt className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Payé
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            Partiel
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent>
            <div className="h-64 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CHARGES"
        icon={FileText}
        description="Gérez vos charges de colocation"
      >
        <h1 className="text-3xl font-bold tracking-tight">Mes charges</h1>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {totalPending.toLocaleString()} €
            </p>
            <p className="text-xs text-muted-foreground">
              {pendingCharges.length} charge(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {totalPaid.toLocaleString()} €
            </p>
            <p className="text-xs text-muted-foreground">
              {paidCharges.length} charge(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalAll.toLocaleString()} €
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredCharges.length} charge(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="eau">Eau</TabsTrigger>
          <TabsTrigger value="electricite">Électricité</TabsTrigger>
          <TabsTrigger value="internet">Internet</TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4 mt-4">
          {/* Charges Table */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des charges</CardTitle>
              <CardDescription>
                Liste de vos charges - Quote-part : <strong>{TYPE_CHARGE_LABELS[currentTenantId as keyof typeof TYPE_CHARGE_LABELS] || 'Égalitaire'}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCharges.length > 0 ? (
                <div className="space-y-4">
                  {filteredCharges.map((charge) => (
                    <div key={charge.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(charge.type)}
                          <div>
                            <p className="font-medium">{charge.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {charge.period} • Échéance: {new Date(charge.dueDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">{charge.quotePart.toLocaleString()} €</p>
                            <p className="text-xs text-muted-foreground">
                              sur {charge.totalAmount.toLocaleString()} € total
                            </p>
                          </div>
                          {getStatusBadge(charge.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedCharge(expandedCharge === charge.id ? null : charge.id)}
                          >
                            {expandedCharge === charge.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedCharge === charge.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Type de charge</p>
                              <p className="font-medium">{TYPE_CHARGE_LABELS[charge.type as keyof typeof TYPE_CHARGE_LABELS]}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Mode de répartition</p>
                              <p className="font-medium capitalize">
                                {charge.modeRepartition === 'egal' ? 'Égalitaire' : 
                                 charge.modeRepartition === 'prorata' ? 'Au prorata' : 'Manuel'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Montant total</p>
                              <p className="font-medium">{charge.totalAmount.toLocaleString()} €</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Votre quote-part</p>
                              <p className="font-medium text-primary">{charge.quotePart.toLocaleString()} €</p>
                            </div>
                          </div>

                          {/* Progress Bar for Partial Status */}
                          {charge.status === 'partial' && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progression du paiement</span>
                                <span>50%</span>
                              </div>
                              <Progress value={50} className="h-2" />
                            </div>
                          )}

                          {/* Payment Button */}
                          {charge.status !== 'paid' && paymentEnabled && (
                            <div className="mt-4 flex justify-end">
                              <Button 
                                onClick={() => {
                                  setSelectedCharge(charge);
                                  setPaymentDialogOpen(true);
                                }}
                              >
                                Payer ma part ({charge.quotePart.toLocaleString()} €)
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 mb-4" />
                  <p>Aucune charge trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Explanations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Explications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <p className="font-medium">Eau</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Consommation d'eau froide et chaude. Répartition égale entre les colocataires.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <p className="font-medium">Électricité</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Consommation électrique du logement (parties communes et privatives).
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <p className="font-medium">Internet</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Abonnement internet mensuel partagé entre tous les occupants.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <ChargePaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        charge={selectedCharge}
        onPayment={handlePayment}
      />
    </div>
  );
};

export default TenantCharges;
