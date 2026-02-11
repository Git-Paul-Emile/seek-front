import React, { useEffect, useState } from 'react';
import { FileText, Download, Upload, CreditCard, FileKey, Files, FileSpreadsheet, IdCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';
import PageHeader from '../components/layout/PageHeader';
import { DocumentCategory } from '../types/document';
import { DocumentUpload } from '../components/documents/DocumentUpload';

interface TenantDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  uploadedAt: string;
  url: string;
}

const TenantDocuments: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const data = await tenantService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async (doc: TenantDocument) => {
    try {
      const blob = await tenantService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Téléchargement réussi',
        description: `${doc.name} a été téléchargé.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec du téléchargement',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string, category: string) => {
    if (type.includes('pdf') || category === 'contract' || category === 'inspection_report') {
      return <FileText className="h-10 w-10 text-red-500" />;
    }
    if (category === 'payment') {
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
    }
    if (category === 'identity') {
      return <CreditCard className="h-10 w-10 text-blue-500" />;
    }
    return <FileText className="h-10 w-10 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate documents by category
  const leaseContracts = filteredDocuments.filter(d => d.category === 'contract' || d.type === 'lease_contract');
  const inspectionReports = filteredDocuments.filter(d => d.category === 'inspection_report');
  const receipts = filteredDocuments.filter(d => d.category === 'invoice');
  const personalDocuments = filteredDocuments.filter(d => d.category === 'identity');

  const renderDocumentCard = (doc: TenantDocument, index: number) => (
    <div
      key={`${doc.id}-${index}`}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        {getFileIcon(doc.type, doc.category)}
        <div>
          <p className="font-medium">{doc.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => downloadDocument(doc)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Download className="h-4 w-4 mr-2" />
        Télécharger
      </Button>
    </div>
  );

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="py-12 text-center">
      {icon}
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );

  const renderDocumentSection = (
    title: string,
    description: string,
    docs: TenantDocument[],
    icon: React.ReactNode,
    emptyTitle: string,
    emptyDesc: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          {docs.length} document{docs.length !== 1 ? 's' : ''} • {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={docs.length > 3 ? "h-[300px]" : "h-auto"}>
          <div className="space-y-3">
            {docs.length > 0 ? (
              docs.map((doc, index) => renderDocumentCard(doc, index))
            ) : (
              renderEmptyState(icon, emptyTitle, emptyDesc)
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent>
            <div className="h-96 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="DOCUMENTS"
        icon={Files}
        description="Accédez à tous vos documents"
        action={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un document personnel</DialogTitle>
                  <DialogDescription>
                    Téléversez une pièce d'identité (CNI, passeport) ou autre document.
                  </DialogDescription>
                </DialogHeader>
                <DocumentUpload
                  entityId="tenant-1"
                  entityType="tenant"
                  onUploadComplete={() => {
                    setIsUploadOpen(false);
                    loadDocuments();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Mes documents</h1>
      </PageHeader>

      {/* Search and count */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tabs for document organization */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="lease">Bail & État des lieux</TabsTrigger>
          <TabsTrigger value="receipts">Quittances</TabsTrigger>
          <TabsTrigger value="personal">Mes documents</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contrats de bail */}
            {renderDocumentSection(
              'Contrats de bail',
              'Documents officiels de votre location',
              leaseContracts,
              <FileText className="h-5 w-5 text-red-500" />,
              'Aucun contrat disponible',
              'Votre contrat de bail apparaîtra ici'
            )}

            {/* États des lieux */}
            {renderDocumentSection(
              'États des lieux',
              'Documents d\'entrée et de sortie',
              inspectionReports,
              <FileText className="h-5 w-5 text-orange-500" />,
              'Aucun état des lieux disponible',
              'Les états des lieux apparaissent ici'
            )}

            {/* Quittances de loyer */}
            {renderDocumentSection(
              'Quittances de loyer',
              'Preuves de vos paiements',
              receipts,
              <FileSpreadsheet className="h-5 w-5 text-green-500" />,
              'Aucune quittance disponible',
              'Vos quittances de loyer apparaissent ici'
            )}

            {/* Documents personnels */}
            {renderDocumentSection(
              'Mes documents personnels',
              'Pièces d\'identité et autres',
              personalDocuments,
              <CreditCard className="h-5 w-5 text-blue-500" />,
              'Aucun document personnel',
              'Ajoutez votre CNI, passeport ou autre document'
            )}
          </div>
        </TabsContent>

        <TabsContent value="lease" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {renderDocumentSection(
              'Contrats de bail',
              'Documents officiels de votre location',
              leaseContracts,
              <FileText className="h-5 w-5 text-red-500" />,
              'Aucun contrat disponible',
              'Votre contrat de bail apparaîtra ici'
            )}
            {renderDocumentSection(
              'États des lieux',
              'Documents d\'entrée et de sortie',
              inspectionReports,
              <FileText className="h-5 w-5 text-orange-500" />,
              'Aucun état des lieux disponible',
              'Les états des lieux apparaissent ici'
            )}
          </div>
        </TabsContent>

        <TabsContent value="receipts">
          {renderDocumentSection(
            'Quittances de loyer',
            'Preuves de vos paiements',
            receipts,
            <FileSpreadsheet className="h-5 w-5 text-green-500" />,
            'Aucune quittance disponible',
            'Vos quittances de loyer apparaissent ici'
          )}
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          {renderDocumentSection(
            'Mes documents personnels',
            'Pièces d\'identité et autres',
            personalDocuments,
            <CreditCard className="h-5 w-5 text-blue-500" />,
            'Aucun document personnel',
            'Ajoutez votre CNI, passeport ou autre document'
          )}
        </TabsContent>
      </Tabs>

      {/* Help section */}
      <Card>
        <CardHeader>
          <CardTitle>Documents importants</CardTitle>
          <CardDescription>
            Voici les documents que vous pourriez avoir besoin de consulter ou télécharger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-red-500 mb-2" />
              <p className="font-medium">Contrat de bail</p>
              <p className="text-sm text-muted-foreground">Document officiel de votre location</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-orange-500 mb-2" />
              <p className="font-medium">État des lieux</p>
              <p className="text-sm text-muted-foreground">Document d'entrée/sortie</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">Quittances</p>
              <p className="text-sm text-muted-foreground">Preuves de vos paiements</p>
            </div>
            <div className="p-4 border rounded-lg">
              <IdCard className="h-8 w-8 text-blue-500 mb-2" />
              <p className="font-medium">Pièces d'identité</p>
              <p className="text-sm text-muted-foreground">CNI, passeport ou autre</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantDocuments;
