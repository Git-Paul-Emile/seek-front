import React, { useState } from 'react';
import {
  Globe,
  MessageSquare,
  Smartphone,
  Mail,
  Bell,
  BellOff,
  Settings,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import PageHeader from '../components/layout/PageHeader';

type Language = 'fr' | 'wo';

type CommunicationChannel = 'email' | 'whatsapp' | 'sms';

interface PersonalSettings {
  language: Language;
  preferredChannel: CommunicationChannel;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  smsNotifications: boolean;
  marketingNotifications: boolean;
}

const TenantPersonalSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PersonalSettings>({
    language: 'fr',
    preferredChannel: 'whatsapp',
    notificationsEnabled: true,
    emailNotifications: true,
    whatsappNotifications: true,
    smsNotifications: false,
    marketingNotifications: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Succès',
      description: 'Paramètres personnels enregistrés avec succès',
    });
    
    setIsSaving(false);
  };

  const languageOptions = [
    { value: 'fr', label: 'Français', icon: '🇫🇷' },
    { value: 'wo', label: 'Wolof', icon: '🇸🇳' },
  ];

  const channelOptions = [
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'sms', label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="PARAMÈTRES PERSONNELS"
        icon={Settings}
        description="Gérez vos préférences personnelles et de communication"
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
        <h1 className="text-3xl font-bold tracking-tight">Paramètres personnels</h1>
      </PageHeader>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Langue de l'interface
          </CardTitle>
          <CardDescription>
            Choisissez la langue d'affichage de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.language}
            onValueChange={(value: Language) => setSettings(prev => ({ ...prev, language: value }))}
            className="grid gap-4 md:grid-cols-2"
          >
            {languageOptions.map(option => (
              <Label
                key={option.value}
                htmlFor={`language-${option.value}`}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent ${
                  settings.language === option.value ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                <RadioGroupItem value={option.value} id={`language-${option.value}`} />
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Preferred Communication Channel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Canal de communication préféré
          </CardTitle>
          <CardDescription>
            Sélectionnez le canal que vous préférez pour recevoir les communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.preferredChannel}
            onValueChange={(value: CommunicationChannel) => setSettings(prev => ({ ...prev, preferredChannel: value }))}
            className="grid gap-4 md:grid-cols-3"
          >
            {channelOptions.map(option => (
              <Label
                key={option.value}
                htmlFor={`channel-${option.value}`}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition-all hover:bg-accent ${
                  settings.preferredChannel === option.value ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="mb-2 rounded-full bg-primary/10 p-3 text-primary">
                  {option.icon}
                </div>
                <span className="font-medium">{option.label}</span>
                {settings.preferredChannel === option.value && (
                  <Check className="mt-2 h-4 w-4 text-primary" />
                )}
                <RadioGroupItem value={option.value} id={`channel-${option.value}`} className="sr-only" />
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settings.notificationsEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            Notifications
          </CardTitle>
          <CardDescription>
            Activez ou désactivez les notifications selon vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3">
              {settings.notificationsEnabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-base">Toutes les notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Activez ou désactivez toutes les notifications
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notificationsEnabled: checked }))}
            />
          </div>

          <Separator />

          {/* Individual Notification Toggles */}
          <div className={`space-y-4 ${!settings.notificationsEnabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <div>
                  <Label>Notifications par Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par email
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                disabled={!settings.notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <div>
                  <Label>Notifications WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications via WhatsApp
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.whatsappNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, whatsappNotifications: checked }))}
                disabled={!settings.notificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5" />
                <div>
                  <Label>Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par SMS
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                disabled={!settings.notificationsEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Marketing Notifications */}
          <div className={`flex items-center justify-between ${!settings.notificationsEnabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" />
              <div>
                <Label>Communications marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des informations et offres promotionnelles
                </p>
              </div>
            </div>
            <Switch
              checked={settings.marketingNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingNotifications: checked }))}
              disabled={!settings.notificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
};

export default TenantPersonalSettings;
