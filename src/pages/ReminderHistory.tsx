import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Download,
  Trash2,
} from 'lucide-react';



import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { reminderService } from '@/services/reminder.service';
import type { ReminderHistory, NotificationChannel, ReminderType } from '@/types/reminder';
import { useToast } from '@/components/ui/use-toast';

export function ReminderHistory() {
  const { toast } = useToast();
  const [history, setHistory] = useState<ReminderHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ReminderHistory[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<ReturnType<typeof reminderService.getStats> | null>(null);

  const loadData = () => {
    const loadedHistory = reminderService.getHistory();
    const loadedStats = reminderService.getStats();
    setHistory(loadedHistory);
    setFilteredHistory(loadedHistory);
    setStats(loadedStats);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...history];

    if (channelFilter !== 'all') {
      filtered = filtered.filter((h) => h.channel === channelFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((h) => h.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((h) => h.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.tenantName.toLowerCase().includes(search) ||
          h.paymentId.toLowerCase().includes(search)
      );
    }

    setFilteredHistory(filtered);
  }, [history, channelFilter, typeFilter, statusFilter, searchTerm]);

  const handleClearHistory = () => {
    localStorage.removeItem('seek_reminder_history');
    setHistory([]);
    setFilteredHistory([]);
    toast({
      title: 'Historique effacé',
      description: "L'historique des relances a été effacé.",
    });
  };

  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Email</Badge>;
      case 'whatsapp':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">WhatsApp</Badge>;
      case 'sms':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">SMS</Badge>;
    }
  };

  const getTypeBadge = (type: ReminderType) => {
    switch (type) {
      case 'before_due':
        return <Badge className="bg-blue-500">Avant échéance</Badge>;
      case 'after_due':
        return <Badge variant="destructive">Après retard</Badge>;
    }
  };

  const getStatusBadge = (status: ReminderHistory['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Envoyé</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Annulé</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Locataire', 'Canal', 'Type', 'Statut', 'Message'];
    const rows = filteredHistory.map((h) => [
      format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm'),
      h.tenantName,
      h.channel,
      h.type,
      h.status,
      h.message.substring(0, 50) + '...',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-relances-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const totalSent = history.filter((h) => h.status === 'sent').length;
  const totalFailed = history.filter((h) => h.status === 'failed').length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="HISTORIQUE"
        description="Consultez l'historique de tous les rappels et relances envoyés"
        icon={History}
        action={
          <>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Exporter CSV
            </Button>
            <Button variant="outline" onClick={handleClearHistory}>
              <Trash2 className="mr-2 h-4 w-4" /> Effacer
            </Button>
          </>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Historique des relances</h1>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échoués</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {history.filter((h) => h.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Locataire, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les canaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les canaux</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="before_due">Avant échéance</SelectItem>
                  <SelectItem value="after_due">Après retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setChannelFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails des relances ({filteredHistory.length})</CardTitle>
          <CardDescription>
            Liste complète des rappels et relances envoyés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Locataire</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune relance trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.tenantName}</p>
                        {entry.tenantEmail && (
                          <p className="text-sm text-muted-foreground">{entry.tenantEmail}</p>
                        )}
                        {entry.tenantPhone && (
                          <p className="text-sm text-muted-foreground">{entry.tenantPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getChannelBadge(entry.channel)}</TableCell>
                    <TableCell>{getTypeBadge(entry.type)}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {entry.message}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
