import React, { useEffect, useState } from 'react';
import { Bell, Clock, CreditCard, FileText, AlertCircle, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';
import { Notification } from '../types/tenant';

const TenantNotifications: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await tenantService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await tenantService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = () => {
    notifications
      .filter(n => !n.isRead)
      .forEach(n => markAsRead(n.id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      case 'charge':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-muted/50';
    switch (type) {
      case 'payment':
        return 'bg-red-50 border-red-200';
      case 'charge':
        return 'bg-orange-50 border-orange-200';
      case 'document':
        return 'bg-blue-50 border-blue-200';
      case 'reminder':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-muted';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent>
            <div className="h-96 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Restez informé de l'actualité de votre colocation
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm">{notifications.filter(n => !n.isRead && n.type === 'payment').length} paiements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-sm">{notifications.filter(n => !n.isRead && n.type === 'charge').length} charges</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-sm">{notifications.filter(n => !n.isRead && n.type === 'document').length} documents</span>
        </div>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Toutes les notifications
          </CardTitle>
          <CardDescription>
            {unreadCount > 0 
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes vos notifications ont été lues'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${getNotificationColor(notification.type, notification.isRead)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{notification.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {notification.type === 'payment' ? 'Paiement' :
                             notification.type === 'charge' ? 'Charge' :
                             notification.type === 'document' ? 'Document' :
                             notification.type === 'reminder' ? 'Rappel' : 'Général'}
                          </Badge>
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-auto p-0 text-xs text-primary hover:underline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="mx-auto h-12 w-12 mb-4" />
              <p>Aucune notification</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantNotifications;
