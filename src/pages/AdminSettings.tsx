import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Lock, Globe, CreditCard } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Settings className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wider font-body">Paramètres</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold">Paramètres du compte</h1>
      <p className="text-muted-foreground mt-1">Gérez vos informations et préférences</p>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Informations personnelles</CardTitle>
            </div>
            <CardDescription>Mettez à jour vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Jean" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jean.dupont@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="+237 6 90 12 34 56" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" defaultValue="SEEK Immobilier" />
            </div>
            <Button className="w-full">Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Gérez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">Recevoir les mises à jour par email</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nouvelle demande</p>
                <p className="text-sm text-muted-foreground">Être alerté lors d'une nouvelle demande</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Statistiques hebdomadaires</p>
                <p className="text-sm text-muted-foreground">Recevoir un résumé chaque semaine</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertes SMS</p>
                <p className="text-sm text-muted-foreground">Recevoir des alertes SMS urgentes</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="w-full">Changer le mot de passe</Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Préférences</CardTitle>
            </div>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Langue</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="utc">UTC +0 (Dakar)</option>
                <option value="utc1">UTC +1 (Paris)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Devise</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="xaf">XAF (Franc CFA)</option>
                <option value="eur">EUR (Euro)</option>
                <option value="usd">USD (Dollar)</option>
              </select>
            </div>
            <Button className="w-full">Enregistrer les préférences</Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de danger</CardTitle>
          <CardDescription>Actions irréversibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Supprimer le compte</p>
              <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte et toutes les données</p>
            </div>
            <Button variant="destructive">Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
