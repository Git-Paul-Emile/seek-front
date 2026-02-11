export interface Tenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePhoto?: string;
  roomId?: string;
  propertyId?: string;
  leaseContractId?: string;
  moveInDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAuthResponse {
  token: string;
  refreshToken: string;
  tenant: Tenant;
}

export interface TenantLoginCredentials {
  email: string;
  password: string;
}

export interface TenantUpdateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TenantChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RoomInfo {
  id: string;
  number: string;
  propertyId: string;
  propertyName: string;
  address: string;
  monthlyRent: number;
  capacity: number;
  currentOccupants: number;
}

export interface LeaseContractInfo {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  propertyName: string;
  roomNumber: string;
}

export interface TenantDashboardStats {
  upcomingPayments: number;
  pendingCharges: number;
  documentsCount: number;
  messagesCount: number;
  leaseEndDate?: string;
  daysUntilPayment?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'charge' | 'document' | 'general' | 'reminder';
  isRead: boolean;
  createdAt: string;
}
