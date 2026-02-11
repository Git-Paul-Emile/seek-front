import { Tenant, RoomInfo, LeaseContractInfo, TenantDashboardStats, Notification, PropertyInfo, CommonSpace, ColocationRules, Colocataire, DepartureRequest, SecurityDepositStatus } from '../types/tenant';
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

// Données simulées pour PropertyInfo
const MOCK_PROPERTY: PropertyInfo = {
  id: 'prop-1',
  name: 'Appartement T3 - Centre Ville',
  address: '123 Rue de la République, Apt 4B',
  city: 'Dakar',
  district: 'Plateau',
  proximity: 'Transports, Commerces, Écoles',
  type: 'Appartement T3',
  surface: 85,
  rooms: 3,
  bathrooms: 2,
  floor: '4ème étage',
  ownerName: 'Jean Dupont',
  ownerPhone: '+221 77 123 45 67',
  ownerEmail: 'jean.dupont@example.com',
  technicalPhone: '+221 76 987 65 43',
  technicalEmail: 'technique@seek.com',
  emergencyPhone: '+221 70 000 00 00',
  includedEquipments: ['Meubles', 'Cuisine équipée', 'WiFi', 'Machine à laver'],
  equipments: [
    { id: 'eq-1', name: 'WiFi Fibre', type: 'wifi', description: 'Connexion internet haut débit', isFunctional: true },
    { id: 'eq-2', name: 'Climatisation', type: 'climatisation', description: 'Climatisation réversible', isFunctional: true },
    { id: 'eq-3', name: 'TV LED 55"', type: 'tv', description: 'Télévision grand écran', isFunctional: true },
    { id: 'eq-4', name: 'Réfrigérateur', type: 'refrigerateur', description: 'Réfrigérateur américain', isFunctional: true },
    { id: 'eq-5', name: 'Machine à laver', type: 'machine_a_laver', description: 'Lave-linge 8kg', isFunctional: true },
    { id: 'eq-6', name: 'Cuisine équipée', type: 'cuisine_equipee', description: 'Four, plaques, hotte', isFunctional: true },
  ]
};

// Données simulées pour CommonSpaces
const MOCK_COMMON_SPACES: CommonSpace[] = [
  {
    id: 'cs-1',
    name: 'Cuisine',
    type: 'kitchen',
    description: 'Espace commun pour la préparation des repas',
    surface: 20,
    sharedWith: 2,
    rules: ['Nettoyage après utilisation', 'Pas d\'aliments périmés', 'Respect des affaires des autres'],
  },
  {
    id: 'cs-2',
    name: 'Salon',
    type: 'living_room',
    description: 'Espace commun de détente',
    surface: 30,
    sharedWith: 2,
    rules: ['Chaussures interdites', 'Télévision partagée -尊重 des choix', 'Volume sonore modéré'],
  },
  {
    id: 'cs-3',
    name: 'Salle de bain commune',
    type: 'bathroom',
    description: 'Salle de bain partagée',
    surface: 8,
    sharedWith: 1,
    rules: ['Nettoyage après utilisation', 'Produits personnels rangés', '30 min max sous la douche'],
  },
  {
    id: 'cs-4',
    name: 'Terrasse',
    type: 'terrasse',
    description: 'Espace extérieur commun',
    surface: 15,
    sharedWith: 2,
    rules: ['Fumer interdit', 'Nettoyage après barbecue', 'Respect des horaires de calme'],
  },
];

// Données simulées pour les colocataires
const MOCK_COLOCATAIRES: Colocataire[] = [
  {
    id: 'coloc-1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@email.com',
    phone: '+221 77 111 22 33',
    roomNumber: 'Chambre 1',
    moveInDate: '2025-09-01',
    isActive: true,
  },
  {
    id: 'coloc-2',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@email.com',
    phone: '+221 77 444 55 66',
    roomNumber: 'Chambre 2',
    moveInDate: '2025-10-15',
    isActive: true,
  },
];

// Règles de colocation simulées
const MOCK_COLOCATION_RULES: ColocationRules = {
  id: 'rules-1',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  guestPolicy: 'Invités autorisés jusqu\'à 23h en semaine, minuit le week-end. Prévenir les colocataires.',
  cleaningSchedule: 'Nettoyage轮流 chaque semaine. Planning affiché dans la cuisine.',
  sharedExpenses: 'Produits ménagers achetés en commun et partagés équitablement.',
  noiseLevel: ' Niveau sonore modéré en journée, silence absolu la nuit.',
  additionalRules: [
    'Respect des affaires personnelles de chacun',
    'Communication ouverte en cas de problème',
    'Règles de propreté à respecter scrupuleusement',
    'Pas de musique forte après 22h',
    'Prévenir en cas de retard de paiement',
  ],
};

class TenantService {
  private useMock = true;

  private getAuthHeaders(): HeadersInit {
    const token = tenantAuthService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getDashboardStats(): Promise<TenantDashboardStats> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        upcomingPayments: 500,
        pendingCharges: 150,
        documentsCount: 5,
        messagesCount: 2,
        leaseEndDate: '2026-08-31',
        daysUntilPayment: 5,
      };
    }

    const response = await fetch(`${API_URL}/tenants/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Échec de la récupération des statistiques');
    }

    return response.json();
  }

  async getRoomInfo(): Promise<RoomInfo | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: 'room-1',
        number: 'Chambre 3',
        propertyId: 'prop-1',
        propertyName: 'Appartement T3 - Centre Ville',
        address: '123 Rue de la République, Apt 4B',
        monthlyRent: 150000,
        capacity: 1,
        currentOccupants: 1,
      };
    }

    const response = await fetch(`${API_URL}/tenants/room`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération des informations de la chambre');

    return response.json();
  }

  async getPropertyInfo(): Promise<PropertyInfo | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PROPERTY;
    }

    const response = await fetch(`${API_URL}/tenants/property`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération des informations du logement');

    return response.json();
  }

  async getCommonSpaces(): Promise<CommonSpace[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_COMMON_SPACES;
    }

    const response = await fetch(`${API_URL}/tenants/common-spaces`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des espaces communs');

    return response.json();
  }

  async getColocationRules(): Promise<ColocationRules | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_COLOCATION_RULES;
    }

    const response = await fetch(`${API_URL}/tenants/colocation-rules`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération des règles de colocation');

    return response.json();
  }

  async getLeaseContract(): Promise<LeaseContractInfo | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: 'lease-1',
        startDate: '2025-09-01',
        endDate: '2026-08-31',
        monthlyRent: 150000,
        securityDeposit: 300000,
        securityDepositStatus: 'hold',
        status: 'active',
        propertyName: 'Appartement T3 - Centre Ville',
        roomNumber: 'Chambre 3',
        isColocation: true,
      };
    }

    const response = await fetch(`${API_URL}/tenants/lease-contract`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération du contrat de bail');

    return response.json();
  }

  async submitDepartureRequest(
    plannedDepartureDate: string,
    reason: string,
    noticePeriodDays: number = 30
  ): Promise<DepartureRequest> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const request: DepartureRequest = {
        id: `depart-${Date.now()}`,
        tenantId: 'current-tenant',
        leaseContractId: 'lease-1',
        requestDate: new Date().toISOString(),
        plannedDepartureDate,
        reason,
        status: 'pending',
        isColocation: true,
        noticePeriodDays,
        depositStatus: 'hold',
        depositAmount: 300000,
      };
      
      // Store in localStorage for mock persistence
      const existing = JSON.parse(localStorage.getItem('departureRequests') || '[]');
      existing.push(request);
      localStorage.setItem('departureRequests', JSON.stringify(existing));
      
      return request;
    }

    const response = await fetch(`${API_URL}/tenants/departure-request`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ plannedDepartureDate, reason, noticePeriodDays }),
    });

    if (!response.ok) throw new Error('Échec de la soumission de la demande de départ');

    return response.json();
  }

  async getDepartureRequest(): Promise<DepartureRequest | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('departureRequests');
      if (stored) {
        const requests = JSON.parse(stored) as DepartureRequest[];
        return requests.length > 0 ? requests[0] : null;
      }
      return null;
    }

    const response = await fetch(`${API_URL}/tenants/departure-request`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération de la demande de départ');

    return response.json();
  }

  async cancelDepartureRequest(requestId: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('departureRequests');
      if (stored) {
        const requests = JSON.parse(stored) as DepartureRequest[];
        const filtered = requests.filter(r => r.id !== requestId);
        localStorage.setItem('departureRequests', JSON.stringify(filtered));
      }
      return;
    }

    const response = await fetch(`${API_URL}/tenants/departure-request/${requestId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de l\'annulation de la demande de départ');
  }

  async getSecurityDepositStatus(): Promise<{ status: SecurityDepositStatus; amount: number; deductions?: { description: string; amount: number }[] } | null> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        status: 'hold',
        amount: 300000,
      };
    }

    const response = await fetch(`${API_URL}/tenants/security-deposit`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Échec de la récupération du statut de la caution');

    return response.json();
  }

  async getNotifications(): Promise<Notification[]> {
    if (this.useMock) {
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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 'pay-1', month: 'Mars 2026', amount: 150000, dueDate: '2026-03-01', status: 'pending' },
      ];
    }

    const response = await fetch(`${API_URL}/tenants/payments/upcoming`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des paiements à venir');

    return response.json();
  }

  async getPaymentHistory(): Promise<any[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 'pay-2', month: 'Février 2026', amount: 150000, dueDate: '2026-02-01', status: 'paid', paymentDate: '2026-02-01' },
        { id: 'pay-3', month: 'Janvier 2026', amount: 150000, dueDate: '2026-01-01', status: 'paid', paymentDate: '2026-01-02' },
        { id: 'pay-4', month: 'Décembre 2025', amount: 150000, dueDate: '2025-12-01', status: 'paid', paymentDate: '2025-12-01' },
      ];
    }

    const response = await fetch(`${API_URL}/tenants/payments/history`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de l\'historique des paiements');

    return response.json();
  }

  async getPendingCharges(): Promise<any[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 'charge-1', description: 'Charge commune Février', amount: 25000, dueDate: '2026-02-28', status: 'pending' },
        { id: 'charge-2', description: 'Internet', amount: 10000, dueDate: '2026-02-28', status: 'pending' },
      ];
    }

    const response = await fetch(`${API_URL}/tenants/charges/pending`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Échec de la récupération des charges');

    return response.json();
  }

  async getDocuments(): Promise<any[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 'doc-1', name: 'Contrat de bail', type: 'contract', createdAt: '2025-09-01' },
        { id: 'doc-2', name: 'Quittance Janvier 2026', type: 'receipt', createdAt: '2026-02-01' },
      ];
    }

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

  async getColocataires(): Promise<Colocataire[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_COLOCATAIRES;
    }

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
