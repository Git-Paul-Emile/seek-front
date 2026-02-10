import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, DollarSign, FileText, AlertCircle, CheckCircle, Clock, Wallet, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RentPayment, PaymentMethod, CreatePaymentInput, RefundStatus } from '@/types/rent-payment';
import { rentPaymentsService } from '@/services/rent-payments.service';
import { leaseContractsService } from '@/services/lease-contracts.service';
import { LeaseContract } from '@/types/lease-contract';

interface RentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: RentPayment | null;
  contractId?: string;
  onSave: () => void;
  mode?: 'payment' | 'refund' | 'partial';
}

export function RentPaymentDialog({ 
  open, 
  onOpenChange, 
  payment, 
  contractId, 
  onSave,
  mode = 'payment'
}: RentPaymentDialogProps) {
  const [contracts, setContracts] = useState<LeaseContract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState(contractId || '');
  const [showMarkUnpaidDialog, setShowMarkUnpaidDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundDate, setRefundDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [refundNotes, setRefundNotes] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    paidAmount: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: '' as PaymentMethod | '',
    paidDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    lateFee: '',
    isPartial: false,
    securityDepositStatus: '' as RefundStatus | '',
    securityDepositRefundAmount: '',
    securityDepositRefundDate: format(new Date(), 'yyyy-MM-dd'),
    securityDepositNotes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Charger les contrats actifs
    const activeContracts = leaseContractsService.getActiveContracts();
    setContracts(activeContracts);
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        paidAmount: payment.amountPaid.toString() || payment.amount.toString(),
        dueDate: payment.dueDate.split('T')[0],
        paymentMethod: payment.paymentMethod || '',
        paidDate: payment.paidDate?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
        description: payment.description || '',
        lateFee: payment.lateFee?.toString() || '',
        isPartial: payment.isPartial,
        securityDepositStatus: payment.securityDepositStatus || '',
        securityDepositRefundAmount: payment.securityDepositRefundAmount?.toString() || '',
        securityDepositRefundDate: payment.securityDepositRefundDate?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
        securityDepositNotes: payment.securityDepositNotes || '',
      });
    } else if (contractId) {
      setSelectedContractId(contractId);
      // Pré-remplir avec le montant du contrat
      const contract = leaseContractsService.getById(contractId);
      if (contract) {
        setFormData(prev => ({
          ...prev,
          amount: contract.rentAmount.toString(),
          paidAmount: contract.rentAmount.toString(),
          dueDate: format(new Date(contract.startDate), 'yyyy-MM-dd'),
        }));
      }
    } else {
      setFormData({
        amount: '',
        paidAmount: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: '',
        paidDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        lateFee: '',
        isPartial: false,
        securityDepositStatus: '',
        securityDepositRefundAmount: '',
        securityDepositRefundDate: format(new Date(), 'yyyy-MM-dd'),
        securityDepositNotes: '',
      });
    }
  }, [payment, contractId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedContractId && !payment && mode === 'payment') {
      newErrors.contract = 'Veuillez sélectionner un contrat';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être un nombre positif';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (payment) {
        // Mise à jour du paiement existant
        const updateData: Parameters<typeof rentPaymentsService.update>[0] = {
          paymentId: payment.id,
          amount: parseFloat(formData.amount),
          description: formData.description,
        };

        if (payment.status === 'paye') {
          updateData.paymentMethod = formData.paymentMethod as PaymentMethod;
          updateData.paidDate = formData.paidDate;
        }

        if (formData.lateFee) {
          updateData.lateFee = parseFloat(formData.lateFee);
        }

        rentPaymentsService.update(updateData);
      } else {
        // Création d'un nouveau paiement
        const createInput: CreatePaymentInput = {
          contractId: selectedContractId,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          description: formData.description,
          isPartial: formData.isPartial,
        };
        rentPaymentsService.create(createInput);
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!payment) return;

    if (!formData.paymentMethod) {
      setErrors({ paymentMethod: 'Veuillez sélectionner un mode de paiement' });
      return;
    }

    setIsSubmitting(true);
    try {
      const paidAmount = formData.isPartial && payment 
        ? parseFloat(formData.paidAmount) 
        : payment.amount;
      
      rentPaymentsService.markAsPaidWithPartial(
        payment.id, 
        formData.paymentMethod as PaymentMethod,
        paidAmount,
        formData.paidDate
      );
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du marquage comme payé:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsUnpaid = async () => {
    if (!payment) return;

    setIsSubmitting(true);
    try {
      rentPaymentsService.markAsUnpaid(payment.id);
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du marquage comme impayé:', error);
    } finally {
      setIsSubmitting(false);
      setShowMarkUnpaidDialog(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!payment) return;

    setIsSubmitting(true);
    try {
      rentPaymentsService.requestSecurityDepositRefund(payment.id, formData.securityDepositNotes);
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la demande de remboursement:', error);
    } finally {
      setIsSubmitting(false);
      setShowRefundDialog(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!payment) return;
    if (!refundAmount || isNaN(parseFloat(refundAmount))) {
      return;
    }

    setIsSubmitting(true);
    try {
      rentPaymentsService.refundSecurityDeposit({
        paymentId: payment.id,
        refundAmount: parseFloat(refundAmount),
        refundDate: refundDate,
        notes: refundNotes,
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
    } finally {
      setIsSubmitting(false);
      setShowRefundDialog(false);
    }
  };

  const handleApproveRefund = async () => {
    if (!payment) return;

    setIsSubmitting(true);
    try {
      rentPaymentsService.approveSecurityDepositRefund(payment.id);
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de l\'approbation du remboursement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!payment) return null;

    switch (payment.status) {
      case 'paye':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Payé
          </span>
        );
      case 'partiel':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Partiel ({formatCurrency(payment.amountPaid)}/{formatCurrency(payment.amount)})
          </span>
        );
      case 'en_retard':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            En retard
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };

  const getSecurityDepositStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'aucun':
        return <span className="text-gray-500">Non demandé</span>;
      case 'demande':
        return <span className="text-yellow-600 font-medium">En attente d'approbation</span>;
      case 'approuve':
        return <span className="text-blue-600 font-medium">Approuvé</span>;
      case 'rembourse':
        return <span className="text-green-600 font-medium">Remboursé</span>;
      case 'refuse':
        return <span className="text-red-600 font-medium">Refusé</span>;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canMarkAsPaid = payment && payment.status !== 'paye';
  const canMarkAsUnpaid = payment && payment.status === 'paye';
  const canRequestRefund = payment && payment.securityDeposit && payment.securityDepositStatus === 'aucun';
  const canProcessRefund = payment && payment.securityDepositStatus === 'approuve';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {payment 
                ? mode === 'refund' 
                  ? 'Gestion de la caution' 
                  : mode === 'partial'
                  ? 'Paiement partiel'
                  : 'Modifier le loyer'
                : 'Nouveau paiement de loyer'
              }
            </DialogTitle>
            <DialogDescription>
              {payment
                ? `Paiement du ${format(new Date(payment.dueDate), 'MMMM yyyy', { locale: fr })}`
                : 'Enregistrer un nouveau paiement de loyer'}
            </DialogDescription>
          </DialogHeader>

          {payment && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Statut actuel</p>
                  {getStatusBadge()}
                </div>
                {payment.lateFee && payment.lateFee > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pénalité de retard</p>
                    <p className="text-red-600 font-semibold">{formatCurrency(payment.lateFee)} CFA</p>
                  </div>
                )}
              </div>
              
              {/* Informations de paiement */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Montant dû</p>
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Montant payé</p>
                  <p className="font-medium">{formatCurrency(payment.amountPaid)}</p>
                </div>
                {payment.isPartial && (
                  <div>
                    <p className="text-gray-500">Reste à payer</p>
                    <p className="font-medium text-blue-600">{formatCurrency(payment.remainingAmount)}</p>
                  </div>
                )}
              </div>

              {/* Caution */}
              {payment.securityDeposit && payment.securityDeposit > 0 && (
                <div className="border-t pt-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Caution:</span>
                      <span className="text-sm">{formatCurrency(payment.securityDeposit)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Statut:</p>
                      {getSecurityDepositStatusBadge(payment.securityDepositStatus)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 py-4">
            {!payment && mode === 'payment' && (
              <div className="space-y-2">
                <Label htmlFor="contractId">Contrat de bail</Label>
                <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contrat..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.property.address} - {contract.tenants.map(t => t.fullName).join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contract && <p className="text-sm text-red-500">{errors.contract}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant du loyer (CFA)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="50000"
                    className="pl-9"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    disabled={payment?.status === 'paye' && !formData.isPartial}
                  />
                </div>
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    disabled={payment?.status === 'paye'}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
              </div>
            </div>

            {/* Paiement partiel */}
            {canMarkAsPaid && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPartial"
                    checked={formData.isPartial}
                    onChange={(e) => setFormData({ ...formData, isPartial: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPartial">Paiement partiel</Label>
                </div>
                
                {formData.isPartial && (
                  <div className="pl-6">
                    <Label htmlFor="paidAmount">Montant payé (CFA)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="paidAmount"
                        type="number"
                        placeholder="25000"
                        className="pl-9"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reste à payer: {payment ? formatCurrency(payment.amount - (parseFloat(formData.paidAmount) || 0)) : '0'} CFA
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                placeholder="Notes sur ce paiement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {payment && payment.status !== 'paye' && (
              <div className="space-y-2">
                <Label htmlFor="lateFee">Pénalité de retard (CFA)</Label>
                <Input
                  id="lateFee"
                  type="number"
                  placeholder="2500"
                  value={formData.lateFee}
                  onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })}
                />
              </div>
            )}

            {/* Section Paiement */}
            {canMarkAsPaid && (
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Marquer comme payé
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Mode de paiement</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virement">Virement bancaire</SelectItem>
                        <SelectItem value="especes">Espèces</SelectItem>
                        <SelectItem value="cheque">Chèque</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="online">Paiement en ligne</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paidDate">Date de paiement</Label>
                    <Input
                      id="paidDate"
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section Caution */}
            {payment && payment.securityDeposit && payment.securityDeposit > 0 && (
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-3 flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  Gestion de la caution
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Montant de la caution</span>
                    <span className="font-medium">{formatCurrency(payment.securityDeposit)}</span>
                  </div>

                  {payment.securityDepositStatus === 'aucun' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowRefundDialog(true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Demander le remboursement de la caution
                    </Button>
                  )}

                  {payment.securityDepositStatus === 'demande' && (
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-600">Demande de remboursement en attente</p>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={handleApproveRefund}
                      >
                        Approuver le remboursement
                      </Button>
                    </div>
                  )}

                  {canProcessRefund && (
                    <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Rembourser la caution</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="refundAmount">Montant (CFA)</Label>
                          <Input
                            id="refundAmount"
                            type="number"
                            placeholder={payment.securityDeposit.toString()}
                            value={refundAmount || payment.securityDeposit.toString()}
                            onChange={(e) => setRefundAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="refundDate">Date</Label>
                          <Input
                            id="refundDate"
                            type="date"
                            value={refundDate}
                            onChange={(e) => setRefundDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <Textarea
                        placeholder="Notes (optionnel)"
                        value={refundNotes}
                        onChange={(e) => setRefundNotes(e.target.value)}
                      />
                      <Button 
                        className="w-full"
                        onClick={handleProcessRefund}
                      >
                        Confirmer le remboursement
                      </Button>
                    </div>
                  )}

                  {payment.securityDepositStatus === 'rembourse' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Caution remboursée le {payment.securityDepositRefundDate 
                          ? format(new Date(payment.securityDepositRefundDate), 'dd MMM yyyy', { locale: fr })
                          : 'N/A'
                        }
                      </p>
                      <p className="font-medium text-green-900">
                        Montant: {formatCurrency(payment.securityDepositRefundAmount || 0)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {canMarkAsUnpaid && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowMarkUnpaidDialog(true)}
                >
                  Marquer comme impayé
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Annuler
              </Button>
              {payment && canMarkAsPaid ? (
                <Button onClick={handleMarkAsPaid} disabled={isSubmitting}>
                  {formData.isPartial ? 'Enregistrer paiement partiel' : 'Marquer comme payé'}
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : payment ? 'Mettre à jour' : 'Créer le paiement'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation pour marquer comme impayé */}
      <AlertDialog open={showMarkUnpaidDialog} onOpenChange={setShowMarkUnpaidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer comme impayé</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir marquer ce paiement comme impayé ? 
              Le montant sera remis en attente et le statut sera réinitialisé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAsUnpaid}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de demande de remboursement */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Demander le remboursement</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de demander le remboursement de la caution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="securityDepositNotes">Motif (optionnel)</Label>
              <Textarea
                id="securityDepositNotes"
                placeholder="Raison du remboursement..."
                value={formData.securityDepositNotes}
                onChange={(e) => setFormData({ ...formData, securityDepositNotes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestRefund}>
              Soumettre la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
