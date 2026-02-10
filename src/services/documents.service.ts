import { Document, DocumentUpload, DocumentFilters, DocumentType, DocumentCategory } from '../types/document';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Simulated document storage for demo purposes
let documents: Document[] = [
  {
    id: '1',
    name: 'Contrat de bail - Appt. Dakar',
    originalName: 'contrat_bail.pdf',
    type: 'lease_contract',
    category: 'contract',
    mimeType: 'application/pdf',
    size: 245000,
    url: '/documents/contrat_bail.pdf',
    entityId: 'contract-1',
    ownerId: 'owner-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'CI - Jean Dupont',
    originalName: 'ci_jean.jpg',
    type: 'tenant',
    category: 'identity',
    mimeType: 'image/jpeg',
    size: 120000,
    url: '/documents/ci_jean.jpg',
    entityId: 'tenant-1',
    ownerId: 'owner-1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const documentService = {
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    await this.simulateDelay();
    
    let filtered = [...documents];
    
    if (filters?.type) {
      filtered = filtered.filter(d => d.type === filters.type);
    }
    if (filters?.category) {
      filtered = filtered.filter(d => d.category === filters.category);
    }
    if (filters?.entityId) {
      filtered = filtered.filter(d => d.entityId === filters.entityId);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(search) || 
        d.originalName.toLowerCase().includes(search)
      );
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async getDocumentById(id: string): Promise<Document | null> {
    await this.simulateDelay();
    return documents.find(d => d.id === id) || null;
  },

  async getDocumentsByEntity(entityId: string, type: DocumentType): Promise<Document[]> {
    await this.simulateDelay();
    return documents.filter(d => d.entityId === entityId && d.type === type);
  },

  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    await this.simulateDelay();
    
    const newDocument: Document = {
      id: crypto.randomUUID(),
      name: upload.file.name.replace(/\.[^/.]+$/, ''),
      originalName: upload.file.name,
      type: upload.type,
      category: upload.category,
      mimeType: upload.file.type,
      size: upload.file.size,
      url: URL.createObjectURL(upload.file),
      entityId: upload.entityId,
      ownerId: 'owner-1', // Should come from auth context
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    documents.push(newDocument);
    return newDocument;
  },

  async deleteDocument(id: string): Promise<void> {
    await this.simulateDelay();
    documents = documents.filter(d => d.id !== id);
  },

  async downloadDocument(id: string): Promise<Blob | null> {
    await this.simulateDelay();
    const doc = documents.find(d => d.id === id);
    if (!doc) return null;
    
    // In a real app, this would fetch from the server
    // For demo, we'll create a simple text blob
    const content = `Document: ${doc.name}\nType: ${doc.mimeType}\nSize: ${doc.size}`;
    return new Blob([content], { type: 'text/plain' });
  },

  async updateDocument(id: string, updates: Partial<Pick<Document, 'name' | 'category'>>): Promise<Document> {
    await this.simulateDelay();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');
    
    documents[index] = {
      ...documents[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return documents[index];
  },

  getDocumentTypeLabel(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
      property: 'Bien',
      room: 'Chambre',
      lease_contract: 'Contrat de bail',
      tenant: 'Locataire',
    };
    return labels[type];
  },

  getCategoryLabel(category: DocumentCategory): string {
    const labels: Record<DocumentCategory, string> = {
      contract: 'Contrat',
      identity: 'Pièce d\'identité',
      proof_of_income: 'Justificatif de revenus',
      insurance: 'Assurance',
      inspection_report: 'Rapport d\'inspection',
      invoice: 'Facture',
      other: 'Autre',
    };
    return labels[category];
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  isPDF(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  },

  getFileIcon(mimeType: string): string {
    if (this.isImage(mimeType)) return 'image';
    if (this.isPDF(mimeType)) return 'file-text';
    return 'file';
  },

  simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
