import React, { useEffect, useState } from 'react';
import { agencyAuth, agencyService } from '@/services/agency-auth.service';
import type { AgencyTeamMember, AgencyRole } from '@/types/agency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Mail, Phone, Shield, MoreHorizontal, Edit, Trash2, UserPlus, Users } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

const roleLabels: Record<AgencyRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  accountant: 'Comptable',
  assistant: 'Assistant',
  agent: 'Agent',
  viewer: 'Vueur',
};

const roleColors: Record<AgencyRole, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  accountant: 'bg-blue-100 text-blue-800',
  assistant: 'bg-green-100 text-green-800',
  agent: 'bg-yellow-100 text-yellow-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const AgencyTeam: React.FC = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<AgencyTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AgencyRole>('assistant');

  const canManageTeam = agencyAuth.hasRole('admin') || agencyAuth.hasRole('manager');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await agencyService.getTeamMembers();
        setMembers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
        // Données mock pour le développement
        setMembers([
          {
            id: '1',
            agencyId: '1',
            email: 'admin@agence.com',
            firstName: 'Seydou',
            lastName: 'Diop',
            phone: '+221 77 123 45 67',
            role: 'admin',
            permissions: ['properties:read', 'properties:write', 'properties:delete', 'owners:read', 'owners:write', 'owners:delete', 'tenants:read', 'tenants:write', 'tenants:delete', 'contracts:read', 'contracts:write', 'contracts:delete', 'payments:read', 'payments:write', 'payments:delete', 'charges:read', 'charges:write', 'charges:delete', 'documents:read', 'documents:write', 'documents:delete', 'team:read', 'team:write', 'team:delete', 'reports:read', 'reports:export', 'settings:read', 'settings:write', 'billing:read', 'billing:write'],
            isActive: true,
            lastLoginAt: new Date().toISOString(),
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            agencyId: '1',
            email: 'fatou@agence.com',
            firstName: 'Fatou',
            lastName: 'Seck',
            phone: '+221 77 234 56 78',
            role: 'manager',
            permissions: ['properties:read', 'properties:write', 'owners:read', 'owners:write', 'tenants:read', 'tenants:write', 'contracts:read', 'contracts:write', 'payments:read', 'payments:write', 'charges:read', 'charges:write', 'documents:read', 'documents:write', 'team:read', 'team:write', 'reports:read', 'reports:export', 'settings:read', 'billing:read'],
            isActive: true,
            lastLoginAt: '2024-02-10T14:30:00Z',
            createdAt: '2024-02-01T09:00:00Z',
            updatedAt: '2024-02-01T09:00:00Z',
          },
          {
            id: '3',
            agencyId: '1',
            email: 'mamadou@agence.com',
            firstName: 'Mamadou',
            lastName: 'Faye',
            phone: '+221 77 345 67 89',
            role: 'accountant',
            permissions: ['properties:read', 'owners:read', 'tenants:read', 'contracts:read', 'payments:read', 'payments:write', 'charges:read', 'charges:write', 'documents:read', 'reports:read', 'reports:export', 'billing:read', 'billing:write'],
            isActive: true,
            lastLoginAt: '2024-02-12T08:15:00Z',
            createdAt: '2024-02-05T11:00:00Z',
            updatedAt: '2024-02-05T11:00:00Z',
          },
          {
            id: '4',
            agencyId: '1',
            email: 'asta@agence.com',
            firstName: 'Astou',
            lastName: 'Ndiaye',
            phone: '+221 77 456 78 90',
            role: 'assistant',
            permissions: ['properties:read', 'properties:write', 'owners:read', 'owners:write', 'tenants:read', 'contracts:read', 'payments:read', 'charges:read', 'documents:read', 'documents:write', 'team:read', 'reports:read'],
            isActive: false,
            createdAt: '2024-02-08T10:00:00Z',
            updatedAt: '2024-02-08T10:00:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    try {
      await agencyService.inviteTeamMember(inviteEmail, inviteRole);
      toast({
        title: 'Invitation发送ée',
        description: `Une invitation a été发送ée à ${inviteEmail}`,
      });
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('assistant');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;

    try {
      await agencyService.deleteTeamMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      toast({
        title: 'Membre supprimé',
        description: 'Le membre a été supprimé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="ÉQUIPE"
        icon={Users}
        description="Gérez les membres de votre équipe et leurs permissions"
        action={
          canManageTeam && (
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un membre</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation pour rejoindre l'équipe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Rôle</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AgencyRole)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="accountant">Comptable</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="viewer">Vueur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleInvite}>
                    Envoyer l'invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
      </PageHeader>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un membre..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary">
          {filteredMembers.length} membre(s)
        </Badge>
      </div>

      {/* Liste des membres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className={!member.isActive ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profilePhoto} />
                    <AvatarFallback>
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {member.firstName} {member.lastName}
                    </h3>
                    <Badge className={roleColors[member.role]}>
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                </div>
                {!member.isActive && (
                  <Badge variant="destructive">Inactif</Badge>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Dernière connexion:{' '}
                  {member.lastLoginAt
                    ? new Date(member.lastLoginAt).toLocaleDateString()
                    : 'Jamais'}
                </div>
                {canManageTeam && member.role !== 'admin' && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Aucun membre trouvé</h3>
            <p className="text-gray-500 mt-1">
              Aucune correspondance avec votre recherche
            </p>
          </CardContent>
        </Card>
      )}

      {/* Permissions legend */}
      <Card>
        <CardHeader>
          <CardTitle>Rôles et permissions</CardTitle>
          <CardDescription>
            Vue d'ensemble des permissions par rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="p-4 border rounded-lg">
                <Badge className={roleColors[role as AgencyRole]}>
                  {label}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  {role === 'admin' && 'Accès complet à toutes les fonctionnalités'}
                  {role === 'manager' && 'Gestion complète excepté les paramètres système'}
                  {role === 'accountant' && 'Accès aux finances et rapports'}
                  {role === 'assistant' && 'Support administratif'}
                  {role === 'agent' && 'Gestion des biens et clients'}
                  {role === 'viewer' && 'Accès en lecture seule'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyTeam;
