import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Receipt, ReceiptFilters, ReceiptStats } from '../types/receipt';
import { receiptsService } from '../services/receipts.service';
import { receiptPdfService } from '../services/receipt-pdf.service';
import { notificationsService } from '../services/notifications.service';
import { useToast } from '../components/ui/use-toast';
import PageHeader from '../components/layout/PageHeader';
import { FileText as ReceiptIcon, Download, Plus } from 'lucide-react';

export default function ReceiptsPage() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<ReceiptStats>({
    totalCollected: 0,
    pendingAmount: 0,
    receiptsCount: 0,
    averageRent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [sendChannels, setSendChannels] = useState<string[]>([]);

  type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check';

  const [generateForm, setGenerateForm] = useState<{
    propertyId: string;
    roomId: string;
    tenantId: string;
    amount: string;
    paymentMethod: PaymentMethod;
    periodMonth: number;
    periodYear: number;
  }>({
    propertyId: '',
    roomId: '',
    tenantId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
  });

  const loadReceipts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await receiptsService.getReceipts(filters);
      setReceipts(data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les quittances', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await receiptsService.getReceiptStats(filters);
      setStats(statsData);
    } catch {
      console.error('Error loading stats');
    }
  }, [filters]);

  useEffect(() => {
    loadReceipts();
    loadStats();
  }, [loadReceipts, loadStats]);

  const handleGenerateReceipt = async () => {
    try {
      await receiptsService.generateReceipt({
        tenantId: generateForm.tenantId,
        propertyId: generateForm.propertyId,
        roomId: generateForm.roomId || undefined,
        amount: parseFloat(generateForm.amount),
        paymentMethod: generateForm.paymentMethod,
        periodMonth: generateForm.periodMonth,
        periodYear: generateForm.periodYear,
      });
      toast({ title: 'Succès', description: 'Quittance générée avec succès' });
      setShowGenerateDialog(false);
      loadReceipts();
      loadStats();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de générer la quittance', variant: 'destructive' });
    }
  };

  const handleDownloadPdf = async (receipt: Receipt) => {
    await receiptPdfService.downloadReceiptPdf(receipt);
  };

  const handleBulkDownload = async () => {
    await receiptPdfService.downloadBulkReceiptsPdf(receipts);
  };

  const handleSendReceipt = async () => {
    if (!selectedReceipt) return;
    
    try {
      await notificationsService.sendReceiptMultiChannel(
        selectedReceipt,
        sendChannels as ('email' | 'whatsapp' | 'sms')[],
        selectedReceipt.tenantEmail,
        selectedReceipt.tenantPhone
      );
      toast({ title: 'Succès', description: 'Quittance envoyée avec succès' });
      setShowSendDialog(false);
      setSelectedReceipt(null);
      setSendChannels([]);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la quittance', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Quittances"
        icon={ReceiptIcon}
        description="Gérez les quittances de loyer"
        action={
          <>
            <Button variant="outline" onClick={handleBulkDownload}>
              <Download className="mr-2 h-4 w-4" />
              Tout télécharger
            </Button>
            <Button onClick={() => setShowGenerateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Générer quittance
            </Button>
          </>
        }
      >
        Gestion des quittances
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</div>
            <p className="text-sm text-gray-500">Total collecté</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-sm text-gray-500">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.receiptsCount}</div>
            <p className="text-sm text-gray-500">Nombre de quittances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(stats.averageRent)}</div>
            <p className="text-sm text-gray-500">Loyer moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Propriété</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, propertyId: value })}>
                <SelectTrigger><SelectValue placeholder="Toutes les propriétés" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les propriétés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chambre</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, roomId: value })}>
                <SelectTrigger><SelectValue placeholder="Toutes les chambres" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les chambres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as Receipt['status'] })}>
                <SelectTrigger><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recherche</Label>
              <Input placeholder="Rechercher..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des quittances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8">Aucune quittance trouvée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Quittance</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Propriété/Chambre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                    <TableCell>{receipt.tenantName}</TableCell>
                    <TableCell>{receipt.propertyName} {receipt.roomName && `/ ${receipt.roomName}`}</TableCell>
                    <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>{formatDate(receipt.periodStart)} - {formatDate(receipt.periodEnd)}</TableCell>
                    <TableCell>
                      <Badge variant={receipt.status === 'paid' ? 'default' : receipt.status === 'pending' ? 'secondary' : 'outline'}>
                        {receipt.status === 'paid' ? 'Payé' : receipt.status === 'pending' ? 'En attente' : 'Partiel'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(receipt)}>
                          PDF
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowSendDialog(true);
                        }}>
                          Envoyer
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

      {/* Generate Receipt Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Générer une quittance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Locataire</Label>
              <Select onValueChange={(value) => setGenerateForm({ ...generateForm, tenantId: value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un locataire" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant1">Locataire 1</SelectItem>
                  <SelectItem value="tenant2">Locataire 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Propriété</Label>
              <Select onValueChange={(value) => setGenerateForm({ ...generateForm, propertyId: value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une propriété" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prop1">Propriété 1</SelectItem>
                  <SelectItem value="prop2">Propriété 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Montant</Label>
              <Input 
                type="number" 
                value={generateForm.amount}
                onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
                placeholder="Montant du loyer"
              />
            </div>
            <div>
              <Label>Mode de paiement</Label>
              <Select 
                value={generateForm.paymentMethod}
                onValueChange={(value) => 
                  setGenerateForm({ ...generateForm, paymentMethod: value as PaymentMethod })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mois</Label>
                <Select 
                  value={String(generateForm.periodMonth)}
                  onValueChange={(value) => setGenerateForm({ ...generateForm, periodMonth: parseInt(value) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Année</Label>
                <Select 
                  value={String(generateForm.periodYear)}
                  onValueChange={(value) => setGenerateForm({ ...generateForm, periodYear: parseInt(value) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Annuler</Button>
            <Button onClick={handleGenerateReceipt}>Générer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Receipt Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer la quittance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Envoyer la quittance {selectedReceipt?.receiptNumber} via :
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={sendChannels.includes('email')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSendChannels([...sendChannels, 'email']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'email'));
                    }
                  }}
                />
                <span>Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={sendChannels.includes('whatsapp')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSendChannels([...sendChannels, 'whatsapp']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'whatsapp'));
                    }
                  }}
                />
                <span>WhatsApp</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={sendChannels.includes('sms')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSendChannels([...sendChannels, 'sms']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'sms'));
                    }
                  }}
                />
                <span>SMS</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Annuler</Button>
            <Button onClick={handleSendReceipt} disabled={sendChannels.length === 0}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
