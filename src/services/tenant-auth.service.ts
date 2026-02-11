import { Tenant, TenantAuthResponse, TenantLoginCredentials, TenantUpdateProfile, TenantChangePassword } from '../types/tenant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Données démo pour tester sans backend
const DEMO_TENANT: Tenant = {
  id: 'demo-tenant-001',
  email: 'marie.dupont@email.com',
  firstName: 'Marie',
  lastName: 'Dupont',
  phone: '+33 6 12 34 56 78',
  profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  roomId: 'room-001',
  propertyId: 'property-001',
  leaseContractId: 'lease-001',
  moveInDate: '2024-09-01',
  monthlyRent: 550,
  securityDeposit: 1100,
  isActive: true,
  createdAt: '2024-08-15T10:00:00Z',
  updatedAt: '2024-08-15T10:00:00Z',
};

class TenantAuthService {
  private tokenKey = 'tenant_token';
  private refreshTokenKey = 'tenant_refresh_token';
  private tenantKey = 'tenant_data';

  async login(credentials: TenantLoginCredentials): Promise<TenantAuthResponse> {
    const response = await fetch(`${API_URL}/tenants/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la connexion');
    }

    const data: TenantAuthResponse = await response.json();
    this.storeAuthData(data);
    return data;
  }

  async loginWithGoogle(): Promise<void> {
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/tenants/auth/google`;
  }

  async loginWithFacebook(): Promise<void> {
    // Redirect to Facebook OAuth
    window.location.href = `${API_URL}/tenants/auth/facebook`;
  }

  // Connexion démo pour tester sans backend
  async loginDemo(): Promise<TenantAuthResponse> {
    const mockToken = 'demo-token-' + Date.now();
    const mockRefreshToken = 'demo-refresh-' + Date.now();
    
    const authData: TenantAuthResponse = {
      token: mockToken,
      refreshToken: mockRefreshToken,
      tenant: DEMO_TENANT,
    };
    
    this.storeAuthData(authData);
    console.log('🔐 Connexion démo activée avec:', DEMO_TENANT.email);
    return authData;
  }

  // Vérifier si c'est une connexion démo
  isDemoMode(): boolean {
    const token = this.getToken();
    return token?.startsWith('demo-') || false;
  }

  async handleOAuthCallback(token: string, refreshToken: string, tenant: Tenant): Promise<void> {
    const authData: TenantAuthResponse = { token, refreshToken, tenant };
    this.storeAuthData(authData);
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_URL}/tenants/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearAuthData();
      window.location.href = '/tenant/login';
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/tenants/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.storeAuthData(data);
      return true;
    } catch (error) {
      console.error('Erreur lors du refresh token:', error);
      return false;
    }
  }

  async updateProfile(data: TenantUpdateProfile): Promise<Tenant> {
    const token = this.getToken();
    if (!token) throw new Error('Non connecté');

    const response = await fetch(`${API_URL}/tenants/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la mise à jour du profil');
    }

    const updatedTenant: Tenant = await response.json();
    this.storeTenant(updatedTenant);
    return updatedTenant;
  }

  async updateProfilePhoto(file: File): Promise<Tenant> {
    const token = this.getToken();
    if (!token) throw new Error('Non connecté');

    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_URL}/tenants/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la mise à jour de la photo');
    }

    const updatedTenant: Tenant = await response.json();
    this.storeTenant(updatedTenant);
    return updatedTenant;
  }

  async changePassword(data: TenantChangePassword): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Non connecté');

    const response = await fetch(`${API_URL}/tenants/profile/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec du changement de mot de passe');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/tenants/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de l\'envoi du lien de réinitialisation');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/tenants/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Échec de la réinitialisation du mot de passe');
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getTenant(): Tenant | null {
    const tenantData = localStorage.getItem(this.tenantKey);
    return tenantData ? JSON.parse(tenantData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getTenant();
  }

  private storeAuthData(data: TenantAuthResponse): void {
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.refreshTokenKey, data.refreshToken);
    localStorage.setItem(this.tenantKey, JSON.stringify(data.tenant));
  }

  private storeTenant(tenant: Tenant): void {
    localStorage.setItem(this.tenantKey, JSON.stringify(tenant));
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tenantKey);
  }
}

export const tenantAuthService = new TenantAuthService();
export default tenantAuthService;
