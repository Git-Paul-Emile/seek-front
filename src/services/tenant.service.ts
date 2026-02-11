import { Tenant, RoomInfo, LeaseContractInfo, TenantDashboardStats, Notification } from '../types/tenant';
import tenantAuthService from './tenant-auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class TenantService {
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
    const response = await fetch(`${API_URL}/tenants/notifications`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des notifications');

    return response.json();
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
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
