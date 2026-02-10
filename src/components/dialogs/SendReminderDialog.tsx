import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  User,
  Loader2,
} from 'lucide-react';
import { RentPayment } from '@/types/rent-payment';
import { reminderService } from '@/services/reminder.service';
import { NotificationChannel, ReminderType } from '@/types/reminder';
import { useToast } from '@/components/ui/use-toast';

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: RentPayment | null;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  mode: 'individual' | 'bulk';
  payments?: RentPayment[];
  onSent?: () => void;
}

export function SendReminderDialog({
  open,
  onOpenChange,
  payment,
  tenantName,
  tenantEmail,
  tenantPhone,
  mode,
  payments,
  onSent,
}: SendReminderDialogProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('whatsapp');
  const [reminderType, setReminderType] = useState<ReminderType>('after_due');

  const handleSend = async () => {
    setSending(true);
    try {
      if (mode === 'individual' && payment) {
        await reminderService.sendReminder(
          {
            paymentId: payment.id,
            channel: selectedChannel,
            type: reminderType,
          },
          tenantName,
          tenantEmail,
          tenantPhone
        );
        toast({
          title: 'Relance envoyée',
          description: `La relance a été envoyée à ${tenantName} par ${selectedChannel}.`,
        });
      } else if (mode === 'bulk' && payments) {
        const paymentsWithInfo = payments.map((p) => ({
          payment: p,
          tenantName: tenantName,
          tenantEmail,
          tenantPhone,
        }));
        const result = await reminderService.sendBulkReminders(
          {
            paymentIds: payments.map((p) => p.id),
            channel: selectedChannel,
            type: reminderType,
          },
          paymentsWithInfo
        );
        toast({
          title: 'Relances envoyées',
          description: `${result.successful} sur ${result.total} relances envoyées avec succès.`,
        });
      }
      onOpenChange(false);
      onSent?.();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi des relances.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderPaymentInfo = (p: RentPayment) => (
    <div key={p.id} className="p-3 bg-muted rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{tenantName}</p>
          <p className="text-sm text-muted-foreground">
            Échéance: {format(new Date(p.dueDate), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
        <Badge variant={p.status === 'en_retard' ? 'destructive' : 'secondary'}>
          {formatCurrency(p.amount)}
        </Badge>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'individual' ? (
              <User className="h-5 w-5" />
            ) : (
              <Users className="h-5 w-5" />
            )}
            {mode === 'individual' ? 'Envoyer une relance' : 'Envoyer des relances groupées'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'individual'
              ? `Envoyer une relance pour le loyer de ${tenantName}`
              : `Envoyer des relances pour ${payments?.length} paiement(s)`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informations du/des paiement(s) */}
          <div className="space-y-2">
            <Label>Détails du paiement</Label>
            {mode === 'individual' && payment && renderPaymentInfo(payment)}
            {mode === 'bulk' && payments?.map((p) => renderPaymentInfo(p))}
          </div>

          {/* Type de relance */}
          <div className="space-y-2">
            <Label>Type de notification</Label>
            <RadioGroup
              value={reminderType}
              onValueChange={(value) => setReminderType(value as ReminderType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="before_due" id="before_due" />
                <Label htmlFor="before_due" className="cursor-pointer">
                  Rappel avant échéance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after_due" id="after_due" />
                <Label htmlFor="after_due" className="cursor-pointer">
                  Relance retard
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Canal d'envoi */}
          <div className="space-y-2">
            <Label>Canal d'envoi</Label>
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedChannel === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedChannel('email')}
              >
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Email</span>
              </div>

              <div
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedChannel === 'whatsapp'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedChannel('whatsapp')}
              >
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">WhatsApp</span>
              </div>

              <div
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedChannel === 'sms'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedChannel('sms')}
              >
                <Smartphone className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">SMS</span>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          {(tenantEmail || tenantPhone) && (
            <div className="space-y-2">
              <Label>Coordonnées du destinataire</Label>
              <div className="flex gap-2 text-sm text-muted-foreground">
                {tenantEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {tenantEmail}
                  </div>
                )}
                {tenantPhone && (
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    {tenantPhone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                {selectedChannel === 'email' && <Mail className="mr-2 h-4 w-4" />}
                {selectedChannel === 'whatsapp' && <MessageSquare className="mr-2 h-4 w-4" />}
                {selectedChannel === 'sms' && <Smartphone className="mr-2 h-4 w-4" />}
                Envoyer par {selectedChannel === 'email' ? 'email' : selectedChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
