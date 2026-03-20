import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Upload,
  Camera,
  Check,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  BookOpen,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useVerificationStatus, useSubmitVerification, useCancelVerification } from "@/hooks/useVerification";
import { uploadVerificationImageApi } from "@/api/ownerAuth";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

interface PhotoPreview {
  file: File;
  preview: string;
}

const TYPE_PIECE_OPTIONS = [
  { value: "CNI", label: "CNI (Carte Nationale d'Identité)", icon: CreditCard, requiresVerso: true },
  { value: "PASSEPORT", label: "Passeport", icon: BookOpen, requiresVerso: false },
];

export default function OwnerVerification() {
  const navigate = useNavigate();
  const { data: status, isLoading } = useVerificationStatus();
  const submitMutation = useSubmitVerification();
  const cancelMutation = useCancelVerification();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [typePiece, setTypePiece] = useState("CNI");
  const [pieceIdentiteRecto, setPieceIdentiteRecto] = useState<PhotoPreview | null>(null);
  const [pieceIdentiteVerso, setPieceIdentiteVerso] = useState<PhotoPreview | null>(null);
  const [selfie, setSelfie] = useState<PhotoPreview | null>(null);
  const [conditionsAcceptees, setConditionsAcceptees] = useState(false);
  const [errors, setErrors] = useState<{
    typePiece?: string;
    pieceIdentiteRecto?: string;
    pieceIdentiteVerso?: string;
    selfie?: string;
    conditions?: string;
  }>({});

  const pieceIdentiteRectoInputRef = useRef<HTMLInputElement>(null);
  const pieceIdentiteVersoInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Si déjà vérifié, afficher les documents vérifiés
  if (!isLoading && status?.statut === "VERIFIED") {
    const docs = status.documents;
    const TYPE_LABEL: Record<string, string> = {
      CNI: "Carte Nationale d'Identité",
      PASSEPORT: "Passeport",
    };
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Vérification d'identité" }]} />

        {/* Badge vérifié */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-800">Compte vérifié</h2>
            <p className="text-sm text-emerald-700 mt-0.5">
              Votre identité a été vérifiée avec succès. Votre compte bénéficie du badge de confiance.
            </p>
            {status.verifiedAt && (
              <p className="text-xs text-emerald-600 mt-1">
                Vérifié le {new Date(status.verifiedAt).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        </div>

        {/* Documents soumis */}
        {docs && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-semibold text-[#0C1A35]">Documents soumis</h2>
            <p className="text-sm text-slate-500">
              Type de pièce : <span className="font-medium text-[#0C1A35]">{TYPE_LABEL[docs.typePiece] ?? docs.typePiece}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.pieceIdentiteRecto && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {docs.typePiece === "CNI" ? "CNI - Recto" : "Passeport - Page identité"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLightboxImage(docs.pieceIdentiteRecto)}
                    className="w-full block"
                  >
                    <img
                      src={docs.pieceIdentiteRecto}
                      alt="Pièce d'identité recto"
                      className="w-full aspect-[4/3] object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </button>
                </div>
              )}
              {docs.pieceIdentiteVerso && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">CNI - Verso</p>
                  <button
                    type="button"
                    onClick={() => setLightboxImage(docs.pieceIdentiteVerso)}
                    className="w-full block"
                  >
                    <img
                      src={docs.pieceIdentiteVerso}
                      alt="Pièce d'identité verso"
                      className="w-full aspect-[4/3] object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </button>
                </div>
              )}
              {docs.selfie && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Selfie</p>
                  <button
                    type="button"
                    onClick={() => setLightboxImage(docs.selfie)}
                    className="w-full block"
                  >
                    <img
                      src={docs.selfie}
                      alt="Selfie"
                      className="w-full aspect-square object-cover rounded-xl border-2 border-emerald-200 hover:opacity-90 transition-opacity cursor-pointer max-w-[200px]"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Retour au dashboard
          </Link>
        </div>

        {/* Lightbox pour afficher les images en grand */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Document en grand"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    );
  }

  // Si en attente, afficher le statut
  if (!isLoading && status?.statut === "PENDING") {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Vérification d'identité" }]} />

        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#0C1A35] mb-2">Demande en cours d'analyse</h2>
          <p className="text-slate-500 mb-6">
            Votre demande de vérification d'identité est en cours d'analyse par notre équipe.
            Nous vous contacterons dès qu'elle sera traitée.
          </p>
          <button
            onClick={() => {
              cancelMutation.mutate(undefined, {
                onSuccess: () => {
                  toast.success("Demande annulée");
                },
                onError: () => {
                  toast.error("Erreur lors de l'annulation");
                },
              });
            }}
            disabled={cancelMutation.isPending}
            className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            {cancelMutation.isPending ? "Annulation..." : "Annuler la demande"}
          </button>
        </div>
      </div>
    );
  }

  // Si rejeté précédemment, afficher le motif mais aussi le formulaire
  const showRejectionAlert = !isLoading && (status?.statut === "REJECTED" || status?.documents?.motifRejet);

  const handleFileChange = (
    type: "pieceIdentiteRecto" | "pieceIdentiteVerso" | "selfie",
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Format non supporté. Utilisez JPG, PNG ou WebP.",
      }));
      return;
    }

    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [type]: "La taille du fichier ne doit pas dépasser 5 Mo.",
      }));
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "pieceIdentiteRecto") {
      setPieceIdentiteRecto({ file, preview });
    } else if (type === "pieceIdentiteVerso") {
      setPieceIdentiteVerso({ file, preview });
    } else {
      setSelfie({ file, preview });
    }

    setErrors((prev) => ({ ...prev, [type]: undefined }));
  };

  const selectedType = TYPE_PIECE_OPTIONS.find(t => t.value === typePiece);
  const requiresVerso = selectedType?.requiresVerso ?? true;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!pieceIdentiteRecto) {
      newErrors.pieceIdentiteRecto = "Le recto est obligatoire";
    }

    if (requiresVerso && !pieceIdentiteVerso) {
      newErrors.pieceIdentiteVerso = "Le verso est obligatoire pour la CNI";
    }

    if (!selfie) {
      newErrors.selfie = "Veuillez prendre un selfie";
    }

    if (!conditionsAcceptees) {
      newErrors.conditions = "Vous devez accepter les conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Uploader les images vers Cloudinary avant de soumettre
    toast.info("Upload des documents en cours...");
    
    try {
      let pieceIdentiteRectoUrl = "";
      let pieceIdentiteVersoUrl = "";
      let selfieUrl = "";
      
      // Uploader le recto
      if (pieceIdentiteRecto?.file) {
        pieceIdentiteRectoUrl = await uploadVerificationImageApi(pieceIdentiteRecto.file);
      }
      
      // Uploader le verso (si présent)
      if (pieceIdentiteVerso?.file) {
        pieceIdentiteVersoUrl = await uploadVerificationImageApi(pieceIdentiteVerso.file);
      }
      
      // Uploader le selfie
      if (selfie?.file) {
        selfieUrl = await uploadVerificationImageApi(selfie.file);
      }

      const payload = {
        typePiece,
        pieceIdentiteRecto: pieceIdentiteRectoUrl,
        pieceIdentiteVerso: pieceIdentiteVersoUrl || undefined,
        selfie: selfieUrl,
        conditionsAcceptees,
      };

      await submitMutation.mutateAsync(payload);
      toast.success("Demande de vérification soumise avec succès");
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload des documents");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Vérification d'identité" }]} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <Shield className="w-3.5 h-3.5" />
          Vérification d'identité
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          {showRejectionAlert ? "Resoumettre votre vérification" : "Vérifiez votre identité"}
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Pour inspirer confiance aux locataires, vérifiez votre identité en quelques étapes.
        </p>
      </div>

      {/* Alert de rejet */}
      {showRejectionAlert && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Demande rejetée</h3>
              <p className="text-sm text-red-700 mt-1">
                Motif : {status?.documents?.motifRejet}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Veuillez soumettre une nouvelle demande avec les corrections nécessaires.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sélection du type de pièce */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-[#0C1A35] mb-4">Type de pièce d'identité</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TYPE_PIECE_OPTIONS.map((type) => {
            const Icon = type.icon;
            const isSelected = typePiece === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setTypePiece(type.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-[#D4A843] bg-[#D4A843]/5"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-[#D4A843] text-white" : "bg-white text-slate-400 border border-slate-100"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium ${isSelected ? "text-[#0C1A35]" : "text-slate-600"}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {type.requiresVerso ? "Recto + Verso" : "Page d'identité"}
                  </p>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#D4A843] ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pièce d'identité - Recto */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#D4A843]" />
            {typePiece === "CNI" ? "CNI - Recto" : "Passeport - Page d'identité"}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {typePiece === "CNI" 
              ? "Téléchargez une photo claire du recto de votre CNI (face avec photo)"
              : "Téléchargez la page avec votre photo d'identité"}
          </p>
          <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Format recommandé : rectangulaire horizontal (type photo 4×3)
          </p>

          {pieceIdentiteRecto ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#D4A843] bg-slate-50">
              <img
                src={pieceIdentiteRecto.preview}
                alt="Recto"
                className="w-full aspect-[4/3] object-contain"
                style={{ maxHeight: '300px' }}
              />
              <button
                onClick={() => setPieceIdentiteRecto(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => pieceIdentiteRectoInputRef.current?.click()}
              className="w-full aspect-[4/3] border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all cursor-pointer"
              style={{ maxHeight: '300px' }}
            >
              <Upload className="w-8 h-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Cliquez pour télécharger</p>
                <p className="text-xs mt-0.5">JPG, PNG ou WebP · max 5 Mo</p>
              </div>
            </button>
          )}
          <input
            ref={pieceIdentiteRectoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => handleFileChange("pieceIdentiteRecto", e.target.files)}
          />
          {errors.pieceIdentiteRecto && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.pieceIdentiteRecto}
            </p>
          )}
        </div>

        {/* Pièce d'identité - Verso (uniquement pour CNI) */}
        {requiresVerso && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#D4A843]" />
              CNI - Verso
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Téléchargez une photo du verso de votre CNI (face avec informations)
            </p>
            <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Format recommandé : rectangulaire horizontal (type photo 4×3)
            </p>

            {pieceIdentiteVerso ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#D4A843] bg-slate-50">
                <img
                  src={pieceIdentiteVerso.preview}
                  alt="Verso"
                  className="w-full aspect-[4/3] object-contain"
                  style={{ maxHeight: '300px' }}
                />
                <button
                  onClick={() => setPieceIdentiteVerso(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => pieceIdentiteVersoInputRef.current?.click()}
                className="w-full aspect-[4/3] border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all cursor-pointer"
                style={{ maxHeight: '300px' }}
              >
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <p className="text-sm font-medium">Cliquez pour télécharger</p>
                  <p className="text-xs mt-0.5">JPG, PNG ou WebP · max 5 Mo</p>
                </div>
              </button>
            )}
            <input
              ref={pieceIdentiteVersoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleFileChange("pieceIdentiteVerso", e.target.files)}
            />
            {errors.pieceIdentiteVerso && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.pieceIdentiteVerso}
              </p>
            )}
          </div>
        )}

        {/* Selfie */}
        <div className={`bg-white rounded-2xl border border-slate-100 p-6 ${!requiresVerso ? "lg:col-span-2" : ""}`}>
          <h2 className="font-semibold text-[#0C1A35] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D4A843]" />
            Selfie
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Prenez un selfie pour confirmer que vous êtes bien le propriétaire de la pièce d'identité.
          </p>
          <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Format recommandé : photo carrée (type selfie 1×1)
          </p>

          {selfie ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#D4A843] bg-slate-50 max-w-[300px] mx-auto">
              <img
                src={selfie.preview}
                alt="Selfie"
                className="w-full aspect-square object-contain"
                style={{ maxHeight: '300px' }}
              />
              <button
                onClick={() => setSelfie(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => selfieInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all cursor-pointer max-w-[300px] mx-auto"
              style={{ maxHeight: '300px' }}
            >
              <Camera className="w-8 h-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Cliquez pour prendre un selfie</p>
                <p className="text-xs mt-0.5">JPG, PNG ou WebP · max 5 Mo</p>
              </div>
            </button>
          )}
          <input
            ref={selfieInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            capture="user"
            className="hidden"
            onChange={(e) => handleFileChange("selfie", e.target.files)}
          />
          {errors.selfie && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.selfie}
            </p>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={conditionsAcceptees}
            onChange={(e) => {
              setConditionsAcceptees(e.target.checked);
              setErrors((prev) => ({ ...prev, conditions: undefined }));
            }}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
          />
          <div>
            <p className="text-sm font-medium text-[#0C1A35]">
              J'accepte les conditions de vérification
            </p>
            <p className="text-xs text-slate-500 mt-1">
              En soumettant cette demande, j'autorise SEEK à vérifier mon identité.
              Les documents fournis seront traités de manière confidentielle.
            </p>
          </div>
        </label>
        {errors.conditions && (
          <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.conditions}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/owner/dashboard"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
        >
          Annuler
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4A843] hover:bg-[#D4A843]/90 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Soumission...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Soumettre la demande
            </>
          )}
        </button>
      </div>
    </div>
  );
}
