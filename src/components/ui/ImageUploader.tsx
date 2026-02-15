/**
 * Composant d'upload d'images avec drag & drop
 * Supporte la photo de couverture + photos supplémentaires
 */

import React, { useCallback, useState } from 'react';
import { Upload, X, Star, Image as ImageIcon, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '../../lib/utils';
import axiosInstance from '@/api/axiosConfig';

// Types
export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  quality: 'excellente' | 'bonne' | 'moyenne' | 'faible' | null;
  isCover: boolean;
  error?: string;
  uploaded?: boolean;
  url?: string;
}

interface ImageUploaderProps {
  value?: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxImages?: number;
  minImages?: number;
  maxFileSize?: number; // en bytes
  allowedFormats?: string[];
  onUploadComplete?: (results: { cover: string | null; images: string[] }) => void;
  disabled?: boolean;
}

// Constantes
const DEFAULT_MAX_IMAGES = 10;
const DEFAULT_MIN_IMAGES = 3;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

const MIN_COVER_RESOLUTION = { width: 1200, height: 800 };

// Fonction utilitaire pour générer un ID unique
const generateId = () => Math.random().toString(36).substring(2, 9);

// Fonction pour évaluer la qualité d'une image
const assessImageQuality = (width: number, height: number, size: number, isCover: boolean): 'excellente' | 'bonne' | 'moyenne' | 'faible' => {
  const minWidth = isCover ? MIN_COVER_RESOLUTION.width : 800;
  const minHeight = isCover ? MIN_COVER_RESOLUTION.height : 600;
  
  const ratio = width / height;
  const isGoodRatio = ratio >= 1.5 && ratio <= 2;
  
  const pixelCount = width * height;
  const bytesPerPixel = size / pixelCount;
  const isSharp = bytesPerPixel > 0.5;
  
  if (width >= minWidth && height >= minHeight && isGoodRatio && isSharp) {
    return 'excellente';
  } else if (width >= minWidth * 0.9 && height >= minHeight * 0.9 && isGoodRatio) {
    return 'bonne';
  } else if (width >= minWidth * 0.7 && height >= minHeight * 0.7) {
    return 'moyenne';
  } else {
    return 'faible';
  }
};

// Composant principal
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
  minImages = DEFAULT_MIN_IMAGES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedFormats = DEFAULT_ALLOWED_FORMATS,
  onUploadComplete,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Obtenir la cover actuelle
  const coverImage = value.find(img => img.isCover);
  const additionalImages = value.filter(img => !img.isCover);
  const canAddMore = value.length < maxImages + 1; // +1 pour la cover

  // Valider un fichier
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Vérifier le format
    if (!allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Format non autorisé. Formats acceptés: JPG, PNG, WebP`
      };
    }

    // Vérifier la taille
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `Taille maximale dépassée. Maximum: ${maxFileSize / (1024 * 1024)} MB`
      };
    }

    return { valid: true };
  }, [allowedFormats, maxFileSize]);

  // Obtenir les dimensions d'une image
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Traiter les fichiers
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const newImages: ImageFile[] = [];

    for (const file of Array.from(files)) {
      const validation = validateFile(file);
      if (!validation.valid) {
        newImages.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          quality: null,
          isCover: false,
          error: validation.error
        });
        continue;
      }

      try {
        const dimensions = await getImageDimensions(file);
        const isCover = !coverImage && value.length === 0 && newImages.length === 0;
        const quality = assessImageQuality(dimensions.width, dimensions.height, file.size, isCover);

        // Vérifier la résolution minimale pour la cover
        if (isCover && (dimensions.width < MIN_COVER_RESOLUTION.width || dimensions.height < MIN_COVER_RESOLUTION.height)) {
          newImages.push({
            id: generateId(),
            file,
            preview: URL.createObjectURL(file),
            quality: 'faible',
            isCover: true,
            error: `Résolution insuffisante pour une photo principale. Minimum: ${MIN_COVER_RESOLUTION.width}x${MIN_COVER_RESOLUTION.height}px`
          });
          continue;
        }

        newImages.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          quality,
          isCover,
        });
      } catch {
        newImages.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          quality: null,
          isCover: false,
          error: 'Impossible de lire l\'image'
        });
      }
    }

    // Limiter le nombre d'images
    const limitedImages = newImages.slice(0, maxImages + 1 - value.length);
    
    onChange([...value, ...limitedImages]);
  }, [value, coverImage, validateFile, maxImages, onChange]);

  // Gérer le drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && canAddMore) {
      setIsDragging(true);
    }
  }, [disabled, canAddMore]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !canAddMore) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, canAddMore, processFiles]);

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  }, [processFiles]);

  // Supprimer une image
  const handleRemove = useCallback((id: string) => {
    const imageToRemove = value.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    const newImages = value.filter(img => img.id !== id);
    
    // Si on supprime la cover, promouvoir la première image supplémentaire
    if (imageToRemove?.isCover && newImages.length > 0) {
      newImages[0].isCover = true;
    }

    onChange(newImages);
  }, [value, onChange]);

  // Définir comme cover
  const handleSetCover = useCallback((id: string) => {
    const newImages = value.map(img => ({
      ...img,
      isCover: img.id === id
    }));
    onChange(newImages);
  }, [value, onChange]);

  // Upload des images vers le serveur
  const uploadImages = async (): Promise<{ cover: string | null; images: string[] } | null> => {
    if (!coverImage) {
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      // Ajouter la cover
      formData.append('cover', coverImage.file);
      
      // Ajouter les images supplémentaires
      additionalImages.forEach((img, index) => {
        formData.append(`images`, img.file);
      });

      const response = await axiosInstance.post('/biens/upload-images', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      setUploadProgress(100);
      setIsUploading(false);

      const result = {
        cover: response.data.data.cover.url,
        images: response.data.data.images.map((img: { url: string }) => img.url)
      };

      onUploadComplete?.(result);
      return result;
    } catch (error) {
      console.error('Erreur upload:', error);
      setIsUploading(false);
      return null;
    }
  };

  // Rendu du badge de qualité
  const renderQualityBadge = (quality: ImageFile['quality']) => {
    if (!quality) return null;

    const colors = {
      excellente: 'bg-green-500',
      bonne: 'bg-blue-500',
      moyenne: 'bg-yellow-500',
      faible: 'bg-red-500'
    };

    const labels = {
      excellente: 'Excellente',
      bonne: 'Bonne',
      moyenne: 'Moyenne',
      faible: 'Faible'
    };

    return (
      <span className={cn(
        'absolute bottom-2 left-2 px-2 py-1 text-xs font-medium text-white rounded',
        colors[quality]
      )}>
        {labels[quality]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed',
          !canAddMore && 'opacity-50'
        )}
      >
        <input
          type="file"
          accept={allowedFormats.join(',')}
          multiple
          onChange={handleFileSelect}
          disabled={disabled || !canAddMore}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Cliquez pour sélectionner</span>
            {' '}ou glissez-déposez vos images ici
          </div>
          <div className="text-xs text-muted-foreground">
            JPG, PNG, WebP jusqu'à {maxFileSize / (1024 * 1024)} MB
          </div>
          <div className="text-xs text-muted-foreground">
            {minImages} à {maxImages} photos requises + 1 photo principale
          </div>
        </div>
      </div>

      {/* Barre de progression d'upload */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Upload en cours...</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Photo principale (Cover) */}
      {coverImage && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Photo principale (obligatoire)
          </h4>
          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary">
            <img
              src={coverImage.preview}
              alt="Photo principale"
              className="w-full h-full object-cover"
            />
            {renderQualityBadge(coverImage.quality)}
            <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded flex items-center gap-1">
              <Star className="h-3 w-3" />
              Photo principale
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(coverImage.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {coverImage.error && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-500/90 text-white text-xs">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {coverImage.error}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos supplémentaires */}
      {additionalImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Photos supplémentaires ({additionalImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {additionalImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-video rounded-lg overflow-hidden border border-border group"
              >
                <img
                  src={image.preview}
                  alt={`Photo ${image.id}`}
                  className="w-full h-full object-cover"
                />
                {renderQualityBadge(image.quality)}
                
                {/* Actions au hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetCover(image.id)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Définir comme photo principale"
                  >
                    <Star className="h-4 w-4 text-white" />
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(image.id)}
                      className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Erreur */}
                {image.error && (
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-red-500/90 text-white text-xs">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {image.error}
                    </div>
                  </div>
                )}

                {/* Badge uploadé */}
                {image.uploaded && (
                  <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé et validation */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className={cn(
            'flex items-center gap-1',
            coverImage ? 'text-green-600' : 'text-red-500'
          )}>
            {coverImage ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            Photo principale {coverImage ? 'ajoutée' : 'requise'}
          </span>
          <span className={cn(
            'flex items-center gap-1',
            additionalImages.length >= minImages ? 'text-green-600' : 'text-yellow-600'
          )}>
            {additionalImages.length >= minImages ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {additionalImages.length}/{minImages} photos min.
          </span>
        </div>
        
        {!disabled && value.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              value.forEach(img => URL.revokeObjectURL(img.preview));
              onChange([]);
            }}
          >
            Tout supprimer
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;