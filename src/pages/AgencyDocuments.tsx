import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  FileText, 
  FileSignature, 
  CreditCard, 
  Building,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  FolderOpen,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { documentService } from '@/services/documents.service';
import { useToast } from '@/components/ui/use-toast';

// Types
interface Document {
  id: string;
  name: string;
  type: 'contract' | 'inventory' | 'id_document' | 'bank_statement' | 'other';
  category: string;
  size: number;
  uploadedAt: string;
  status: 'active' | 'archived';
  fileUrl: string;
  propertyId?: string;
  tenantId?: string;
}

const documentTypeConfig = {
  contract: { icon: FileSignature, label: 'Contrat', color: 'bg-blue-100 text-blue-800' },
  inventory: { icon: Building, label: 'État des lieux', color: 'bg-green-100 text-green-800' },
  id_document: { icon: FileText, label: 'Pièce identité', color: 'bg-yellow-100 text-yellow-800' },
  bank_statement: { icon: CreditCard, label: 'Justificatif bancaire', color: 'bg-purple-100 text-purple-800' },
  other: { icon: FileText, label: 'Autre', color: 'bg-gray-100 text-gray-800' },
};

export const AgencyDocuments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for agency documents
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrat de bail - Appartement T3',
      type: 'contract',
      category: 'Contrats',
      size: 2456789,
      uploadedAt: '2024-01-15',
      status: 'active',
      fileUrl: '#',
      propertyId: 'prop-1',
    },
    {
      id: '2',
      name: 'État des lieux entrant - Studio',
      type: 'inventory',
      category: 'États des lieux',
      size: 1234567,
      uploadedAt: '2024-01-10',
      status: 'active',
      fileUrl: '#',
      propertyId: 'prop-2',
    },
    {
      id: '3',
      name: 'Carte d\'identité - Dupont',
      type: 'id_document',
      category: 'Pièces identité',
      size: 987654,
      uploadedAt: '2024-01-08',
      status: 'active',
      fileUrl: '#',
      tenantId: 'tenant-1',
    },
    {
      id: '4',
      name: 'Relevé bancaire Janvier 2024',
      type: 'bank_statement',
      category: 'Justificatifs bancaires',
      size: 567890,
      uploadedAt: '2024-02-01',
      status: 'active',
      fileUrl: '#',
      tenantId: 'tenant-1',
    },
    {
      id: '5',
      name: 'Ancien contrat - Résilié',
      type: 'contract',
      category: 'Contrats',
      size: 2345678,
      uploadedAt: '2023-06-15',
      status: 'archived',
      fileUrl: '#',
      propertyId: 'prop-3',
    },
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeDocuments = filteredDocuments.filter((d) => d.status === 'active');
  const archivedDocuments = filteredDocuments.filter((d) => d.status === 'archived');

  const handleDownload = (doc: Document) => {
    toast({
      title: 'Téléchargement started',
      description: `Téléchargement de ${doc.name}...`,
    });
    // Simulate download
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.click();
  };

  const handleArchive = (docId: string) => {
    toast({
      title: 'Document archivé',
      description: 'Le document a été déplacé dans les archives',
    });
  };

  const handleDelete = (docId: string) => {
    toast({
      title: 'Document supprimé',
      description: 'Le document a été définitivement supprimé',
      variant: 'destructive',
    });
  };

  const handleUpload = () => {
    toast({
      title: 'Upload',
      description: 'Fonctionnalité de téléversement à implémenter',
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Gérez vos contrats, états des lieux, pièces d'identité et justificatifs bancaires
          </p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Téléverser un document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrats</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.type === 'contract').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">États des lieux</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.type === 'inventory').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archives</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.status === 'archived').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="contract">Contrats</SelectItem>
                  <SelectItem value="inventory">États des lieux</SelectItem>
                  <SelectItem value="id_document">Pièces d'identité</SelectItem>
                  <SelectItem value="bank_statement">Justificatifs bancaires</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            <FolderOpen className="mr-2 h-4 w-4" />
            Tous ({activeDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="mr-2 h-4 w-4" />
            Archivés ({archivedDocuments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents actifs</CardTitle>
              <CardDescription>
                {activeDocuments.length} document(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun document trouvé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDocuments.map((doc) => {
                    const typeConfig = documentTypeConfig[doc.type];
                    const Icon = typeConfig.icon;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-lg p-2 ${typeConfig.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{typeConfig.label}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{doc.category}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(doc.id)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archiver
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(doc.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents archivés</CardTitle>
              <CardDescription>
                {archivedDocuments.length} document(s) archivé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {archivedDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun document archivé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {archivedDocuments.map((doc) => {
                    const typeConfig = documentTypeConfig[doc.type];
                    const Icon = typeConfig.icon;
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-lg p-2 ${typeConfig.color} opacity-70`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{typeConfig.label}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>Archivé le {formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Télécharger
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDelete(doc.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer définitivement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencyDocuments;
