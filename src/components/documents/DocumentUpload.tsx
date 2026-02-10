import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { documentService } from '../../services/documents.service';
import { DocumentType, DocumentCategory } from '../../types/document';
import { useToast } from '../ui/use-toast';

interface DocumentUploadProps {
  entityId: string;
  entityType: DocumentType;
  onUploadComplete?: () => void;
}

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export function DocumentUpload({ entityId, entityType, onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        if (!name) setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (!name) setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const validateFile = (file: File): boolean => {
    if (!allowedMimeTypes.includes(file.type)) {
      toast({
        title: 'Type de fichier non autorisé',
        description: 'Seuls les PDF et images (JPEG, PNG, GIF, WebP) sont acceptés.',
        variant: 'destructive',
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 10MB.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      await documentService.uploadDocument({
        file,
        type: entityType,
        category,
        entityId,
      });
      
      toast({
        title: 'Document uploadé',
        description: `${file.name} a été uploadé avec succès.`,
      });
      
      setFile(null);
      setName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <File className="h-8 w-8 text-gray-400" />;
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Type de document</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
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

      <div className="space-y-2">
        <Label htmlFor="doc-name">Nom du document (optionnel)</Label>
        <Input
          id="doc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom personnalisé pour le document"
        />
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {file ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getFileIcon()}
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {documentService.formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-10 w-10 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Glissez-déposez un fichier ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-400">
              PDF, JPEG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        )}
      </div>

      {file && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Upload en cours...' : 'Télécharger le document'}
        </Button>
      )}
    </div>
  );
}
