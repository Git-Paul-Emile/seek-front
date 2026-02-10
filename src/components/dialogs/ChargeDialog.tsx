import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Charge, TypeCharge, ModeRepartition, TYPE_CHARGE_LABELS, MODE_REPARTITION_LABELS, CreateChargeData } from '@/types/charge';
import { useToast } from '@/hooks/use-toast';
import ChargesService from '@/services/charges.service';

// Schéma de validation pour le formulaire
const chargeSchema = z.object({
  bienId: z.string().min(1, 'Veuillez sélectionner un bien'),
  type: z.string().min(1, 'Veuillez sélectionner un type de charge'),
  description: z.string().min(1, 'La description est requise'),
  montantTotal: z.number().min(1, 'Le montant doit être supérieur à 0'),
  dateEcheance: z.string().min(1, 'La date d\'échéance est requise'),
  periodeDebut: z.string().min(1, 'La date de début de période est requise'),
  periodeFin: z.string().min(1, 'La date de fin de période est requise'),
  modeRepartition: z.enum(['egal', 'prorata', 'manuel']),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

// Données de démonstration pour les biens
const demoBiens = [
  { id: 'bien-1', nom: 'Appartement Dakar Plateau' },
  { id: 'bien-2', nom: 'Maison Sacré Cœur' },
  { id: 'bien-3', nom: 'Villa Almadies' },
];

// Données de démonstration pour les colocataires
const demoColocataires = [
  { id: 'colocataire-1', nom: 'Jean Dupont' },
  { id: 'colocataire-2', nom: 'Marie Martin' },
  { id: 'colocataire-3', nom: 'Pierre Durand' },
  { id: 'colocataire-4', nom: 'Sophie Leblanc' },
];

interface ChargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge?: Charge | null;
  onSuccess: (charge: Charge) => void;
}

export function ChargeDialog({ open, onOpenChange, charge, onSuccess }: ChargeDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repartitionManuelle, setRepartitionManuelle] = useState<{ colocataireId: string; montant: number }[]>([]);

  const isEditing = !!charge;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      bienId: '',
      type: '' as TypeCharge,
      description: '',
      montantTotal: 0,
      dateEcheance: '',
      periodeDebut: '',
      periodeFin: '',
      modeRepartition: 'egal' as ModeRepartition,
    },
  });

  const modeRepartition = watch('modeRepartition');
  const montantTotal = watch('montantTotal');

  // Charger les données de la charge en mode édition
  useEffect(() => {
    if (charge) {
      setValue('bienId', charge.bienId);
      setValue('type', charge.type);
      setValue('description', charge.description);
      setValue('montantTotal', charge.montantTotal);
      setValue('dateEcheance', charge.dateEcheance.split('T')[0]);
      setValue('periodeDebut', charge.periodeDebut.split('T')[0]);
      setValue('periodeFin', charge.periodeFin.split('T')[0]);
      setValue('modeRepartition', charge.modeRepartition);
      
      if (charge.repartitionManuelle) {
        setRepartitionManuelle(charge.repartitionManuelle);
      }
    } else {
      reset({
        bienId: '',
        type: '' as TypeCharge,
        description: '',
        montantTotal: 0,
        dateEcheance: '',
        periodeDebut: '',
        periodeFin: '',
        modeRepartition: 'egal' as ModeRepartition,
      });
      setRepartitionManuelle([]);
    }
  }, [charge, setValue, reset]);

  // Calculer la répartition automatique
  useEffect(() => {
    if (modeRepartition !== 'manuel' && montantTotal > 0) {
      const parts = demoColocataires.map(c => ({
        colocataireId: c.id,
        montant: Math.round(montantTotal / demoColocataires.length),
      }));
      setRepartitionManuelle(parts);
    }
  }, [modeRepartition, montantTotal]);

  // Gérer le changement de montant en répartition manuelle
  const handleManualMontantChange = (colocataireId: string, value: string) => {
    const montant = parseFloat(value) || 0;
    setRepartitionManuelle(prev => 
      prev.map(r => 
        r.colocataireId === colocataireId ? { ...r, montant } : r
      )
    );
  };

  // Calculer le total de la répartition manuelle
  const totalRepartition = repartitionManuelle.reduce((sum, r) => sum + r.montant, 0);
  const ecart = montantTotal - totalRepartition;

  const onSubmit = async (data: ChargeFormData) => {
    setIsSubmitting(true);
    try {
      const chargeData: CreateChargeData = {
        bienId: data.bienId,
        type: data.type as TypeCharge,
        description: data.description,
        montantTotal: data.montantTotal,
        dateEcheance: data.dateEcheance,
        periodeDebut: data.periodeDebut,
        periodeFin: data.periodeFin,
        modeRepartition: data.modeRepartition,
        repartitionManuelle: modeRepartition === 'manuel' ? repartitionManuelle : undefined,
      };

      let result: Charge;
      if (isEditing && charge) {
        result = await ChargesService.update(charge.id, chargeData) as Charge;
      } else {
        result = await ChargesService.create(chargeData);
      }

      toast({
        title: isEditing ? 'Charge modifiée' : 'Charge créée',
        description: `La ${isEditing ? 'modification' : 'création'} de la charge a été effectuée avec succès.`,
      });
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'opération.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la charge' : 'Ajouter une charge'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations de la charge ci-dessous.'
              : 'Remplissez les informations pour créer une nouvelle charge.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Sélection du bien */}
          <div className="space-y-2">
            <Label htmlFor="bienId">Bien concerné *</Label>
            <Select
              value={watch('bienId')}
              onValueChange={(value) => setValue('bienId', value)}
            >
              <SelectTrigger id="bienId">
                <SelectValue placeholder="Sélectionner un bien" />
              </SelectTrigger>
              <SelectContent>
                {demoBiens.map((bien) => (
                  <SelectItem key={bien.id} value={bien.id}>
                    {bien.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bienId && (
              <p className="text-sm text-red-500">{errors.bienId.message}</p>
            )}
          </div>

          {/* Type de charge */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de charge *</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_CHARGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Description de la charge..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Montant total */}
          <div className="space-y-2">
            <Label htmlFor="montantTotal">Montant total (XOF) *</Label>
            <Input
              id="montantTotal"
              type="number"
              placeholder="0"
              {...register('montantTotal', { valueAsNumber: true })}
            />
            {errors.montantTotal && (
              <p className="text-sm text-red-500">{errors.montantTotal.message}</p>
            )}
          </div>

          {/* Dates de période */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodeDebut">Période du *</Label>
              <Input
                id="periodeDebut"
                type="date"
                {...register('periodeDebut')}
              />
              {errors.periodeDebut && (
                <p className="text-sm text-red-500">{errors.periodeDebut.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodeFin">Période au *</Label>
              <Input
                id="periodeFin"
                type="date"
                {...register('periodeFin')}
              />
              {errors.periodeFin && (
                <p className="text-sm text-red-500">{errors.periodeFin.message}</p>
              )}
            </div>
          </div>

          {/* Date d'échéance */}
          <div className="space-y-2">
            <Label htmlFor="dateEcheance">Date d'échéance *</Label>
            <Input
              id="dateEcheance"
              type="date"
              {...register('dateEcheance')}
            />
            {errors.dateEcheance && (
              <p className="text-sm text-red-500">{errors.dateEcheance.message}</p>
            )}
          </div>

          {/* Mode de répartition */}
          <div className="space-y-2">
            <Label>Mode de répartition *</Label>
            <div className="flex gap-4">
              {Object.entries(MODE_REPARTITION_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    checked={modeRepartition === value}
                    onChange={() => setValue('modeRepartition', value as ModeRepartition)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Répartition manuelle */}
          {modeRepartition === 'manuel' && (
            <div className="space-y-2">
              <Label>Répartition manuelle entre les colocataires</Label>
              <div className="border rounded-md p-3 space-y-2">
                {demoColocataires.map((colocataire) => {
                  const repartition = repartitionManuelle.find(r => r.colocataireId === colocataire.id);
                  const montant = repartition?.montant || 0;
                  
                  return (
                    <div key={colocataire.id} className="flex items-center gap-4">
                      <span className="w-32 text-sm">{colocataire.nom}</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={montant}
                        onChange={(e) => handleManualMontantChange(colocataire.id, e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500 w-20">
                        {montant > 0 ? ((montant / montantTotal) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Total réparti:</span>
                  <span className={`text-sm font-medium ${ecart !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {totalRepartition.toLocaleString()} XOF
                  </span>
                </div>
                {ecart !== 0 && (
                  <p className="text-sm text-red-500">Écart: {ecart.toLocaleString()} XOF</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChargeDialog;
