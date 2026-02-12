import type {
  Agency,
  AgencyAuthResponse,
  AgencyBillingClient,
  AgencyInvoice,
  AgencyLoginCredentials,
  AgencyOwner,
  AgencyProperty,
  AgencyRegisterData,
  AgencyReport,
  AgencyStats,
  AgencyTeamInvitation,
  AgencyTeamMember,
  AgencyTeamMemberUpdate,
  AgencyUpdateProfile,
} from '@/types/agency';

// Clé de stockage pour le token
const AGENCY_TOKEN_KEY = 'agency_token';
const AGENCY_REFRESH_TOKEN_KEY = 'agency_refresh_token';
const AGENCY_USER_KEY = 'agency_user';
const AGENCY_PERMISSIONS_KEY = 'agency_permissions';

// URL de base de l'API (à configurer selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Service d'authentification pour l'Agence Immobilière
 */
class AgencyAuthService {
  private token: string | null = null;
  private _refreshAuthToken: string | null = null;
  private user: AgencyTeamMember | null = null;
  private permissions: string[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // ============ Stockage local ============

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AGENCY_TOKEN_KEY);
      this._refreshAuthToken = localStorage.getItem(AGENCY_REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(AGENCY_USER_KEY);
      const permissionsStr = localStorage.getItem(AGENCY_PERMISSIONS_KEY);
      
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch {
          this.user = null;
        }
      }
      
      if (permissionsStr) {
        try {
          this.permissions = JSON.parse(permissionsStr);
        } catch {
          this.permissions = [];
        }
      }
    }
  }

  private saveToStorage(
    token: string,
    refreshToken: string,
    user: AgencyTeamMember,
    permissions: string[]
  ): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AGENCY_TOKEN_KEY, token);
      localStorage.setItem(AGENCY_REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(AGENCY_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AGENCY_PERMISSIONS_KEY, JSON.stringify(permissions));
    }
    this.token = token;
    this._refreshAuthToken = refreshToken;
    this.user = user;
    this.permissions = permissions;
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AGENCY_TOKEN_KEY);
      localStorage.removeItem(AGENCY_REFRESH_TOKEN_KEY);
      localStorage.removeItem(AGENCY_USER_KEY);
      localStorage.removeItem(AGENCY_PERMISSIONS_KEY);
    }
    this.token = null;
    this._refreshAuthToken = null;
    this.user = null;
    this.permissions = [];
  }

  // ============ Authentification ============

  /**
   * Connexion d'une agence
   */
  async login(credentials: AgencyLoginCredentials): Promise<AgencyAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/agency/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    const data: AgencyAuthResponse = await response.json();
    this.saveToStorage(data.token, data.refreshToken, data.user, data.permissions);
    return data;
  }

  /**
   * Enregistrement d'une nouvelle agence
   */
  async register(data: AgencyRegisterData): Promise<AgencyAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/agency/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur d'enregistrement");
    }

    const responseData: AgencyAuthResponse = await response.json();
    this.saveToStorage(responseData.token, responseData.refreshToken, responseData.user, responseData.permissions);
    return responseData;
  }

  /**
   * Connexion rapide pour démonstration (utilise des données mock)
   */
  async demoLogin(): Promise<void> {
    // Données de démonstration
    const mockUser: AgencyTeamMember = {
      id: 'demo-user-1',
      agencyId: 'demo-agency-1',
      email: 'demo@seek.sn',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
      profilePhoto: undefined,
      isActive: true,
      permissions: [
        'properties:read', 'properties:write', 'properties:delete',
        'owners:read', 'owners:write', 'owners:delete',
        'tenants:read', 'tenants:write', 'tenants:delete',
        'contracts:read', 'contracts:write', 'contracts:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'charges:read', 'charges:write', 'charges:delete',
        'documents:read', 'documents:write', 'documents:delete',
        'team:read', 'team:write', 'team:delete',
        'reports:read', 'reports:export',
        'settings:read', 'settings:write',
        'billing:read', 'billing:write',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockPermissions = mockUser.permissions;
    const mockToken = 'demo-token-' + Date.now();
    const mockRefreshToken = 'demo-refresh-' + Date.now();

    this.saveToStorage(mockToken, mockRefreshToken, mockUser, mockPermissions);
  }

  /**
   * Connexion avec Google
   */
  loginWithGoogle(): void {
    // Redirection vers l'authentification Google OAuth
    const googleAuthUrl = `${API_BASE_URL}/agency/auth/google`;
    window.location.href = googleAuthUrl;
  }

  /**
   * Connexion avec Facebook
   */
  loginWithFacebook(): void {
    // Redirection vers l'authentification Facebook OAuth
    const facebookAuthUrl = `${API_BASE_URL}/agency/auth/facebook`;
    window.location.href = facebookAuthUrl;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.clearStorage();
  }

  /**
   * Vérification du token et rafraîchissement si nécessaire
   */
  async verifyToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/agency/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Rafraîchissement du token
   */
  async refreshAuthToken(): Promise<boolean> {
    if (!this._refreshAuthToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/agency/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this._refreshAuthToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (this.user) {
        this.saveToStorage(data.token, data.refreshToken, this.user, this.permissions);
      }
      return true;
    } catch {
      return false;
    }
  }

  // ============ Getters ============

  get isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  get currentUser(): AgencyTeamMember | null {
    return this.user;
  }

  get currentPermissions(): string[] {
    return this.permissions;
  }

  get tokenValue(): string | null {
    return this.token;
  }

  /**
   * Vérifier si l'utilisateur a une permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  /**
   * Vérifier si l'utilisateur est manager ou admin
   */
  get isManager(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'manager';
  }
}

/**
 * Service pour les opérations de l'agence (API calls)
 */
class AgencyService {
  private get headers(): HeadersInit {
    const token = localStorage.getItem(AGENCY_TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private get baseUrl(): string {
    return `${API_BASE_URL}/agency`;
  }

  // ============ Profil ============

  async getProfile(): Promise<Agency> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du profil');
    return response.json();
  }

  async updateProfile(data: AgencyUpdateProfile): Promise<Agency> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
    return response.json();
  }

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${this.baseUrl}/profile/logo`, {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem(AGENCY_TOKEN_KEY) || '',
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Erreur lors du téléchargement du logo');
    const data = await response.json();
    return data.logoUrl;
  }

  // ============ Équipe ============

  async getTeamMembers(): Promise<AgencyTeamMember[]> {
    const response = await fetch(`${this.baseUrl}/team`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération de l\'équipe');
    return response.json();
  }

  async getTeamMember(id: string): Promise<AgencyTeamMember> {
    const response = await fetch(`${this.baseUrl}/team/${id}`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du membre');
    return response.json();
  }

  async updateTeamMember(id: string, data: AgencyTeamMemberUpdate): Promise<AgencyTeamMember> {
    const response = await fetch(`${this.baseUrl}/team/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du membre');
    return response.json();
  }

  async deleteTeamMember(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/team/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du membre');
  }

  async inviteTeamMember(email: string, role: string): Promise<AgencyTeamInvitation> {
    const response = await fetch(`${this.baseUrl}/team/invite`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'invitation');
    return response.json();
  }

  async acceptInvitation(token: string): Promise<AgencyAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/agency/auth/invitation/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'acceptation de l\'invitation');
    return response.json();
  }

  // ============ Propriétaires ============

  async getOwners(): Promise<AgencyOwner[]> {
    const response = await fetch(`${this.baseUrl}/owners`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des propriétaires');
    return response.json();
  }

  async getOwner(id: string): Promise<AgencyOwner> {
    const response = await fetch(`${this.baseUrl}/owners/${id}`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du propriétaire');
    return response.json();
  }

  async addOwner(ownerId: string): Promise<AgencyOwner> {
    const response = await fetch(`${this.baseUrl}/owners`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ ownerId }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'ajout du propriétaire');
    return response.json();
  }

  async removeOwner(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/owners/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du propriétaire');
  }

  // ============ Biens ============

  async getProperties(): Promise<AgencyProperty[]> {
    const response = await fetch(`${this.baseUrl}/properties`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des biens');
    return response.json();
  }

  async getProperty(id: string): Promise<AgencyProperty> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du bien');
    return response.json();
  }

  async addProperty(propertyId: string, managementFee: number): Promise<AgencyProperty> {
    const response = await fetch(`${this.baseUrl}/properties`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ propertyId, managementFee }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'ajout du bien');
    return response.json();
  }

  async updateProperty(id: string, data: Partial<AgencyProperty>): Promise<AgencyProperty> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du bien');
    return response.json();
  }

  async removeProperty(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du bien');
  }

  // ============ Statistiques ============

  async getStats(): Promise<AgencyStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return response.json();
  }

  // ============ Rapports ============

  async getReports(type?: string): Promise<AgencyReport[]> {
    const url = type ? `${this.baseUrl}/reports?type=${type}` : `${this.baseUrl}/reports`;
    const response = await fetch(url, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des rapports');
    return response.json();
  }

  async generateReport(type: string, startDate: string, endDate: string): Promise<AgencyReport> {
    const response = await fetch(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ type, startDate, endDate }),
    });
    if (!response.ok) throw new Error('Erreur lors de la génération du rapport');
    return response.json();
  }

  async downloadReport(id: string, format: 'pdf' | 'xlsx'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/${id}/download?format=${format}`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors du téléchargement du rapport');
    return response.blob();
  }

  // ============ Facturation ============

  async getBillingClients(): Promise<AgencyBillingClient[]> {
    const response = await fetch(`${this.baseUrl}/billing/clients`, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
    return response.json();
  }

  async getInvoices(clientId?: string): Promise<AgencyInvoice[]> {
    const url = clientId ? `${this.baseUrl}/invoices?clientId=${clientId}` : `${this.baseUrl}/invoices`;
    const response = await fetch(url, {
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des factures');
    return response.json();
  }

  async createInvoice(data: Partial<AgencyInvoice>): Promise<AgencyInvoice> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la facture');
    return response.json();
  }

  async sendInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/invoices/${id}/send`, {
      method: 'POST',
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de l\'envoi de la facture');
  }

  async markInvoiceAsPaid(id: string): Promise<AgencyInvoice> {
    const response = await fetch(`${this.baseUrl}/invoices/${id}/paid`, {
      method: 'POST',
      headers: this.headers,
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de la facture');
    return response.json();
  }
}

// Export des instances
export const agencyAuth = new AgencyAuthService();
export const agencyService = new AgencyService();

// Export des types pour utilisation
export type { AgencyAuthResponse, AgencyLoginCredentials, AgencyRegisterData };
