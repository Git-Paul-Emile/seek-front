import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  FileText, 
  Receipt, 
  Bell, 
  Calendar, 
  Home,
  Users,
  ArrowRight,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import tenantAuthService from '../services/tenant-auth.service';
import tenantService from '../services/tenant.service';
import { TenantDashboardStats, RoomInfo, LeaseContractInfo, Notification } from '../types/tenant';
import PageHeader from '../components/layout/PageHeader';

const TenantDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<TenantDashboardStats | null>(null);
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [lease, setLease] = useState<LeaseContractInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const tenant = tenantAuthService.getTenant();

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, roomData, leaseData, notifsData] = await Promise.all([
          tenantService.getDashboardStats().catch(() => null),
          tenantService.getRoomInfo().catch(() => null),
          tenantService.getLeaseContract().catch(() => null),
          tenantService.getNotifications().catch(() => null),
        ]);
        
        setStats(statsData);
        setRoom(roomData);
        setLease(leaseData);
        setNotifications(notifsData?.slice(0, 5) || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const daysUntilPayment = lease?.startDate 
    ? Math.ceil((new Date(new Date(lease.startDate).setMonth(new Date(lease.startDate).getMonth() + 1)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <PageHeader
        title="TABLEAU DE BORD"
        icon={LayoutDashboard}
        description="Voici un aperçu de votre espace personnel"
        action={
          <Button variant="outline" asChild>
            <Link to="/tenant/profile">
              <Users className="mr-2 h-4 w-4" />
              Mon profil
            </Link>
          </Button>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loyer à payer</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lease?.monthlyRent ? `${lease.monthlyRent.toLocaleString()} €` : '-'}
            </div>
            {daysUntilPayment !== null && daysUntilPayment > 0 && (
              <p className="text-xs text-muted-foreground">
                Dans {Math.ceil(daysUntilPayment)} jours
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Charges en attente</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingCharges || 0}</div>
            <p className="text-xs text-muted-foreground">À régulariser</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.documentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Documents disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.messagesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Non lues</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Room Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ma chambre</CardTitle>
              <CardDescription>Informations sur votre espace</CardDescription>
            </div>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {room ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Logement</p>
                    <p className="font-medium">{room.propertyName}</p>
                    <p className="text-sm text-muted-foreground">{room.address}</p>
                  </div>
                  <Badge variant="secondary">Chambre {room.number}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                    <p className="font-medium">{room.monthlyRent.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{room.currentOccupants}/{room.capacity}</p>
                  </div>
                </div>
                <Progress value={(room.currentOccupants / room.capacity) * 100} />
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aucune chambre attribuée
              </p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/tenant/room">
                Voir les détails <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Lease Contract */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mon bail</CardTitle>
              <CardDescription>Contrat de location</CardDescription>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {lease ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lease.propertyName}</p>
                    <p className="text-sm text-muted-foreground">Chambre {lease.roomNumber}</p>
                  </div>
                  <Badge 
                    variant={lease.status === 'active' ? 'default' : lease.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {lease.status === 'active' ? 'Actif' : lease.status === 'pending' ? 'En attente' : 'Expiré'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p className="font-medium">
                      {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de fin</p>
                    <p className="font-medium">
                      {new Date(lease.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loyer</p>
                    <p className="font-medium">{lease.monthlyRent.toLocaleString()} €/mois</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépôt de garantie</p>
                    <p className="font-medium">{lease.securityDeposit.toLocaleString()} €</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Aucun bail trouvé
              </p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/tenant/lease">
                Voir le bail complet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Paiements à venir</CardTitle>
              <CardDescription>Vos prochain échéances</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lease ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Loyer mensuel</p>
                    <p className="text-sm text-muted-foreground">
                      Échéance le {new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{lease.monthlyRent.toLocaleString()} €</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune information de paiement
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tenant/payments">
                  Voir tous les paiements <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notifications récentes</CardTitle>
              <CardDescription>Dernières alertes</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${
                      notif.type === 'payment' ? 'bg-red-100 text-red-600' :
                      notif.type === 'charge' ? 'bg-orange-100 text-orange-600' :
                      notif.type === 'document' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {notif.type === 'payment' || notif.type === 'charge' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune notification
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tenant/notifications">
                  Voir toutes les notifications <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantDashboard;
