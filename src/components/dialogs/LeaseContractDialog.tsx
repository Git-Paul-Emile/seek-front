import { useState } from 'react';
import { CalendarIcon, FileText, Plus, Trash2, PenTool, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';

import { cn } from '@/lib/utils';
import {
  LeaseType,
  LeaseClause,
  CreateLeaseInput,
  DEFAULT_CLAUSES,
  COLOCATION_SPECIFIC_CLAUSES,
  COLOCATION_INDIVIDUELLE_CLAUSES,
  COLOCATION_COLLECTIVE_CLAUSES,
  LeaseContract,
} from '@/types/lease-contract';

interface LeaseContractDialogProps {
  children: React.ReactNode;
  onSave: (data: CreateLeaseInput) => void;
  properties: Array<{ id: string; address: string; type: string }>;
  tenants: Array<{ id: string; fullName: string; email: string }>;
  editContract?: LeaseContract;
}

export function LeaseContractDialog({
  children,
  onSave,
  properties,
  tenants,
  editContract,
}: LeaseContractDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [type, setType] = useState<LeaseType>(editContract?.type || 'classique');
  const [propertyId, setPropertyId] = useState(editContract?.property.id || '');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>(
    editContract?.tenants.map(t => t.id) || []
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    editContract?.startDate ? new Date(editContract.startDate) : undefined
  );
  const [durationValue, setDurationValue] = useState(
    editContract?.duration.value.toString() || '12'
  );
  const [durationUnit, setDurationUnit] = useState<'months' | 'years'>(
    editContract?.duration.unit || 'months'
  );
  const [rentAmount, setRentAmount] = useState(
    editContract?.rentAmount.toString() || ''
  );
  const [depositAmount, setDepositAmount] = useState(
    editContract?.depositAmount.toString() || ''
  );
  const [paymentDueDay, setPaymentDueDay] = useState(
    editContract?.paymentDueDay.toString() || '1'
  );
  const [clauses, setClauses] = useState<LeaseClause[]>(
    editContract?.clauses || [...DEFAULT_CLAUSES]
  );

  // New options
  const [signatureEnabled, setSignatureEnabled] = useState(
    editContract?.signatureEnabled || false
  );
  const [autoRenewal, setAutoRenewal] = useState(
    editContract?.autoRenewal || false
  );
  const [autoRenewalNoticeDays, setAutoRenewalNoticeDays] = useState(
    editContract?.autoRenewalNoticeDays?.toString() || '30'
  );

  // New clause form
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');

  const calculateEndDate = (): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    if (durationUnit === 'months') {
      start.setMonth(start.getMonth() + parseInt(durationValue));
    } else {
      start.setFullYear(start.getFullYear() + parseInt(durationValue));
    }
    return start.toISOString();
  };

  const handleAddClause = () => {
    if (newClauseTitle && newClauseContent) {
      setClauses([
        ...clauses,
        {
          id: `custom-${Date.now()}`,
          title: newClauseTitle,
          content: newClauseContent,
          isRequired: false,
        },
      ]);
      setNewClauseTitle('');
      setNewClauseContent('');
    }
  };

  const handleRemoveClause = (id: string) => {
    setClauses(clauses.filter(c => c.id !== id));
  };

  const handleToggleRequired = (id: string) => {
    setClauses(
      clauses.map(c =>
        c.id === id ? { ...c, isRequired: !c.isRequired } : c
      )
    );
  };

  const handleSubmit = () => {
    const input: CreateLeaseInput = {
      type,
      propertyId,
      tenantIds: selectedTenantIds,
      startDate: startDate?.toISOString() || '',
      duration: {
        value: parseInt(durationValue),
        unit: durationUnit,
      },
      rentAmount: parseFloat(rentAmount),
      depositAmount: parseFloat(depositAmount),
      paymentDueDay: parseInt(paymentDueDay),
      clauses,
      signatureEnabled,
      autoRenewal,
      autoRenewalNoticeDays: parseInt(autoRenewalNoticeDays),
    };

    onSave(input);
    setOpen(false);
    resetForm();
    toast({
      title: editContract ? 'Contrat modifié' : 'Contrat créé',
      description: editContract
        ? 'Le contrat de bail a été mis à jour avec succès.'
        : 'Le contrat de bail a été créé avec succès.',
    });
  };

  const resetForm = () => {
    setStep(1);
    setType('classique');
    setPropertyId('');
    setSelectedTenantIds([]);
    setStartDate(undefined);
    setDurationValue('12');
    setRentAmount('');
    setDepositAmount('');
    setPaymentDueDay('1');
    setClauses(DEFAULT_CLAUSES);
    setSignatureEnabled(false);
    setAutoRenewal(false);
    setAutoRenewalNoticeDays('30');
  };

  const handleTenantToggle = (tenantId: string) => {
    if (selectedTenantIds.includes(tenantId)) {
      setSelectedTenantIds(selectedTenantIds.filter(id => id !== tenantId));
    } else {
      setSelectedTenantIds([...selectedTenantIds, tenantId]);
    }
  };

  const getClausesForType = () => {
    let currentClauses = [...DEFAULT_CLAUSES];
    
    if (type === 'colocation') {
      currentClauses = [...currentClauses, ...COLOCATION_SPECIFIC_CLAUSES];
    } else if (type === 'colocation_individuelle') {
      currentClauses = [...currentClauses, ...COLOCATION_INDIVIDUELLE_CLAUSES];
    } else if (type === 'colocation_collective') {
      currentClauses = [...currentClauses, ...COLOCATION_COLLECTIVE_CLAUSES];
    }
    
    // Preserve custom clauses
    const customClauses = clauses.filter(c => c.id.startsWith('custom-'));
    return [...currentClauses, ...customClauses];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editContract ? 'Modifier le contrat de bail' : 'Créer un contrat de bail'}
          </DialogTitle>
          <DialogDescription>
            {editContract
              ? 'Modifiez les informations du contrat de bail ci-dessous.'
              : 'Remplissez les informations ci-dessous pour créer un nouveau contrat de bail.'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={cn(
                    'h-0.5 w-12',
                    step > s ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de bail</Label>
                <Select
                  value={type}
                  onValueChange={(value: LeaseType) => setType(value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classique">Bail Classique</SelectItem>
                    <SelectItem value="colocation">Colocation</SelectItem>
                    <SelectItem value="colocation_individuelle">Colocation (Chambre individuelle)</SelectItem>
                    <SelectItem value="colocation_collective">Colocation (Espace collectif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property">Propriété</Label>
                <Select value={propertyId} onValueChange={setPropertyId}>
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Sélectionnez une propriété" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tenant Selection */}
            <div className="space-y-2">
              <Label>
                {type === 'classique' ? 'Locataire' : 
                 type === 'colocation_individuelle' ? 'Locataires' : 
                 type === 'colocation_collective' ? 'Locataires' : 'Locataire(s)'}
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`tenant-${tenant.id}`}
                      checked={selectedTenantIds.includes(tenant.id)}
                      onCheckedChange={() => handleTenantToggle(tenant.id)}
                    />
                    <Label
                      htmlFor={`tenant-${tenant.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {tenant.fullName}
                    </Label>
                  </div>
                ))}
              </div>
              {type === 'classique' && selectedTenantIds.length > 1 && (
                <p className="text-xs text-amber-600">
                  Pour un bail classique, sélectionnez un seul locataire.
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, 'dd/MM/yyyy')
                        : 'Sélectionnez une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Durée du bail</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    className="w-20"
                    min="1"
                  />
                  <Select
                    value={durationUnit}
                    onValueChange={(value: 'months' | 'years') =>
                      setDurationUnit(value)
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
            </div>

            {startDate && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <strong>Date de fin prévue:</strong>{' '}
                {format(new Date(calculateEndDate()), 'dd/MM/yyyy')}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Financial Terms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Loyer mensuel (XOF)</Label>
                <Input
                  id="rent"
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  placeholder="ex: 150000"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Dépôt de garantie (XOF)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="ex: 300000"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDay">Jour de paiement du loyer</Label>
              <Select
                value={paymentDueDay}
                onValueChange={setPaymentDueDay}
              >
                <SelectTrigger id="paymentDay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Le {day} de chaque mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Summary */}
            <div className="rounded-md border p-4 space-y-2">
              <h4 className="font-medium">Récapitulatif financier</h4>
              <div className="flex justify-between text-sm">
                <span>Loyer mensuel:</span>
                <span>
                  {rentAmount
                    ? new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(parseFloat(rentAmount))
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dépôt de garantie:</span>
                <span>
                  {depositAmount
                    ? new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(parseFloat(depositAmount))
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Total à payer:</span>
                <span>
                  {rentAmount && depositAmount
                    ? new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                      }).format(parseFloat(rentAmount) + parseFloat(depositAmount))
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Clauses */}
        {step === 3 && (
          <div className="space-y-6">
            <Accordion type="multiple" className="w-full">
              {getClausesForType().map((clause, index) => (
                <AccordionItem key={clause.id} value={clause.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {index + 1}. {clause.title}
                      </span>
                      {clause.isRequired && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Obligatoire
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {clause.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`required-${clause.id}`}
                        checked={clause.isRequired}
                        onCheckedChange={() => handleToggleRequired(clause.id)}
                      />
                      <Label
                        htmlFor={`required-${clause.id}`}
                        className="text-sm"
                      >
                        Clause obligatoire
                      </Label>
                      {!clause.isRequired && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-destructive hover:text-destructive"
                          onClick={() => handleRemoveClause(clause.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Add Custom Clause */}
            <div className="border rounded-md p-4 space-y-3">
              <h4 className="font-medium text-sm">Ajouter une clause personnalisée</h4>
              <div className="space-y-2">
                <Label htmlFor="clauseTitle">Titre de la clause</Label>
                <Input
                  id="clauseTitle"
                  value={newClauseTitle}
                  onChange={(e) => setNewClauseTitle(e.target.value)}
                  placeholder="ex: Animaux domestiques"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clauseContent">Contenu de la clause</Label>
                <Textarea
                  id="clauseContent"
                  value={newClauseContent}
                  onChange={(e) => setNewClauseContent(e.target.value)}
                  placeholder="Décrivez la clause..."
                  rows={3}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddClause}
                disabled={!newClauseTitle || !newClauseContent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la clause
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Options (Signature & Auto-renewal) */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Signature Options */}
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Signature électronique</h4>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="signatureEnabled"
                  checked={signatureEnabled}
                  onCheckedChange={(checked) => setSignatureEnabled(checked as boolean)}
                />
                <Label htmlFor="signatureEnabled">
                  Activer la signature électronique pour ce contrat
                </Label>
              </div>
              {signatureEnabled && (
                <p className="text-sm text-muted-foreground">
                  Les parties pourront signer numériquement le contrat. La signature
                  aura la même valeur juridique qu'une signature manuscrite.
                </p>
              )}
            </div>

            {/* Auto-renewal Options */}
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Renouvellement automatique</h4>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRenewal"
                  checked={autoRenewal}
                  onCheckedChange={(checked) => setAutoRenewal(checked as boolean)}
                />
                <Label htmlFor="autoRenewal">
                  Activer le renouvellement automatique
                </Label>
              </div>
              {autoRenewal && (
                <div className="space-y-2">
                  <Label htmlFor="noticeDays">
                    Nombre de jours de préavis pour le renouvellement
                  </Label>
                  <Select
                    value={autoRenewalNoticeDays}
                    onValueChange={setAutoRenewalNoticeDays}
                  >
                    <SelectTrigger id="noticeDays" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="14">14 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Une alerte sera envoyée {autoRenewalNoticeDays} jours avant la fin du bail
                    pour informer les parties du renouvellement.
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium mb-2">Récapitulatif du contrat</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">
                    {type === 'classique' && 'Bail Classique'}
                    {type === 'colocation' && 'Colocation'}
                    {type === 'colocation_individuelle' && 'Colocation (Chambre individuelle)'}
                    {type === 'colocation_collective' && 'Colocation (Espace collectif)'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signature:</span>
                  <span className="ml-2 font-medium">
                    {signatureEnabled ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Renouvellement auto:</span>
                  <span className="ml-2 font-medium">
                    {autoRenewal ? `Oui (${autoRenewalNoticeDays}j)` : 'Non'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Locataire(s):</span>
                  <span className="ml-2 font-medium">{selectedTenantIds.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Précédent
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>Suivant</Button>
            ) : (
              <Button onClick={handleSubmit}>
                {editContract ? 'Modifier' : 'Créer'} le contrat
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
