import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle, DollarSign, CreditCard } from 'lucide-react';

interface ChargePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge: {
    id: string;
    type: string;
    description: string;
    period: string;
    amount: number;
    quotePart: number;
  } | null;
  onPayment: (chargeId: string, amount: number) => Promise<void>;
}

const ChargePaymentDialog: React.FC<ChargePaymentDialogProps> = ({
  open,
  onOpenChange,
  charge,
  onPayment
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');

  const handlePayment = async () => {
    if (!charge) return;
    
    setIsProcessing(true);
    try {
      await onPayment(charge.id, parseFloat(paymentAmount) || charge.quotePart);
      onOpenChange(false);
      setPaymentAmount('');
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!charge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement de la charge</DialogTitle>
          <DialogDescription>
            Réglez votre part de la charge "{charge.description}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Charge Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{charge.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Période</p>
                  <p className="font-medium">{charge.period}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant total</p>
                  <p className="font-medium">{charge.amount.toLocaleString()} €</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Votre quote-part</p>
                  <p className="font-bold text-primary">{charge.quotePart.toLocaleString()} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Mode de paiement</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  paymentMethod === 'card' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Carte bancaire</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                  paymentMethod === 'transfer' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Virement</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à payer</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={charge.quotePart.toString()}
                className="pl-8"
              />
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Laissez vide pour payer la totalité ({charge.quotePart.toLocaleString()} €)
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChargePaymentDialog;
