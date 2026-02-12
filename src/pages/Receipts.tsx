import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';
import { Receipt, ReceiptFilters, ReceiptStats, ReceiptColocation, ReceiptOwner } from '../types/receipt';
import { receiptsService } from '../services/receipts.service';
import { receiptPdfService } from '../services/receipt-pdf.service';
import { receiptTemplateService } from '../services/receipt-template.service';
import { notificationsService } from '../services/notifications.service';
import { useToast } from '../components/ui/use-toast';
import PageHeader from '../components/layout/PageHeader';
import { ReceiptTemplateDialog } from '../components/documents/ReceiptTemplateDialog';
import { FileText as ReceiptIcon, Download, Plus, Settings, Send, Users, Building, Calendar } from 'lucide-react';

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
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [sendChannels, setSendChannels] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'check';

  const [generateForm, setGenerateForm] = useState<{
    propertyId: string;
    roomId: string;
    tenantId: string;
    amount: string;
    paymentMethod: PaymentMethod;
    periodMonth: number;
    periodYear: number;
    isColocation: boolean;
    ownerId: string;
    templateId: string;
  }>({
    propertyId: '',
    roomId: '',
    tenantId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    isColocation: false,
    ownerId: '',
    templateId: 'default',
  });

  // Colocation form state
  const [colocataires, setColocataires] = useState<ReceiptColocation[]>([
    { receiptId: '', tenantId: '', tenantName: '', tenantEmail: '', tenantPhone: '', amount: 0, sharePercentage: 50, isPrimaryTenant: true },
    { receiptId: '', tenantId: '', tenantName: '', tenantEmail: '', tenantPhone: '', amount: 0, sharePercentage: 50, isPrimaryTenant: false },
  ]);

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

  const loadTemplates = useCallback(async () => {
    try {
      const data = await receiptTemplateService.getTemplates();
      setTemplates(data);
    } catch {
      console.error('Error loading templates');
    }
  }, []);

  useEffect(() => {
    loadReceipts();
    loadStats();
    loadTemplates();
  }, [loadReceipts, loadStats, loadTemplates]);

  const handleGenerateReceipt = async () => {
    try {
      const ownerInfo: ReceiptOwner = {
        ownerId: generateForm.ownerId,
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
      };

      if (generateForm.isColocation) {
        // Generate receipts for each colocataire
        await receiptsService.generateColocationReceipts(
          generateForm.propertyId,
          generateForm.roomId,
          colocataires,
          generateForm.paymentMethod,
          generateForm.periodMonth,
          generateForm.periodYear,
          ownerInfo,
          generateForm.templateId
        );
      } else {
        await receiptsService.generateReceipt({
          tenantId: generateForm.tenantId,
          propertyId: generateForm.propertyId,
          roomId: generateForm.roomId || undefined,
          amount: parseFloat(generateForm.amount),
          paymentMethod: generateForm.paymentMethod,
          periodMonth: generateForm.periodMonth,
          periodYear: generateForm.periodYear,
          ownerInfo,
          templateId: generateForm.templateId,
        });
      }

      toast({ title: 'Succès', description: generateForm.isColocation ? 'Quittances de colocation générées avec succès' : 'Quittance générée avec succès' });
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
      
      // Mark as sent
      await receiptsService.markAsSent(selectedReceipt.id, sendChannels as ('email' | 'whatsapp' | 'sms')[]);
      
      toast({ title: 'Succès', description: 'Quittance envoyée avec succès' });
      setShowSendDialog(false);
      setSelectedReceipt(null);
      setSendChannels([]);
      loadReceipts();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la quittance', variant: 'destructive' });
    }
  };

  const handleAutoGenerate = async () => {
    // Auto-generate receipts for all pending payments
    toast({ title: 'Info', description: 'Fonctionnalité de génération automatique à implémenter selon la logique métier' });
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
            <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Modèles
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Propriété</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, propertyId: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="Toutes les propriétés" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les propriétés</SelectItem>
                  <SelectItem value="prop1">Villa Les Palmiers</SelectItem>
                  <SelectItem value="prop2">Immeuble Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Locataire</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, tenantId: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="Tous les locataires" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les locataires</SelectItem>
                  <SelectItem value="tenant1">M. Diop</SelectItem>
                  <SelectItem value="tenant2">Mme Sall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Propriétaire</Label>
              <Select onValueChange={(value) => setFilters({ ...filters, ownerId: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue placeholder="Tous les propriétaires" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les propriétaires</SelectItem>
                  <SelectItem value="owner1">M. Ndiaye</SelectItem>
                  <SelectItem value="owner2">Mme Sy</SelectItem>
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
              <Input placeholder="N° quittance, nom..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des quittances</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAutoGenerate}>
            <Calendar className="mr-2 h-4 w-4" />
            Génération auto
          </Button>
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
                  <TableHead>Envoi</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      {receipt.receiptNumber}
                      {receipt.isColocation && <Badge variant="outline" className="ml-2">Colocation</Badge>}
                    </TableCell>
                    <TableCell>
                      <div>{receipt.tenantName}</div>
                      {receipt.isColocation && <div className="text-xs text-gray-500">{receipt.colocataires?.length || 0} locataires</div>}
                    </TableCell>
                    <TableCell>{receipt.propertyName} {receipt.roomName && `/ ${receipt.roomName}`}</TableCell>
                    <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                    <TableCell>{formatDate(receipt.periodStart)}</TableCell>
                    <TableCell>
                      <Badge variant={receipt.status === 'paid' ? 'default' : receipt.status === 'pending' ? 'secondary' : 'outline'}>
                        {receipt.status === 'paid' ? 'Payé' : receipt.status === 'pending' ? 'En attente' : 'Partiel'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {receipt.sentAt ? (
                        <div className="flex gap-1">
                          {receipt.sentChannels?.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel === 'email' ? '📧' : channel === 'whatsapp' ? '📱' : '💬'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Non envoyé</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(receipt)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowSendDialog(true);
                        }}>
                          <Send className="h-4 w-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Générer une quittance</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="single">
            <TabsList>
              <TabsTrigger value="single">Locataire unique</TabsTrigger>
              <TabsTrigger value="colocation">Colocation</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Locataire</Label>
                  <Select onValueChange={(value) => setGenerateForm({ ...generateForm, tenantId: value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un locataire" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant1">M. Diop</SelectItem>
                      <SelectItem value="tenant2">Mme Sall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Propriété</Label>
                  <Select onValueChange={(value) => setGenerateForm({ ...generateForm, propertyId: value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une propriété" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prop1">Villa Les Palmiers</SelectItem>
                      <SelectItem value="prop2">Immeuble Central</SelectItem>
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
                    onValueChange={(value) => setGenerateForm({ ...generateForm, paymentMethod: value as PaymentMethod })}
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
                <div>
                  <Label>Propriétaire</Label>
                  <Select onValueChange={(value) => setGenerateForm({ ...generateForm, ownerId: value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un propriétaire" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner1">M. Ndiaye</SelectItem>
                      <SelectItem value="owner2">Mme Sy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modèle</Label>
                  <Select 
                    value={generateForm.templateId}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, templateId: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colocation" className="space-y-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <Label className="text-blue-800">Gestion de la colocation</Label>
                </div>
                <p className="text-sm text-blue-600">Définissez les parts de chaque colocataire pour générer plusieurs quittances.</p>
              </div>

              {colocataires.map((colocataire, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Label>{index === 0 ? 'Locataire principal' : `Colocataire ${index}`}</Label>
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input 
                      value={colocataire.tenantName}
                      onChange={(e) => {
                        const updated = [...colocataires];
                        updated[index].tenantName = e.target.value;
                        setColocataires(updated);
                      }}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={colocataire.tenantEmail}
                      onChange={(e) => {
                        const updated = [...colocataires];
                        updated[index].tenantEmail = e.target.value;
                        setColocataires(updated);
                      }}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input 
                      value={colocataire.tenantPhone}
                      onChange={(e) => {
                        const updated = [...colocataires];
                        updated[index].tenantPhone = e.target.value;
                        setColocataires(updated);
                      }}
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <Label>Part (%)</Label>
                    <Input 
                      type="number"
                      value={colocataire.sharePercentage}
                      onChange={(e) => {
                        const updated = [...colocataires];
                        updated[index].sharePercentage = parseInt(e.target.value);
                        updated[index].amount = (parseInt(e.target.value) * parseFloat(generateForm.amount || '0')) / 100;
                        setColocataires(updated);
                      }}
                      placeholder="50"
                    />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loyer total</Label>
                  <Input 
                    type="number" 
                    value={generateForm.amount}
                    onChange={(e) => {
                      setGenerateForm({ ...generateForm, amount: e.target.value });
                      const updated = colocataires.map(c => ({
                        ...c,
                        amount: (c.sharePercentage * parseFloat(e.target.value || '0')) / 100
                      }));
                      setColocataires(updated);
                    }}
                    placeholder="Loyer total"
                  />
                </div>
                <div>
                  <Label>Propriété</Label>
                  <Select onValueChange={(value) => setGenerateForm({ ...generateForm, propertyId: value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une propriété" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prop1">Villa Les Palmiers</SelectItem>
                      <SelectItem value="prop2">Immeuble Central</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => setColocataires([...colocataires, { receiptId: '', tenantId: '', tenantName: '', tenantEmail: '', tenantPhone: '', amount: 0, sharePercentage: 0, isPrimaryTenant: false }])}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un colocataire
              </Button>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4 mt-4">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Annuler</Button>
            <Button onClick={handleGenerateReceipt}>
              <Plus className="mr-2 h-4 w-4" />
              Générer
            </Button>
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
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <Checkbox 
                  checked={sendChannels.includes('email')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSendChannels([...sendChannels, 'email']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'email'));
                    }
                  }}
                />
                <span className="flex items-center gap-2">
                  📧 Email ({selectedReceipt?.tenantEmail})
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox 
                  checked={sendChannels.includes('whatsapp')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSendChannels([...sendChannels, 'whatsapp']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'whatsapp'));
                    }
                  }}
                />
                <span className="flex items-center gap-2">
                  📱 WhatsApp ({selectedReceipt?.tenantPhone})
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox 
                  checked={sendChannels.includes('sms')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSendChannels([...sendChannels, 'sms']);
                    } else {
                      setSendChannels(sendChannels.filter(c => c !== 'sms'));
                    }
                  }}
                />
                <span className="flex items-center gap-2">
                  💬 SMS ({selectedReceipt?.tenantPhone})
                </span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Annuler</Button>
            <Button onClick={handleSendReceipt} disabled={sendChannels.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <ReceiptTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSave={(template) => {
          loadTemplates();
        }}
      />
    </div>
  );
}
