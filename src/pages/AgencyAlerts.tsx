import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Check, Trash2, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

import PageHeader from '@/components/layout/PageHeader';
import { leaseAlertService, AlertSettings } from '@/services/lease-alert.service';
import { leaseContractsService } from '@/services/lease-contracts.service';
import { LeaseAlert } from '@/services/lease-alert.service';

export function AgencyAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<LeaseAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<AlertSettings>(leaseAlertService.getSettings());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    // First check contracts and generate new alerts
    const contracts = leaseContractsService.getAll();
    leaseAlertService.checkAndGenerateAlerts(contracts);

    const allAlerts = leaseAlertService.getAllAlerts();
    const unread = leaseAlertService.getUnreadAlerts();

    setAlerts(allAlerts);
    setUnreadCount(unread.length);
  };

  const handleMarkAsRead = (alertId: string) => {
    leaseAlertService.markAsRead(alertId);
    loadAlerts();
  };

  const handleMarkAllAsRead = () => {
    leaseAlertService.markAllAsRead();
    loadAlerts();
    toast({
      title: 'Alertes marquées comme lues',
      description: 'Toutes les alertes ont été marquées comme lues.',
    });
  };

  const handleDelete = (alertId: string) => {
    leaseAlertService.deleteAlert(alertId);
    loadAlerts();
    toast({
      title: 'Alerte supprimée',
      description: 'L\'alerte a été supprimée.',
    });
  };

  const handleUpdateSettings = () => {
    leaseAlertService.updateSettings(settings);
    setShowSettingsDialog(false);
    toast({
      title: 'Paramètres sauvegardés',
      description: 'Les paramètres d\'alertes ont été mis à jour.',
    });
  };

  const toggleWarningDay = (day: number) => {
    const currentDays = settings.expiryWarningDays;
    if (currentDays.includes(day)) {
      setSettings({
        ...settings,
        expiryWarningDays: currentDays.filter(d => d !== day),
      });
    } else {
      setSettings({
        ...settings,
        expiryWarningDays: [...currentDays, day].sort((a, b) => b - a),
      });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'unread') return !alert.read;
    return alert.type === typeFilter;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expiry_soon':
      case 'expiry_today':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'auto_renewal_pending':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'signature_pending':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'expiry_soon':
        return <Badge variant="secondary">Expire bientôt</Badge>;
      case 'expiry_today':
        return <Badge variant="destructive">Expire aujourd'hui</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>;
      case 'auto_renewal_pending':
        return <Badge variant="default">Renouvellement</Badge>;
      case 'signature_pending':
        return <Badge variant="outline">Signature en attente</Badge>;
      default:
        return <Badge>Alerte</Badge>;
    }
  };

  const alertStats = leaseAlertService.getAlertStats();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Alertes"
        icon={Bell}
        description="Gérez les alertes de fin de bail et les notifications"
        action={
          <div className="flex gap-2">
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Paramètres des alertes</DialogTitle>
                  <DialogDescription>
                    Configurez les alertes de fin de bail et les notifications.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Notification Channels */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Canaux de notification</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="emailNotif"
                          checked={settings.enableEmailNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            enableEmailNotifications: checked as boolean
                          })}
                        />
                        <Label htmlFor="emailNotif">Notifications par email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pushNotif"
                          checked={settings.enablePushNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            enablePushNotifications: checked as boolean
                          })}
                        />
                        <Label htmlFor="pushNotif">Notifications push</Label>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Warning Days */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Jours avant expiration pour alerter</h4>
                    <div className="flex flex-wrap gap-2">
                      {[90, 60, 30, 14, 7, 1].map((day) => (
                        <Button
                          key={day}
                          variant={settings.expiryWarningDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleWarningDay(day)}
                        >
                          {day}j
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Renewal */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Renouvellement automatique</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="autoRenew"
                          checked={settings.enableAutoRenewal}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            enableAutoRenewal: checked as boolean
                          })}
                        />
                        <Label htmlFor="autoRenew">Activer le renouvellement automatique</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="w-32">Préavis:</Label>
                        <Select
                          value={settings.autoRenewalDefaultDays.toString()}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            autoRenewalDefaultDays: parseInt(value)
                          })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 jours</SelectItem>
                            <SelectItem value="14">14 jours</SelectItem>
                            <SelectItem value="30">30 jours</SelectItem>
                            <SelectItem value="60">60 jours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateSettings}>
                    Sauvegarder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        Alertes de bail
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non lues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{alertStats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expirent bientôt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.expirySoon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Signatures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.pendingSignature}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          Tout marquer comme lu
        </Button>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type d'alerte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="unread">Non lues</SelectItem>
            <SelectItem value="expiry_soon">Expire bientôt</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
            <SelectItem value="signature_pending">Signature en attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Aucune alerte</h3>
              <p className="text-muted-foreground">
                Vous n'avez aucune alerte pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`transition-colors ${
                !alert.read ? 'border-l-4 border-l-primary' : 'opacity-75'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{alert.message}</p>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reçu le {format(new Date(alert.createdAt), 'dd/MM/yyyy à HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
