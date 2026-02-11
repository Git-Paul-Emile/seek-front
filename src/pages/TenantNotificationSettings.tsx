import React, { useEffect, useState, useCallback } from 'react';
import { 
  Bell, Mail, MessageSquare, Smartphone, 
  CalendarClock, CreditCard, FileText, 
  Settings, Save, Loader2, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import PageHeader from '../components/layout/PageHeader';
import notificationPreferencesService from '../services/notification-preferences.service';
import { NotificationPreference, NotificationChannel } from '../types/tenant';

const DAYS_OPTIONS = [
  { value: 1, label: '1 jour avant' },
  { value: 3, label: '3 jours avant' },
  { value: 5, label: '5 jours avant' },
  { value: 7, label: '7 jours avant' },
  { value: 14, label: '14 jours avant' },
];

const TenantNotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      const data = await notificationPreferencesService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les préférences de notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleSave = async () => {
    if (!preferences) return;
    
    setIsSaving(true);
    try {
      await notificationPreferencesService.updatePreferences({
        paymentReminder: preferences.paymentReminder,
        paymentReceived: preferences.paymentReceived,
        receiptAvailable: preferences.receiptAvailable,
        dueDateSoon: preferences.dueDateSoon,
        email: preferences.email,
        phone: preferences.phone,
        whatsapp: preferences.whatsapp,
      });
      toast({
        title: 'Succès',
        description: 'Préférences de notification enregistrées',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les préférences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChannel = (
    section: 'paymentReminder' | 'paymentReceived' | 'receiptAvailable' | 'dueDateSoon',
    channel: NotificationChannel
  ) => {
    if (!preferences) return;
    
    setPreferences(prev => {
      if (!prev) return prev;
      const sectionData = prev[section];
      const channels = sectionData.enabled 
        ? (sectionData.channels.includes(channel)
            ? sectionData.channels.filter(c => c !== channel)
            : [...sectionData.channels, channel])
        : sectionData.channels;
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          channels,
        },
      };
    });
  };

  const toggleSectionEnabled = (
    section: 'paymentReminder' | 'paymentReceived' | 'receiptAvailable' | 'dueDateSoon'
  ) => {
    if (!preferences) return;
    
    setPreferences(prev => {
      if (!prev) return prev;
      const sectionData = prev[section];
      return {
        ...prev,
        [section]: {
          ...sectionData,
          enabled: !sectionData.enabled,
        },
      };
    });
  };

  const updateDaysBeforeDue = (
    section: 'paymentReminder' | 'dueDateSoon',
    days: number
  ) => {
    if (!preferences) return;
    
    setPreferences(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          daysBeforeDue: days,
        },
      };
    });
  };

  const ChannelCheckbox: React.FC<{
    channel: NotificationChannel;
    section: 'paymentReminder' | 'paymentReceived' | 'receiptAvailable' | 'dueDateSoon';
    disabled?: boolean;
  }> = ({ channel, section, disabled }) => {
    const channelLabels: Record<NotificationChannel, { label: string; icon: React.ReactNode }> = {
      email: { label: 'Email', icon: <Mail className="h-4 w-4" /> },
      whatsapp: { label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" /> },
      sms: { label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
    };

    const isChecked = preferences?.[section]?.channels.includes(channel) ?? false;

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${section}-${channel}`}
          checked={isChecked}
          onCheckedChange={() => toggleChannel(section, channel)}
          disabled={disabled || !preferences?.[section]?.enabled}
        />
        <Label 
          htmlFor={`${section}-${channel}`} 
          className="flex items-center gap-2 cursor-pointer"
        >
          {channelLabels[channel].icon}
          {channelLabels[channel].label}
        </Label>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="NOTIFICATIONS"
        icon={Settings}
        description="Configurez vos préférences de notifications et rappels"
        action={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Paramètres de notification</h1>
      </PageHeader>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Coordonnées de notification
          </CardTitle>
          <CardDescription>
            Ces informations sont utilisées pour vous envoyer les notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={preferences?.email || ''}
                onChange={(e) => setPreferences(prev => prev ? { ...prev, email: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Téléphone (SMS)
              </Label>
              <Input
                id="phone"
                placeholder="+237 6 XX XX XX XX"
                value={preferences?.phone || ''}
                onChange={(e) => setPreferences(prev => prev ? { ...prev, phone: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                placeholder="+237 6 XX XX XX XX"
                value={preferences?.whatsapp || ''}
                onChange={(e) => setPreferences(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Rappel de paiement
          </CardTitle>
          <CardDescription>
            Recevez un rappel avant la date d'échéance de votre loyer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="paymentReminder-enabled"
                checked={preferences?.paymentReminder.enabled ?? false}
                onCheckedChange={() => toggleSectionEnabled('paymentReminder')}
              />
              <Label htmlFor="paymentReminder-enabled" className="cursor-pointer">
                Activer les rappels de paiement
              </Label>
            </div>
          </div>
          
          {preferences?.paymentReminder.enabled && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Envoyer le rappel</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={preferences.paymentReminder.daysBeforeDue}
                    onChange={(e) => updateDaysBeforeDue('paymentReminder', parseInt(e.target.value))}
                  >
                    {DAYS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Canaux de notification</Label>
                  <div className="flex flex-wrap gap-4">
                    <ChannelCheckbox channel="email" section="paymentReminder" />
                    <ChannelCheckbox channel="whatsapp" section="paymentReminder" />
                    <ChannelCheckbox channel="sms" section="paymentReminder" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Due Date Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Échéance proche
          </CardTitle>
          <CardDescription>
            Recevez une notification quand la date d'échéance approche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="dueDateSoon-enabled"
                checked={preferences?.dueDateSoon.enabled ?? false}
                onCheckedChange={() => toggleSectionEnabled('dueDateSoon')}
              />
              <Label htmlFor="dueDateSoon-enabled" className="cursor-pointer">
                Activer les notifications d'échéance proche
              </Label>
            </div>
          </div>
          
          {preferences?.dueDateSoon.enabled && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notifier quand il reste</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={preferences.dueDateSoon.daysBeforeDue}
                    onChange={(e) => updateDaysBeforeDue('dueDateSoon', parseInt(e.target.value))}
                  >
                    {DAYS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Canaux de notification</Label>
                  <div className="flex flex-wrap gap-4">
                    <ChannelCheckbox channel="email" section="dueDateSoon" />
                    <ChannelCheckbox channel="whatsapp" section="dueDateSoon" />
                    <ChannelCheckbox channel="sms" section="dueDateSoon" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Received */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement reçu
          </CardTitle>
          <CardDescription>
            Recevez une confirmation quand votre paiement est reçu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="paymentReceived-enabled"
                checked={preferences?.paymentReceived.enabled ?? false}
                onCheckedChange={() => toggleSectionEnabled('paymentReceived')}
              />
              <Label htmlFor="paymentReceived-enabled" className="cursor-pointer">
                Activer les notifications de paiement reçu
              </Label>
            </div>
          </div>
          
          {preferences?.paymentReceived.enabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Canaux de notification</Label>
                <div className="flex flex-wrap gap-4">
                  <ChannelCheckbox channel="email" section="paymentReceived" />
                  <ChannelCheckbox channel="whatsapp" section="paymentReceived" />
                  <ChannelCheckbox channel="sms" section="paymentReceived" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Receipt Available */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quittance disponible
          </CardTitle>
          <CardDescription>
            Recevez une notification quand une quittance est disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="receiptAvailable-enabled"
                checked={preferences?.receiptAvailable.enabled ?? false}
                onCheckedChange={() => toggleSectionEnabled('receiptAvailable')}
              />
              <Label htmlFor="receiptAvailable-enabled" className="cursor-pointer">
                Activer les notifications de quittance disponible
              </Label>
            </div>
          </div>
          
          {preferences?.receiptAvailable.enabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Canaux de notification</Label>
                <div className="flex flex-wrap gap-4">
                  <ChannelCheckbox channel="email" section="receiptAvailable" />
                  <ChannelCheckbox channel="whatsapp" section="receiptAvailable" />
                  <ChannelCheckbox channel="sms" section="receiptAvailable" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  );
};

export default TenantNotificationSettings;
