export interface Receipt {
  id: string;
  receiptNumber: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  roomId?: string;
  roomName?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference?: string;
  periodStart: Date;
  periodEnd: Date;
  status: 'paid' | 'partial' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptFilters {
  propertyId?: string;
  roomId?: string;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: Receipt['status'];
}

export interface ReceiptGenerationRequest {
  tenantId: string;
  propertyId: string;
  roomId?: string;
  amount: number;
  paymentMethod: Receipt['paymentMethod'];
  reference?: string;
  periodMonth: number;
  periodYear: number;
}

export interface BulkReceiptGeneration {
  filter: ReceiptFilters;
  recipients: ('email' | 'whatsapp' | 'sms')[];
}

export interface ReceiptStats {
  totalCollected: number;
  pendingAmount: number;
  receiptsCount: number;
  averageRent: number;
}
