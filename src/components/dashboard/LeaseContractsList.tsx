import { useState } from 'react';
import {
  FileText,
  RefreshCw,
  XCircle,
  Download,
  MoreVertical,
  Calendar,
  Home,
  Users,
  DollarSign,
} from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

import { cn } from '@/lib/utils';
import { LeaseContract, RenewLeaseInput, TerminateLeaseInput } from '@/types/lease-contract';
import { leasePDFService } from '@/services/lease-pdf.service';

interface LeaseContractsListProps {
  contracts: LeaseContract[];
  onRenew: (data: RenewLeaseInput) => void;
  onTerminate: (data: TerminateLeaseInput) => void;
  onEdit: (contract: LeaseContract) => void;
  onDelete: (contractId: string) => void;
}

export function LeaseContractsList({
  contracts,
  onRenew,
  onTerminate,
  onEdit,
  onDelete,
}: LeaseContractsListProps) {
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<LeaseContract | null>(null);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);

  // Renewal form state
  const [renewDurationValue, setRenewDurationValue] = useState('12');
  const [renewDurationUnit, setRenewDurationUnit] = useState<'months' | 'years'>('months');
  const [newRentAmount, setNewRentAmount] = useState('');

  // Termination form state
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationDate, setTerminationDate] = useState('');

  const getStatusBadge = (contract: LeaseContract) => {
    const daysUntilExpiry = differenceInDays(new Date(contract.endDate), new Date());
    const endDate = new Date(contract.endDate);

    if (contract.status === 'resilie') {
      return <Badge variant="destructive">Résilié</Badge>;
    }
    if (contract.status === 'renouvele') {
      return <Badge variant="secondary">Renouvelé</Badge>;
    }
    if (isPast(endDate)) {
      return <Badge variant="destructive">Expiré</Badge>;
    }
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return <Badge variant="secondary">Expire bientôt</Badge>;
    }
    return <Badge variant="default">Actif</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FF', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  const handleGeneratePDF = (contract: LeaseContract) => {
    try {
      leasePDFService.generateContractPDF(contract);
      toast({
        title: 'PDF généré',
        description: 'Le contrat a été téléchargé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleRenewClick = (contract: LeaseContract) => {
    setSelectedContract(contract);
    setNewRentAmount(contract.rentAmount.toString());
    setShowRenewDialog(true);
  };

  const handleTerminateClick = (contract: LeaseContract) => {
    setSelectedContract(contract);
    setTerminationDate(new Date().toISOString().split('T')[0]);
    setShowTerminateDialog(true);
  };

  const handleConfirmRenew = () => {
    if (!selectedContract) return;

    const input: RenewLeaseInput = {
      contractId: selectedContract.id,
      newDuration: {
        value: parseInt(renewDurationValue),
        unit: renewDurationUnit,
      },
      newRentAmount: newRentAmount ? parseFloat(newRentAmount) : undefined,
      newStartDate: selectedContract.endDate,
    };

    onRenew(input);
    setShowRenewDialog(false);
    toast({
      title: 'Contrat renouvelé',
      description: 'Le contrat a été renouvelé avec succès.',
    });
  };

  const handleConfirmTerminate = () => {
    if (!selectedContract || !terminationReason || !terminationDate) return;

    const input: TerminateLeaseInput = {
      contractId: selectedContract.id,
      reason: terminationReason,
      terminationDate,
    };

    onTerminate(input);
    setShowTerminateDialog(false);
    toast({
      title: 'Contrat résilié',
      description: 'Le contrat a été résilié avec succès.',
    });

    // Generate termination PDF
    leasePDFService.generateContractTerminationPDF(
      selectedContract,
      terminationDate,
      terminationReason
    );
  };

  const handleDelete = (contractId: string) => {
    onDelete(contractId);
    toast({
      title: 'Contrat supprimé',
      description: 'Le contrat a été supprimé avec succès.',
    });
  };

  return (
    <div className="space-y-4">
      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun contrat de bail</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre premier contrat de bail pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className={cn(
                'border rounded-lg p-4 bg-card transition-colors hover:bg-accent/50',
                contract.status === 'resilie' && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">
                      Bail {contract.type === 'colocation' ? 'Colocation' : 'Classique'}
                    </h3>
                    {getStatusBadge(contract)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Bien:</span>
                      <span className="font-medium">{contract.property.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Locataire(s):</span>
                      <span className="font-medium">
                        {contract.tenants.map(t => t.fullName).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Du:</span>
                      <span className="font-medium">
                        {format(new Date(contract.startDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Au:</span>
                      <span className="font-medium">
                        {format(new Date(contract.endDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Loyer:</span>
                      <span className="font-medium">{formatCurrency(contract.rentAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Caution:</span>
                      <span className="font-medium">{formatCurrency(contract.depositAmount)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Référence: {contract.id} • Créé le {format(new Date(contract.createdAt), 'dd/MM/yyyy')}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleGeneratePDF(contract)}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(contract)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    {contract.status === 'actif' && (
                      <>
                        <DropdownMenuItem onClick={() => handleRenewClick(contract)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renouveler
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTerminateClick(contract)}
                          className="text-destructive"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Résilier
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(contract.id)}
                      className="text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renew Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renouveler le contrat</DialogTitle>
            <DialogDescription>
              Prolongez le bail de {selectedContract?.property.address}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nouvelle durée</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={renewDurationValue}
                    onChange={(e) => setRenewDurationValue(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Select
                    value={renewDurationUnit}
                    onValueChange={(value: 'months' | 'years') =>
                      setRenewDurationUnit(value)
                    }
                  >
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
              <div className="space-y-2">
                <Label htmlFor="newRent">Nouveau loyer (XOF)</Label>
                <Input
                  id="newRent"
                  type="number"
                  value={newRentAmount}
                  onChange={(e) => setNewRentAmount(e.target.value)}
                  placeholder="Laissez vide pour conserver"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmRenew}>Confirmer le renouvellement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résilier le contrat</DialogTitle>
            <DialogDescription>
              Mettez fin au bail de {selectedContract?.property.address}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de la résiliation</Label>
              <Select value={terminationReason} onValueChange={setTerminationReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="depart-locataire">Départ du locataire</SelectItem>
                  <SelectItem value="non-paiement">Non-paiement du loyer</SelectItem>
                  <SelectItem value="travaux">Travaux importants</SelectItem>
                  <SelectItem value="vente">Vente du bien</SelectItem>
                  <SelectItem value="autre">Autre motif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date de résiliation</Label>
              <Input
                id="date"
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmTerminate}
              disabled={!terminationReason || !terminationDate}
            >
              Confirmer la résiliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
