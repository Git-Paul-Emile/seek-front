import { useState } from 'react';
import { FileText, Image, File, Download, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { documentService } from '../../services/documents.service';
import { Document } from '../../types/document';
import { useToast } from '../ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface DocumentListProps {
  documents: Document[];
  onDelete?: () => void;
  showActions?: boolean;
}

export function DocumentList({ documents, onDelete, showActions = true }: DocumentListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le document.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await documentService.deleteDocument(deleteId);
      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès.',
      });
      onDelete?.();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (documentService.isImage(mimeType)) return <Image className="h-8 w-8 text-blue-500" />;
    if (documentService.isPDF(mimeType)) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>Aucun document disponible</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(doc.mimeType)}
              <div>
                <p className="font-medium">{doc.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{documentService.formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.createdAt)}</span>
                  <span>•</span>
                  <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                    {documentService.getCategoryLabel(doc.category)}
                  </span>
                </div>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewUrl(doc.url)}
                  title="Aperçu"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(doc)}
                  title="Télécharger"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(doc.id)}
                  title="Supprimer"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Simple preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
