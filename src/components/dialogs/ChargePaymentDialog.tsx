import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Charge, DetailPaiement, STATUT_PAIEMENT_LABELS } from '@/types/charge';
import ChargesService from '@/services/charges.service';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Calendar, Check, X } from 'lucide-react';

interface ChargePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge?: Charge | null;
  onSuccess: () => void;
}

export function ChargePaymentDialog({ open, onOpenChange, charge, onSuccess }: ChargePaymentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsPaiement, setDetailsPaiement] = useState<DetailPaiement[]>([]);
  const [montantsPaiement, setMontantsPaiement] = useState<Record<string, number>>({});

  useEffect(() => {
    if (charge?.detailsPaiement) {
      setDetailsPaiement(charge.detailsPaiement);
      // Initialiser les montants de paiement avec les montants dus
      const initialMontants: Record<string, number> = {};
      charge.detailsPaiement.forEach(detail => {
        initialMontants[detail.colocataireId] = detail.montant;
      });
      setMontantsPaiement(initialMontants);
    } else {
      setDetailsPaiement([]);
      setMontantsPaiement({});
    }
  }, [charge]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleMontantChange = (colocataireId: string, value: string) => {
    const montant = parseFloat(value) || 0;
    setMontantsPaiement(prev => ({
      ...prev,
      [colocataireId]: montant
    }));
  };

  const handleMarquerPaye = async (detail: DetailPaiement) => {
    if (!charge) return;
    
    setIsSubmitting(true);
    try {
      const montant = montantsPaiement[detail.colocataireId] || detail.montant;
      await ChargesService.marquerPaiement(charge.id, detail.colocataireId, montant);
      
      toast({
        title: 'Succès',
        description: `Paiement enregistré pour ${detail.colocataireNom}`,
      });
      
      onSuccess();
      
      // Recharger les détails du paiement
      if (charge.detailsPaiement) {
        const updatedDetails = charge.detailsPaiement.map(d => {
          if (d.colocataireId === detail.colocataireId) {
            return {
              ...d,
              statut: montant >= d.montant ? 'paye' as const : 'partiel' as const,
              datePaiement: new Date().toISOString()
            };
          }
          return d;
        });
        setDetailsPaiement(updatedDetails);
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le paiement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!detailsPaiement.length) return 0;
    const totalPaye = detailsPaiement
      .filter(d => d.statut === 'paye')
      .reduce((sum, d) => sum + d.montant, 0);
    const total = detailsPaiement.reduce((sum, d) => sum + d.montant, 0);
    return total > 0 ? (totalPaye / total) * 100 : 0;
  };

  const getStatutBadge = (statut: string) => {
    const colors: Record<string, string> = {
      'impaye': 'bg-red-100 text-red-800',
      'partiel': 'bg-yellow-100 text-yellow-800',
      'paye': 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[statut] || ''} variant="secondary">
        {STATUT_PAIEMENT_LABELS[statut as keyof typeof STATUT_PAIEMENT_LABELS] || statut}
      </Badge>
    );
  };

  if (!charge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Suivi des paiements - {charge.description}</DialogTitle>
          <DialogDescription>
            Gérez les paiements des colocataires pour cette charge
          </DialogDescription>
        </DialogHeader>

        {/* Résumé */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Montant total</p>
            <p className="text-xl font-bold">{formatCurrency(charge.montantTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <span className="text-sm font-medium">{calculateProgress().toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mode de répartition</p>
            <p className="text-lg font-medium">
              {charge.modeRepartition === 'egal' && 'Égalitaire'}
              {charge.modeRepartition === 'prorata' && 'Au prorata'}
              {charge.modeRepartition === 'manuel' && 'Manuel'}
            </p>
          </div>
        </div>

        {/* Tableau des paiements */}
        <div className="space-y-4">
          <Label>Paiements par colocataire</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colocataire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date paiement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailsPaiement.map((detail) => (
                <TableRow key={detail.colocataireId}>
                  <TableCell className="font-medium">{detail.colocataireNom}</TableCell>
                  <TableCell>{formatCurrency(detail.montant)}</TableCell>
                  <TableCell>{getStatutBadge(detail.statut)}</TableCell>
                  <TableCell>
                    {detail.datePaiement ? formatDate(detail.datePaiement) : '-'}
                  </TableCell>
                  <TableCell>
                    {detail.statut !== 'paye' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarquerPaye(detail)}
                          disabled={isSubmitting}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marquer payé
                        </Button>
                      </div>
                    ) : (
                      <span className="text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Payé
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Informations sur la charge */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Période</p>
            <p className="font-medium">
              {formatDate(charge.periodeDebut)} - {formatDate(charge.periodeFin)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Échéance</p>
            <p className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(charge.dateEcheance)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChargePaymentDialog;
