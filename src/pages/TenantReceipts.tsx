import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Receipt, ReceiptFilters, ReceiptStats } from '../types/receipt';
import { receiptsService } from '../services/receipts.service';
import { receiptPdfService } from '../services/receipt-pdf.service';
import { notificationsService } from '../services/notifications.service';
import { tenantAuthService } from '../services/tenant-auth.service';
import { useToast } from '../components/ui/use-toast';
import PageHeader from '../components/layout/PageHeader';
import { FileText, Download, Send, Calendar, Building, Wallet, Search, Loader2 } from 'lucide-react';

export default function TenantReceiptsPage() {
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState<ReceiptStats>({
    totalCollected: 0,
    pendingAmount: 0,
    receiptsCount: 0,
    averageRent: 0,
  });
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [sendChannels, setSendChannels] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const currentTenant = tenantAuthService.getTenant();

  const loadReceipts = useCallback(async () => {
    if (!currentTenant) return;
    
    try {
      const filters: ReceiptFilters = {
        tenantId: currentTenant.id,
      };
      
      if (yearFilter !== 'all') {
        filters.startDate = new Date(parseInt(yearFilter), 0, 1);
        filters.endDate = new Date(parseInt(yearFilter), 11, 31);
      }
      
      const data = await receiptsService.getReceipts(filters);
      
      // Filter by search query
      let filteredData = data;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredData = data.filter(r =>
          r.receiptNumber.toLowerCase().includes(query) ||
          r.propertyName.toLowerCase().includes(query) ||
          r.roomName?.toLowerCase().includes(query) ||
          String(r.amount).includes(query)
        );
      }
      
      setReceipts(filteredData);
    } catch {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de charger vos quittances', 
        variant: 'destructive' 
      });
    }
  }, [currentTenant, yearFilter, searchQuery, toast]);

  const loadStats = useCallback(async () => {
    if (!currentTenant) return;
    
    try {
      const filters: ReceiptFilters = {
        tenantId: currentTenant.id,
      };
      const statsData = await receiptsService.getReceiptStats(filters);
      setStats(statsData);
    } catch {
      console.error('Error loading stats');
    }
  }, [currentTenant]);

  useEffect(() => {
    loadReceipts();
    loadStats();
  }, [loadReceipts, loadStats]);

  const handleDownloadPdf = async (receipt: Receipt) => {
    await receiptPdfService.downloadReceiptPdf(receipt);
    toast({ 
      title: 'Téléchargement', 
      description: `Quittance ${receipt.receiptNumber} téléchargée` 
    });
  };

  const handleSendReceipt = async () => {
    if (!selectedReceipt || !currentTenant) return;
    
    setIsSending(true);
    try {
      await notificationsService.sendReceiptMultiChannel(
        selectedReceipt,
        sendChannels as ('email' | 'whatsapp' | 'sms')[],
        selectedReceipt.tenantEmail,
        selectedReceipt.tenantPhone
      );
      toast({ 
        title: 'Succès', 
        description: `Quittance envoyée par ${sendChannels.join(', ')}` 
      });
      setShowSendDialog(false);
      setSelectedReceipt(null);
      setSendChannels([]);
    } catch {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'envoyer la quittance', 
        variant: 'destructive' 
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleBulkDownload = async () => {
    await receiptPdfService.downloadBulkReceiptsPdf(receipts);
    toast({ 
      title: 'Téléchargement', 
      description: `${receipts.length} quittances téléchargées` 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getMonthName = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const toggleChannel = (channel: string) => {
    setSendChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const availableYears = React.useMemo(() => {
    const years = new Set<string>();
    years.add('all');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.add(String(i));
    }
    return Array.from(years);
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Mes Quittances"
        icon={FileText}
        description="Consulter et gérer vos quittances de loyer"
      >
        Mes Quittances de Loyer
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total payé</p>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nombre de quittances</p>
                <div className="text-2xl font-bold">{stats.receiptsCount}</div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dernier loyer</p>
                <div className="text-2xl font-bold">
                  {receipts.length > 0 ? formatCurrency(receipts[0].amount) : '-'}
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une quittance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year === 'all' ? 'Toutes les années' : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleBulkDownload} disabled={receipts.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Tout télécharger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des quittances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune quittance trouvée</p>
              <p className="text-sm text-gray-400">
                {searchQuery ? 'Essayez avec d\'autres critères de recherche' : 'Vos quittances apparaîtront ici'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg">{receipt.receiptNumber}</span>
                      <Badge variant={receipt.status === 'paid' ? 'default' : 'secondary'}>
                        {receipt.status === 'paid' ? 'Payé' : receipt.status === 'pending' ? 'En attente' : 'Partiel'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        <Building className="inline h-4 w-4 mr-1" />
                        {receipt.propertyName}
                        {receipt.roomName && ` - ${receipt.roomName}`}
                      </p>
                      <p>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {getMonthName(receipt.periodStart)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(receipt.amount)}</div>
                      <div className="text-xs text-gray-400">
                        Payé le {formatDate(receipt.paymentDate)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(receipt)}
                        title="Télécharger en PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowSendDialog(true);
                        }}
                        title="Envoyer par Email, WhatsApp ou SMS"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Receipt Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer la quittance</DialogTitle>
            <DialogDescription>
              Envoyez la quittance {selectedReceipt?.receiptNumber} par le canal de votre choix
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Quittance sélectionnée:</div>
              <div className="font-semibold">{selectedReceipt?.receiptNumber}</div>
              <div className="text-blue-600 font-bold">{formatCurrency(selectedReceipt?.amount || 0)}</div>
            </div>
            
            <Label>Sélectionner les canaux d'envoi:</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={sendChannels.includes('email') ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => toggleChannel('email')}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Email</span>
              </Button>
              
              <Button
                type="button"
                variant={sendChannels.includes('whatsapp') ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => toggleChannel('whatsapp')}
              >
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm">WhatsApp</span>
              </Button>
              
              <Button
                type="button"
                variant={sendChannels.includes('sms') ? 'default' : 'outline'}
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => toggleChannel('sms')}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-sm">SMS</span>
              </Button>
            </div>

            {sendChannels.length === 0 && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                Sélectionnez au moins un canal d'envoi
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendReceipt} 
              disabled={sendChannels.length === 0 || isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
