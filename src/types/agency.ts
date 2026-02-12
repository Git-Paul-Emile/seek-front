// Types pour l'Agence Immobilière

export type AgencyRole = 
  | 'admin'        // Administrateur principal de l'agence
  | 'manager'      // Manager - gestion complète
  | 'accountant'   // Comptable - accès aux finances
  | 'assistant'    // Assistant - support administratif
  | 'agent'        // Agent - gestion des biens et clients
  | 'viewer';      // Vueur - accès en lecture seule

export type AgencyPermission = 
  | 'properties:read'
  | 'properties:write'
  | 'properties:delete'
  | 'owners:read'
  | 'owners:write'
  | 'owners:delete'
  | 'tenants:read'
  | 'tenants:write'
  | 'tenants:delete'
  | 'contracts:read'
  | 'contracts:write'
  | 'contracts:delete'
  | 'payments:read'
  | 'payments:write'
  | 'payments:delete'
  | 'charges:read'
  | 'charges:write'
  | 'charges:delete'
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'team:read'
  | 'team:write'
  | 'team:delete'
  | 'reports:read'
  | 'reports:export'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write';

// Mapping des permissions par rôle
export const ROLE_PERMISSIONS: Record<AgencyRole, AgencyPermission[]> = {
  admin: [
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
  manager: [
    'properties:read', 'properties:write',
    'owners:read', 'owners:write',
    'tenants:read', 'tenants:write',
    'contracts:read', 'contracts:write',
    'payments:read', 'payments:write',
    'charges:read', 'charges:write',
    'documents:read', 'documents:write',
    'team:read', 'team:write',
    'reports:read', 'reports:export',
    'settings:read',
    'billing:read',
  ],
  accountant: [
    'properties:read',
    'owners:read',
    'tenants:read',
    'contracts:read',
    'payments:read', 'payments:write',
    'charges:read', 'charges:write',
    'documents:read',
    'reports:read', 'reports:export',
    'billing:read', 'billing:write',
  ],
  assistant: [
    'properties:read', 'properties:write',
    'owners:read', 'owners:write',
    'tenants:read',
    'contracts:read',
    'payments:read',
    'charges:read',
    'documents:read', 'documents:write',
    'team:read',
    'reports:read',
  ],
  agent: [
    'properties:read', 'properties:write',
    'owners:read',
    'tenants:read', 'tenants:write',
    'contracts:read', 'contracts:write',
    'payments:read',
    'charges:read',
    'documents:read', 'documents:write',
    'reports:read',
  ],
  viewer: [
    'properties:read',
    'owners:read',
    'tenants:read',
    'contracts:read',
    'payments:read',
    'charges:read',
    'documents:read',
    'reports:read',
  ],
};

// Interface Agence
export interface Agency {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  logo?: string;
  licenseNumber?: string;
  taxId?: string;
  website?: string;
  description?: string;
  primaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface Membre d'équipe d'agence
export interface AgencyTeamMember {
  id: string;
  agencyId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhoto?: string;
  role: AgencyRole;
  permissions: AgencyPermission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface d'invitation d'équipe
export interface AgencyTeamInvitation {
  id: string;
  agencyId: string;
  email: string;
  role: AgencyRole;
  token: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

// Authentification
export interface AgencyLoginCredentials {
  email: string;
  password: string;
}

export interface AgencyAuthResponse {
  token: string;
  refreshToken: string;
  agency: Agency;
  user: AgencyTeamMember;
  permissions: AgencyPermission[];
}

export interface AgencyRegisterData {
  name: string;
  legalName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  licenseNumber?: string;
  taxId?: string;
}

// Mise à jour de profil agence
export interface AgencyUpdateProfile {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  logo?: string;
  licenseNumber?: string;
  taxId?: string;
  website?: string;
  description?: string;
  primaryColor?: string;
}

// Mise à jour de membre d'équipe
export interface AgencyTeamMemberUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: AgencyRole;
  permissions?: AgencyPermission[];
  isActive?: boolean;
}

// Propriétaire associé à une agence
export interface AgencyOwner {
  id: string;
  agencyId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  propertiesCount: number;
  totalRevenue: number;
  isActive: boolean;
  addedAt: string;
}

// Bien associé à une agence
export interface AgencyProperty {
  id: string;
  agencyId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  ownerName: string;
  ownerEmail: string;
  managementFee: number; // Pourcentage de commission
  status: 'active' | 'inactive' | 'pending';
  addedAt: string;
}

// Rapport d'agence
export interface AgencyReport {
  id: string;
  agencyId: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  propertiesCount: number;
  tenantsCount: number;
  occupancyRate: number;
  paymentCollectionRate: number;
  generatedAt: string;
}

// Statistiques d'agence
export interface AgencyStats {
  totalProperties: number;
  totalTenants: number;
  totalOwners: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingPayments: number;
  expiringContracts: number;
  recentActivities: AgencyActivity[];
}

export interface AgencyActivity {
  id: string;
  type: 'payment' | 'contract' | 'tenant' | 'property' | 'owner' | 'document';
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'cancelled';
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Multi-facturation - Client de facturation
export interface AgencyBillingClient {
  id: string;
  agencyId: string;
  clientType: 'owner' | 'tenant' | 'other';
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  billingAddress?: string;
  isActive: boolean;
  invoicesCount: number;
  totalAmount: number;
  createdAt: string;
}

// Mandat de gestion
export interface ManagementMandate {
  id: string;
  agencyId: string;
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyName: string;
  type: 'GESTION_COMPLETE' | 'GESTION_LOCATIVE' | 'TRANSACTION';
  startDate: string;
  endDate: string;
  managementFeePercent: number;
  isActive: boolean;
  createdAt: string;
}

// Type pour la création d'un mandat
export interface CreateMandateData {
  ownerId: string;
  propertyId: string;
  type: 'GESTION_COMPLETE' | 'GESTION_LOCATIVE' | 'TRANSACTION';
  startDate: string;
  endDate: string;
  managementFeePercent: number;
}

// Type pour l'invitation d'un propriétaire
export interface OwnerInvitationData {
  email: string;
  message?: string;
}

// Type pour la création d'un compte propriétaire
export interface CreateOwnerData {
  fullName: string;
  email: string;
  phone: string;
  ownerType: 'PARTICULAR' | 'COMPANY';
  companyName?: string;
  address?: string;
  city?: string;
}

// Facture
export interface AgencyInvoice {
  id: string;
  agencyId: string;
  clientId: string;
  invoiceNumber: string;
  type: 'management_fee' | 'rent' | 'charge' | 'service' | 'other';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  items: AgencyInvoiceItem[];
  paidAt?: string;
  createdAt: string;
}

export interface AgencyInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
