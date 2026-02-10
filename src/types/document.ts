export type DocumentType = 'property' | 'room' | 'lease_contract' | 'tenant';

export type DocumentCategory = 
  | 'contract'
  | 'identity'
  | 'proof_of_income'
  | 'insurance'
  | 'inspection_report'
  | 'invoice'
  | 'other';

export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: DocumentType;
  category: DocumentCategory;
  mimeType: string;
  size: number;
  url: string;
  entityId: string; // ID du bien, chambre, contrat ou locataire
  ownerId: string; // ID du propriétaire
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentUpload {
  file: File;
  type: DocumentType;
  category: DocumentCategory;
  entityId: string;
}

export interface DocumentFilters {
  type?: DocumentType;
  category?: DocumentCategory;
  entityId?: string;
  search?: string;
}
