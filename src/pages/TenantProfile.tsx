import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, Camera, Save, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import tenantAuthService from '../services/tenant-auth.service';
import { Tenant, TenantUpdateProfile, TenantChangePassword } from '../types/tenant';

const TenantProfile: React.FC = () => {
  const { toast } = useToast();
  const tenant = tenantAuthService.getTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TenantUpdateProfile>({
    defaultValues: {
      firstName: tenant?.firstName || '',
      lastName: tenant?.lastName || '',
      phone: tenant?.phone || '',
    },
  });

  const [passwordForm, setPasswordForm] = useState<TenantChangePassword>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onSubmitProfile = async (data: TenantUpdateProfile) => {
    setIsLoading(true);
    try {
      const updatedTenant = await tenantAuthService.updateProfile(data);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été modifiées avec succès',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la mise à jour du profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La photo ne doit pas dépasser 5 Mo',
        variant: 'destructive',
      });
      return;
    }

    setPhotoUploading(true);
    try {
      const updatedTenant = await tenantAuthService.updateProfilePhoto(file);
      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été modifiée',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la mise à jour de la photo',
        variant: 'destructive',
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await tenantAuthService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été changé avec succès',
      });
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Échec du changement de mot de passe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={tenant?.profilePhoto} alt={tenant?.firstName} />
                <AvatarFallback className="text-2xl">
                  {tenant?.firstName?.charAt(0)}{tenant?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <CardTitle>{tenant?.firstName} {tenant?.lastName}</CardTitle>
            <CardDescription>{tenant?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{tenant?.email}</span>
              </div>
              {tenant?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{tenant?.phone}</span>
                </div>
              )}
            </div>
            <Separator />
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setIsChangingPassword(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de contact
                </CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      {...register('firstName', { required: 'Le prénom est requis' })}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      {...register('lastName', { required: 'Le nom est requis' })}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      'Enregistrement...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Prénom</Label>
                    <p className="font-medium">{tenant?.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nom</Label>
                    <p className="font-medium">{tenant?.lastName}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p className="font-medium">{tenant?.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{tenant?.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Entrez votre mot de passe actuel puis votre nouveau mot de passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Au moins 8 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
              {passwordForm.newPassword && passwordForm.confirmPassword && 
                passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-destructive">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
              Annuler
            </Button>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantProfile;
