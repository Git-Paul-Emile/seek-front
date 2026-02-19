import React, { useRef, useState } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";

// ─── Constantes de validation (miroir des règles backend) ────────────────────

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jfif"];
const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.jfif,.png,.webp,.avif";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageUploadProps {
  /** URL de l'image existante (mode édition) */
  currentImage?: string | null;
  /** Appelé avec le fichier sélectionné, ou null si supprimé */
  onChange: (file: File | null) => void;
  /** Message d'erreur externe (ex: retour serveur) */
  error?: string;
  label?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ImageUpload({
  currentImage,
  onChange,
  error,
  label = "Image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Image affichée : prévisualisation du nouveau fichier ou image existante
  const displayedImage = preview ?? currentImage ?? null;
  const activeError = localError ?? error ?? null;

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format non autorisé. Utilisez JPEG, JFIF, PNG, WEBP ou AVIF.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Fichier trop volumineux. Taille maximale : 5 Mo (actuel : ${(file.size / 1024 / 1024).toFixed(1)} Mo).`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validate(file);
    if (err) {
      setLocalError(err);
      setPreview(null);
      onChange(null);
      return;
    }
    setLocalError(null);
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input pour permettre de re-sélectionner le même fichier
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setLocalError(null);
    onChange(null);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed transition-colors
          ${activeError
            ? "border-red-300 bg-red-50"
            : isDragging
              ? "border-[#D4A843] bg-[#D4A843]/5"
              : "border-slate-200 bg-slate-50 hover:border-[#D4A843]/50"
          }`}
      >
        {displayedImage ? (
          // ─── Prévisualisation ────────────────────────────────────────────────
          <div className="relative">
            <img
              src={displayedImage}
              alt="Aperçu"
              className="w-full h-40 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center
                justify-center text-slate-500 hover:text-red-500 transition-colors"
              title="Supprimer l'image"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Overlay cliquable pour changer l'image */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 rounded-xl flex items-end justify-center pb-3
                opacity-0 hover:opacity-100 transition-opacity bg-black/20"
            >
              <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
                Changer d'image
              </span>
            </button>
          </div>
        ) : (
          // ─── Zone de dépôt / sélection ───────────────────────────────────────
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${isDragging ? "bg-[#D4A843]/20" : "bg-slate-100"}`}>
              <Upload className={`w-5 h-5 ${isDragging ? "text-[#D4A843]" : "text-slate-400"}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                Cliquez ou glissez une image
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                JPEG, JFIF, PNG, WEBP, AVIF — max 5 Mo
              </p>
            </div>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Erreur de validation */}
      {activeError && (
        <p className="text-xs text-red-500 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {activeError}
        </p>
      )}

      {/* Indicateur : image actuelle non modifiée */}
      {currentImage && !preview && !localError && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          Image actuelle conservée si aucun fichier sélectionné
        </p>
      )}
    </div>
  );
}
