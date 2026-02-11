import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, Info, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import tenantService from '../../services/tenant.service';
import { DepartureRequest } from '../../types/tenant';

interface DepartureRequestDialogProps {
  children: React.ReactNode;
  leaseEndDate: string;
  isColocation: boolean;
  onRequestSubmitted: (request: DepartureRequest) => void;
  existingRequest?: DepartureRequest | null;
}

const DEPARTURE_REASONS = [
  { value: 'job_change', label: 'Changement d\'emploi' },
  { value: 'relocation', label: 'Déménagement' },
  { value: 'family', label: 'Raisons familiales' },
  { value: 'financial', label: 'Raisons financières' },
  { value: 'studies', label: 'Fin d\'études' },
  { value: 'purchase', label: 'Achat d\'un bien' },
  { value: 'other', label: 'Autre' },
];

const NOTICE_PERIODS = [
  { days: 30, label: '1 mois (préavis légal)' },
  { days: 60, label: '2 mois' },
  { days: 90, label: '3 mois' },
];

const DepartureRequestDialog: React.FC<DepartureRequestDialogProps> = ({
  children,
  leaseEndDate,
  isColocation,
  onRequestSubmitted,
  existingRequest,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plannedDepartureDate, setPlannedDepartureDate] = useState('');
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);

  const leaseEnd = new Date(leaseEndDate);
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(leaseEnd);
  maxDate.setDate(leaseEnd.getDate());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plannedDepartureDate || !reason) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const request = await tenantService.submitDepartureRequest(
        plannedDepartureDate,
        reasonDetail || reason,
        noticePeriodDays
      );
      
      toast({
        title: 'Demande soumise',
        description: 'Votre demande de départ a été transmise avec succès.',
      });
      
      setIsOpen(false);
      resetForm();
      onRequestSubmitted(request);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de votre demande.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (existingRequest) {
      try {
        await tenantService.cancelDepartureRequest(existingRequest.id);
        toast({
          title: 'Demande annulée',
          description: 'Votre demande de départ a été annulée.',
        });
        setIsOpen(false);
        resetForm();
        onRequestSubmitted({ ...existingRequest, status: 'cancelled' } as any);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de l\'annulation.',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setPlannedDepartureDate('');
    setReason('');
    setReasonDetail('');
    setNoticePeriodDays(30);
  };

  const getMinDate = () => {
    const min = new Date();
    min.setDate(min.getDate() + 1);
    return min.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Demande de départ
          </DialogTitle>
          <DialogDescription>
            Soumettez votre demande de départ pour mettre fin à votre bail.
          </DialogDescription>
        </DialogHeader>

        {isColocation && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Départ en colocation</p>
                  <p className="text-sm text-blue-700">
                    Votre départ n'affectera pas les autres colocataires. Seul votre bail sera résilié.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Préavis légal</p>
                <p className="text-sm text-amber-700">
                  Le préavis minimum est de 1 mois (30 jours). Votre départ doit intervenir au plus tard le{' '}
                  {leaseEnd.toLocaleDateString('fr-FR')}.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedDepartureDate">Date de départ souhaitée *</Label>
            <input
              type="date"
              id="plannedDepartureDate"
              value={plannedDepartureDate}
              onChange={(e) => setPlannedDepartureDate(e.target.value)}
              min={getMinDate()}
              max={leaseEndDate}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif du départ *</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Sélectionnez un motif</option>
              {DEPARTURE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonDetail">Détails (optionnel)</Label>
            <Textarea
              id="reasonDetail"
              placeholder="Précisez les raisons de votre départ..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticePeriod">Durée du préavis</Label>
            <select
              id="noticePeriod"
              value={noticePeriodDays}
              onChange={(e) => setNoticePeriodDays(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {NOTICE_PERIODS.map((p) => (
                <option key={p.days} value={p.days}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-gray-50 border rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">Après votre départ :</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Un état des lieux de sortie sera programmé</li>
                  <li>Votre dépôt de garantie sera restitué sous 2 mois maximum</li>
                  {isColocation && <li>Les autres colocataires conservent leur bail</li>}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {existingRequest ? (
              <>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Fermer
                </Button>
                <Button type="button" variant="destructive" onClick={handleCancel}>
                  Annuler ma demande
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Traitement...' : 'Soumettre la demande'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartureRequestDialog;
