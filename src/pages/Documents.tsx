import { useState, useEffect, useCallback } from 'react';
import { Search, Upload, FolderOpen, Files } from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { DocumentList } from '../components/documents/DocumentList';
import { documentService } from '../services/documents.service';
import { Document, DocumentType } from '../types/document';
import PageHeader from '../components/layout/PageHeader';

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load documents on mount
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter documents based on current filters
  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.originalName.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.type === typeFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((doc) => doc.type === activeTab);
    }

    setFilteredDocs(filtered);
  }, [documents, searchQuery, typeFilter, categoryFilter, activeTab]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const getDocumentCountByType = (type: DocumentType | 'all') => {
    if (type === 'all') return documents.length;
    return documents.filter((doc) => doc.type === type).length;
  };

  const renderUploadSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ajouter un document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="property" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="property">Bien</TabsTrigger>
            <TabsTrigger value="room">Chambre</TabsTrigger>
            <TabsTrigger value="lease_contract">Contrat</TabsTrigger>
            <TabsTrigger value="tenant">Locataire</TabsTrigger>
          </TabsList>
          
          {(['property', 'room', 'lease_contract', 'tenant'] as DocumentType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <DocumentUpload
                entityId={`new-${type}`}
                entityType={type}
                onUploadComplete={loadDocuments}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <PageHeader
        title="Documents"
        icon={FolderOpen}
        description="Gérez vos documents PDF et images"
      >
        Documents
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">{renderUploadSection()}</div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Documents ({filteredDocs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="property">Bien</SelectItem>
                    <SelectItem value="room">Chambre</SelectItem>
                    <SelectItem value="lease_contract">Contrat</SelectItem>
                    <SelectItem value="tenant">Locataire</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="identity">Pièce d'identité</SelectItem>
                    <SelectItem value="proof_of_income">Justificatif de revenus</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="inspection_report">Rapport d'inspection</SelectItem>
                    <SelectItem value="invoice">Facture</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs by type */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">
                    Tous ({getDocumentCountByType('all')})
                  </TabsTrigger>
                  <TabsTrigger value="property">
                    Biens ({getDocumentCountByType('property')})
                  </TabsTrigger>
                  <TabsTrigger value="room">
                    Chambres ({getDocumentCountByType('room')})
                  </TabsTrigger>
                  <TabsTrigger value="lease_contract">
                    Contrats ({getDocumentCountByType('lease_contract')})
                  </TabsTrigger>
                  <TabsTrigger value="tenant">
                    Locataires ({getDocumentCountByType('tenant')})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Document List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : (
                <DocumentList documents={filteredDocs} onDelete={loadDocuments} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
