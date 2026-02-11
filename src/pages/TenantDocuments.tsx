import React, { useEffect, useState } from 'react';
import { FileText, Download, Eye, Upload, Trash2, File, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import tenantService from '../services/tenant.service';

interface Document {
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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const downloadDocument = async (doc: Document) => {
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

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

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
      <div>
        <h1 className="text-3xl font-bold">Mes documents</h1>
        <p className="text-muted-foreground">
          Accédez à tous vos documents
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher un document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="secondary">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Documents by Category */}
      {Object.keys(documentsByCategory).length > 0 ? (
        Object.entries(documentsByCategory).map(([category, docs]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category === 'lease' ? 'Contrats de bail' :
                 category === 'payment' ? 'Paiements & quittances' :
                 category === 'charge' ? 'Charges' :
                 category === 'identity' ? 'Pièces d\'identité' :
                 category === 'insurance' ? 'Assurances' : category}
              </CardTitle>
              <CardDescription>
                {docs.length} document{docs.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getFileIcon(doc.type)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun document trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Aucun document ne correspond à votre recherche' : 'Aucun document disponible'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>Vos documents importants</CardTitle>
          <CardDescription>
            Liste des documents que vous pourriez avoir besoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Contrat de bail</p>
              <p className="text-sm text-muted-foreground">Document officiel de votre location</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Quittances de loyer</p>
              <p className="text-sm text-muted-foreground">Preuves de vos paiements</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">État des lieux</p>
              <p className="text-sm text-muted-foreground">Document d'entrée/sortie</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Attestation d'assurance</p>
              <p className="text-sm text-muted-foreground">Assurance habitation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantDocuments;
