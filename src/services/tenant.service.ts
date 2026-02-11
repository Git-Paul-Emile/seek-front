import { Tenant, RoomInfo, LeaseContractInfo, TenantDashboardStats, Notification } from '../types/tenant';
import tenantAuthService from './tenant-auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Données simulées pour le développement
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Paiement reçu',
    message: 'Votre paiement de 150,000 XOF pour le mois de Février a été reçu avec succès.',
    type: 'payment',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Quittance disponible',
    message: 'Votre quittance de loyer pour Janvier 2026 est désormais disponible.',
    type: 'document',
    isRead: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Rappel de paiement',
    message: 'Votre loyer de Mars 2026 arrive à échéance dans 5 jours.',
    type: 'reminder',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'Nouvelle charge',
    message: 'Une nouvelle charge de 5,000 XOF a été ajoutée pour le mois de Février.',
    type: 'charge',
    isRead: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

class TenantService {
  private useMock = true; // À mettre à false quand le backend sera disponible

  private getAuthHeaders(): HeadersInit {
    const token = tenantAuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getDashboardStats(): Promise<TenantDashboardStats> {
    const response = await fetch(`${API_URL}/tenants/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Échec de la récupération des statistiques');
    }

    return response.json();
  }

  async getRoomInfo(): Promise<RoomInfo | null> {
    const response = await fetch(`${API_URL}/tenants/room`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération des informations de la chambre');

    return response.json();
  }

  async getLeaseContract(): Promise<LeaseContractInfo | null> {
    const response = await fetch(`${API_URL}/tenants/lease-contract`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération du contrat de bail');

    return response.json();
  }

  async getNotifications(): Promise<Notification[]> {
    if (this.useMock) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('notifications');
      if (stored) {
        return JSON.parse(stored);
      }
      return MOCK_NOTIFICATIONS;
    }

    const response = await fetch(`${API_URL}/tenants/notifications`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des notifications');

    return response.json();
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifications: Notification[] = JSON.parse(stored);
        const updated = notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
      }
      return;
    }

    const response = await fetch(`${API_URL}/tenants/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la mise à jour de la notification');
  }

  async getUpcomingPayments(): Promise<any[]> {
    const response = await fetch(`${API_URL}/tenants/payments/upcoming`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des paiements à venir');

    return response.json();
  }

  async getPaymentHistory(): Promise<any[]> {
    const response = await fetch(`${API_URL}/tenants/payments/history`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de l\'historique des paiements');

    return response.json();
  }

  async getPendingCharges(): Promise<any[]> {
    const response = await fetch(`${API_URL}/tenants/charges/pending`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des charges');

    return response.json();
  }

  async getDocuments(): Promise<any[]> {
    const response = await fetch(`${API_URL}/tenants/documents`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des documents');

    return response.json();
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/tenants/documents/${documentId}/download`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec du téléchargement du document');

    return response.blob();
  }

  async getColocataires(): Promise<any[]> {
    const response = await fetch(`${API_URL}/tenants/colocataires`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des colocataires');

    return response.json();
  }

  async contactProprietaire(message: string, subject: string): Promise<void> {
    const response = await fetch(`${API_URL}/tenants/contact/proprietaire`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, subject }),
    });

    if (!response.ok) throw new Error('Échec de l\'envoi du message');
  }

  async reportIssue(category: string, description: string, priority: 'low' | 'medium' | 'high'): Promise<void> {
    const response = await fetch(`${API_URL}/tenants/issues`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ category, description, priority }),
    });

    if (!response.ok) throw new Error('Échec de la soumission du problème');
  }
}

export const tenantService = new TenantService();
export default tenantService;
