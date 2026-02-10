import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bell,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  RotateCcw,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { reminderService } from '@/services/reminder.service';
import type { ReminderSettings, NotificationChannel } from '@/types/reminder';
import { useToast } from '@/components/ui/use-toast';

export function ReminderSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof reminderService.getStats> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadedSettings = reminderService.getSettings();
    const loadedStats = reminderService.getStats();
    setSettings(loadedSettings);
    setStats(loadedStats);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      reminderService.saveSettings(settings);
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres de rappels ont été enregistrés avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = reminderService.getDefaultSettings();
    setSettings(defaultSettings);
    toast({
      title: 'Paramètres réinitialisés',
      description: 'Les paramètres par défaut ont été restaurés.',
    });
  };

  const handleChannelToggle = (
    channel: NotificationChannel,
    type: 'beforeDue' | 'afterDue'
  ) => {
    if (!settings) return;
    
    const channels = type === 'beforeDue'
      ? [...settings.reminderBeforeDueChannels]
      : [...settings.reminderAfterDueChannels];
    
    const index = channels.indexOf(channel);
    if (index >= 0) {
      channels.splice(index, 1);
    } else {
      channels.push(channel);
    }

    if (type === 'beforeDue') {
      setSettings({ ...settings, reminderBeforeDueChannels: channels });
    } else {
      setSettings({ ...settings, reminderAfterDueChannels: channels });
    }
  };

  const isChannelSelected = (
    channel: NotificationChannel,
    type: 'beforeDue' | 'afterDue'
  ): boolean => {
    if (!settings) return false;
    const channels = type === 'beforeDue'
      ? settings.reminderBeforeDueChannels
      : settings.reminderAfterDueChannels;
    return channels.includes(channel);
  };

  if (!settings || !stats) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" /> Configuration des rappels
          </h1>
          <p className="text-muted-foreground">
            Configurez les rappels automatiques avant échéance et les relances après retard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Statistiques des rappels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Envoyés avec succès</p>
              <p className="text-2xl font-bold text-green-700">{stats.totalSent}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Échoués</p>
              <p className="text-2xl font-bold text-red-700">{stats.totalFailed}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Email</p>
              <p className="text-2xl font-bold text-blue-700">{stats.byChannel.email.sent}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600">WhatsApp</p>
              <p className="text-2xl font-bold text-purple-700">{stats.byChannel.whatsapp.sent}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="beforeDue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beforeDue" className="gap-2">
            <Calendar className="h-4 w-4" /> Rappels avant échéance
          </TabsTrigger>
          <TabsTrigger value="afterDue" className="gap-2">
            <Clock className="h-4 w-4" /> Relances après retard
          </TabsTrigger>
        </TabsList>

        {/* Rappels avant échéance */}
        <TabsContent value="beforeDue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activation</CardTitle>
              <CardDescription>
                Activer les rappels automatiques avant la date d'échéance du loyer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="beforeDue-enabled"
                    checked={settings.reminderBeforeDueEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, reminderBeforeDueEnabled: checked })
                    }
                  />
                  <Label htmlFor="beforeDue-enabled">Activer les rappels avant échéance</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de jours avant l'échéance</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.reminderBeforeDueDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderBeforeDueDays: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Envoyer le rappel {settings.reminderBeforeDueDays} jour(s) avant l'échéance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canaux de notification</CardTitle>
              <CardDescription>
                Choisissez les canaux par lesquels envoyer les rappels avant échéance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('email', 'beforeDue')
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('email', 'beforeDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('email', 'beforeDue')}
                    onCheckedChange={() => handleChannelToggle('email', 'beforeDue')}
                  />
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Envoi par email</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('whatsapp', 'beforeDue')
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('whatsapp', 'beforeDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('whatsapp', 'beforeDue')}
                    onCheckedChange={() => handleChannelToggle('whatsapp', 'beforeDue')}
                  />
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Message WhatsApp</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('sms', 'beforeDue')
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('sms', 'beforeDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('sms', 'beforeDue')}
                    onCheckedChange={() => handleChannelToggle('sms', 'beforeDue')}
                  />
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">Message SMS</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message du rappel</CardTitle>
              <CardDescription>
                Personnalisez le message envoyé avant l'échéance. Variables disponibles:{' '}
                <code>{'{tenant_name}'}</code>, <code>{'{amount}'}</code>, <code>{'{due_date}'}</code>,{' '}
                <code>{'{period_start}'}</code>, <code>{'{period_end}'}</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                value={settings.messageBeforeDue}
                onChange={(e) =>
                  setSettings({ ...settings, messageBeforeDue: e.target.value })
                }
                placeholder="Entrez votre message de rappel..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relances après retard */}
        <TabsContent value="afterDue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activation</CardTitle>
              <CardDescription>
                Activer les relances automatiques après la date d'échéance du loyer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="afterDue-enabled"
                    checked={settings.reminderAfterDueEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, reminderAfterDueEnabled: checked })
                    }
                  />
                  <Label htmlFor="afterDue-enabled">Activer les relances après retard</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Jours de retard pour les relances</Label>
                <p className="text-sm text-muted-foreground">
                  Définir à quels jours de retard une relance doit être envoyée
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[3, 5, 7, 10, 14, 21, 30].map((days) => (
                    <Badge
                      key={days}
                      variant={
                        settings.reminderAfterDueDays.includes(days)
                          ? 'default'
                          : 'outline'
                      }
                      className={`cursor-pointer px-3 py-1 ${
                        settings.reminderAfterDueDays.includes(days)
                          ? 'bg-red-500 hover:bg-red-600'
                          : ''
                      }`}
                      onClick={() => {
                        const daysList = settings.reminderAfterDueDays.includes(days)
                          ? settings.reminderAfterDueDays.filter((d) => d !== days)
                          : [...settings.reminderAfterDueDays, days].sort((a, b) => a - b);
                        setSettings({ ...settings, reminderAfterDueDays: daysList });
                      }}
                    >
                      J+{days}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Canaux de notification</CardTitle>
              <CardDescription>
                Choisissez les canaux par lesquels envoyer les relances après retard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('email', 'afterDue')
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('email', 'afterDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('email', 'afterDue')}
                    onCheckedChange={() => handleChannelToggle('email', 'afterDue')}
                  />
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Envoi par email</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('whatsapp', 'afterDue')
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('whatsapp', 'afterDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('whatsapp', 'afterDue')}
                    onCheckedChange={() => handleChannelToggle('whatsapp', 'afterDue')}
                  />
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Message WhatsApp</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    isChannelSelected('sms', 'afterDue')
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle('sms', 'afterDue')}
                >
                  <Checkbox
                    checked={isChannelSelected('sms', 'afterDue')}
                    onCheckedChange={() => handleChannelToggle('sms', 'afterDue')}
                  />
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">Message SMS</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message de relance</CardTitle>
              <CardDescription>
                Personnalisez le message envoyé en cas de retard. Variables disponibles:{' '}
                <code>{'{tenant_name}'}</code>, <code>{'{amount}'}</code>, <code>{'{due_date}'}</code>,{' '}
                <code>{'{period_start}'}</code>, <code>{'{period_end}'}</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                value={settings.messageAfterDue}
                onChange={(e) =>
                  setSettings({ ...settings, messageAfterDue: e.target.value })
                }
                placeholder="Entrez votre message de relance..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
