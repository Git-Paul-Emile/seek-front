import { useState, useRef } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  User,
  Phone,
  Mail,
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Edit2,
  Save,
  X,
  CreditCard,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { updateProfilLocataireApi } from "@/api/locataireAuth";
import { uploadLocataireVerificationImageApi } from "@/api/locataireAuth";
import {
  useLocataireVerificationStatus,
  useSubmitLocataireVerification,
  useCancelLocataireVerification,
} from "@/hooks/useLocataireVerification";
import type { StatutVerificationLocataire, TypePieceIdentite } from "@/api/locataire";
import type { SubmitLocataireVerificationPayload } from "@/api/locataireAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) : "—";

// Convert various representations of sexe to the canonical letter used in the
// forms ("M" or "F"). Handles full words that may have been saved earlier.
const normalizeSexe = (s?: string | null): "M" | "F" | "" => {
  if (!s) return "";
  const up = s.trim().toUpperCase();
  if (up === "M" || up.startsWith("MASC") || up === "HOMME") return "M";
  if (up === "F" || up.startsWith("FEM") || up === "FEMME") return "F";
  return "";
};

// Human readable label for display mode.
const displaySexe = (s?: string | null) => {
  const norm = normalizeSexe(s);
  if (norm === "M") return "Masculin";
  if (norm === "F") return "Féminin";
  if (s) return s; // Display the raw value if not normalized
  return "—";
};

const VERIFICATION_STATUS_CONFIG: Record<
  StatutVerificationLocataire,
  { label: string; color: string; icon: React.ReactNode }
> = {
  NOT_VERIFIED: {
    label: "Non vérifié",
    color: "bg-slate-100 text-slate-600",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  PENDING: {
    label: "En attente",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  VERIFIED: {
    label: "Vérifié",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejeté",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const TYPE_PIECE_OPTIONS = [
  { value: "CNI", label: "CNI (Carte Nationale d'Identité)", icon: CreditCard, requiresVerso: true },
  { value: "PASSEPORT", label: "Passeport", icon: CreditCard, requiresVerso: false },
] as const;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

interface PhotoPreview {
  file: File;
  preview: string;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  sexe: string;
  numPieceIdentite: string;
  typePiece: string;
  dateDelivrance: string;
  dateExpirationPiece: string;
  autoriteDelivrance: string;
  situationProfessionnelle: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireProfil() {
  const { locataire, setLocataire } = useLocataireAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Vérification d'identité
  const { data: verificationStatus, isLoading: isVerificationLoading } = useLocataireVerificationStatus();
  const submitVerificationMutation = useSubmitLocataireVerification();
  const cancelVerificationMutation = useCancelLocataireVerification();
  
  // État pour les documents
  const [typePiece, setTypePiece] = useState("CNI");
  const [pieceIdentiteRecto, setPieceIdentiteRecto] = useState<PhotoPreview | null>(null);
  const [pieceIdentiteVerso, setPieceIdentiteVerso] = useState<PhotoPreview | null>(null);
  const [selfie, setSelfie] = useState<PhotoPreview | null>(null);
  const [conditionsAcceptees, setConditionsAcceptees] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<{
    typePiece?: string;
    pieceIdentiteRecto?: string;
    pieceIdentiteVerso?: string;
    selfie?: string;
    conditions?: string;
  }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pieceIdentiteRectoInputRef = useRef<HTMLInputElement>(null);
  const pieceIdentiteVersoInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const locData = locataire;
  
  const [formData, setFormData] = useState<FormData>({
    dateNaissance: locData?.dateNaissance ?? "",
    lieuNaissance: locData?.lieuNaissance ?? "",
    nationalite: locData?.nationalite ?? "",
    sexe: normalizeSexe(locData?.sexe),
    numPieceIdentite: locData?.numPieceIdentite ?? "",
    typePiece: locData?.typePiece ?? "CNI",
    dateDelivrance: locData?.dateDelivrance ?? "",
    dateExpirationPiece: locData?.dateExpirationPiece ?? "",
    autoriteDelivrance: locData?.autoriteDelivrance ?? "",
    situationProfessionnelle: locData?.situationProfessionnelle ?? "",
  });

  if (!locataire) return null;

  const verification = locData?.verification;
  const currentVerificationStatus = verificationStatus?.statut ?? verification?.statut ?? "NOT_VERIFIED";
  const statusConfig = VERIFICATION_STATUS_CONFIG[currentVerificationStatus];
  
  const selectedType = TYPE_PIECE_OPTIONS.find(t => t.value === typePiece);
  const requiresVerso = selectedType?.requiresVerso ?? true;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        dateNaissance: formData.dateNaissance || null,
        lieuNaissance: formData.lieuNaissance || null,
        nationalite: formData.nationalite || null,
        sexe: normalizeSexe(formData.sexe) || null,
        numPieceIdentite: formData.numPieceIdentite || null,
        typePiece: (formData.typePiece || null) as TypePieceIdentite | null,
        dateDelivrance: formData.dateDelivrance || null,
        dateExpirationPiece: formData.dateExpirationPiece || null,
        autoriteDelivrance: formData.autoriteDelivrance || null,
        situationProfessionnelle: formData.situationProfessionnelle || null,
      };

      const updated = await updateProfilLocataireApi(payload);
      setLocataire({ ...locataire, ...updated });
      setIsEditing(false);
      toast.success("Profil mis à jour");
    } catch (error: unknown) {
      // Extract error message from response
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Gestion de l'upload des fichiers de vérification
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

  // Soumission de la vérification
  const validateVerification = (): boolean => {
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

  const handleSubmitVerification = async () => {
    if (!validateVerification()) return;

    setIsUploading(true);
    toast.info("Upload des documents en cours...");
    
    try {
      let pieceIdentiteRectoUrl = "";
      let pieceIdentiteVersoUrl = "";
      let selfieUrl = "";
      
      // Uploader le recto
      if (pieceIdentiteRecto?.file) {
        pieceIdentiteRectoUrl = await uploadLocataireVerificationImageApi(pieceIdentiteRecto.file);
      }
      
      // Uploader le verso (si présent)
      if (pieceIdentiteVerso?.file) {
        pieceIdentiteVersoUrl = await uploadLocataireVerificationImageApi(pieceIdentiteVerso.file);
      }
      
      // Uploader le selfie
      if (selfie?.file) {
        selfieUrl = await uploadLocataireVerificationImageApi(selfie.file);
      }

      const payload: SubmitLocataireVerificationPayload = {
        typePiece: typePiece as "CNI" | "PASSEPORT",
        pieceIdentiteRecto: pieceIdentiteRectoUrl,
        pieceIdentiteVerso: pieceIdentiteVersoUrl || undefined,
        selfie: selfieUrl,
        conditionsAcceptees,
      };

      await submitVerificationMutation.mutateAsync(payload);
      toast.success("Demande de vérification soumise avec succès");
      
      // Reset des fichiers après soumission
      setPieceIdentiteRecto(null);
      setPieceIdentiteVerso(null);
      setSelfie(null);
      setConditionsAcceptees(false);
      
      // Forcer le rechargement du statut de vérification
      // Le hook va invalider les queries et le composant va se re-rendre avec le nouveau statut
    } catch (error: unknown) {
      console.error("Erreur upload:", error);
      
      // Extraire le code d'erreur
      const axiosError = error as { response?: { status?: number } };
      const status = axiosError.response?.status;
      
      if (status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else if (status === 413) {
        toast.error("Fichier trop volumineux. Maximum 5 Mo.");
      } else {
        toast.error("Erreur lors de l'upload des documents");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // NOTE: Les écrans séparés pour VERIFIED et PENDING ont été supprimés
  // pour afficher le profil normal avec le statut dans la colonne latérale

  const showRejectionAlert = !isVerificationLoading && (verificationStatus?.statut === "REJECTED" || verificationStatus?.documents?.motifRejet);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Mon espace", to: "/locataire/dashboard" }, { label: "Mon profil" }]} />
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <User className="w-3.5 h-3.5" />
          Mon profil
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Gérez vos informations personnelles
        </h1>
        <p className="text-slate-400 mt-0.5 text-sm">
          Vos informations et votre vérification d'identité
        </p>
      </div>

      {/* Statut du compte */}
      <div className="flex items-center gap-2">
        {locataire.statut === "ACTIF" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Compte actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            En attente d'activation
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale - Informations */}
        <div className="lg:col-span-2 space-y-5">
          {/* Informations de base (renseignées par le propriétaire) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Informations de base
              </h2>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                Modifiable par le propriétaire
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Nom" value={locataire.nom} />
              <InfoField label="Prénom" value={locataire.prenom} />
              <InfoField label="Téléphone" value={locataire.telephone} icon={<Phone className="w-3.5 h-3.5" />} />
              <InfoField label="Email" value={locataire.email ?? "—"} icon={<Mail className="w-3.5 h-3.5" />} />
              <InfoField label="Occupants" value={`${locataire.nbOccupants} personne${locataire.nbOccupants > 1 ? "s" : ""}`} />
              <InfoField 
                label="Enfants" 
                value={locataire.presenceEnfants ? "Oui" : "Non"} 
                valueClass={locataire.presenceEnfants ? "text-green-600" : "text-slate-400"}
              />
            </div>
          </div>

          {/* Identité (renseignées lors de l'activation) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Identité
              </h2>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                Modifiable par vous
              </span>
            </div>

            {locataire.statut !== "ACTIF" ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">
                  Vous devez activer votre compte pour renseigner ces informations.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Utilisez le lien d'activation envoyé par votre propriétaire.
                </p>
              </div>
            ) : isEditing ? (
              currentVerificationStatus === "PENDING" ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Vous ne pouvez pas modifier vos informations pendant qu'une demande de vérification est en cours d'analyse.
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Annulez d'abord votre demande de vérification pour modifier vos informations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Date de naissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(v) => handleInputChange("dateNaissance", v)}
                    />
                    <FormField
                      label="Lieu de naissance"
                      value={formData.lieuNaissance}
                      onChange={(v) => handleInputChange("lieuNaissance", v)}
                    />
                    <FormField
                      label="Nationalité"
                      value={formData.nationalite}
                      onChange={(v) => handleInputChange("nationalite", v)}
                    />
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sexe</label>
                      <select
                        value={formData.sexe}
                        onChange={(e) => handleInputChange("sexe", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A843]"
                      >
                        <option value="">Sélectionner</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Type de pièce</label>
                      <select
                        value={formData.typePiece}
                        onChange={(e) => handleInputChange("typePiece", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A843]"
                      >
                        {TYPE_PIECE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <FormField
                      label="Numéro de pièce"
                      value={formData.numPieceIdentite}
                      onChange={(v) => handleInputChange("numPieceIdentite", v)}
                    />
                    <FormField
                      label="Date de délivrance"
                      type="date"
                      value={formData.dateDelivrance}
                      onChange={(v) => handleInputChange("dateDelivrance", v)}
                    />
                    <FormField
                      label="Date d'expiration"
                      type="date"
                      value={formData.dateExpirationPiece}
                      onChange={(v) => handleInputChange("dateExpirationPiece", v)}
                    />
                    <FormField
                      label="Autorité de délivrance"
                      value={formData.autoriteDelivrance}
                      onChange={(v) => handleInputChange("autoriteDelivrance", v)}
                    />
                    <FormField
                      label="Situation professionnelle"
                      value={formData.situationProfessionnelle}
                      onChange={(v) => handleInputChange("situationProfessionnelle", v)}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Date de naissance" value={fmt(locData?.dateNaissance)} />
                  <InfoField label="Lieu de naissance" value={locData?.lieuNaissance ?? "—"} />
                  <InfoField label="Nationalité" value={locData?.nationalite ?? "—"} />
                  <InfoField label="Sexe" value={displaySexe(locData?.sexe)} />
                  <InfoField 
                    label="Pièce d'identité" 
                    value={locData?.typePiece ? `${locData.typePiece} — ${locData.numPieceIdentite ?? "—"}` : "—"} 
                  />
                  <InfoField label="Délivrée le" value={fmt(locData?.dateDelivrance)} />
                  <InfoField label="Expire le" value={fmt(locData?.dateExpirationPiece)} />
                  <InfoField label="Autorité de délivrance" value={locData?.autoriteDelivrance ?? "—"} />
                  <InfoField label="Situation professionnelle" value={locData?.situationProfessionnelle ?? "—"} />
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={currentVerificationStatus === "PENDING"}
                  className={`flex items-center gap-2 mt-4 px-4 py-2 border border-[#D4A843] text-[#D4A843] rounded-lg text-sm font-medium hover:bg-[#D4A843]/10 transition-colors ${
                    currentVerificationStatus === "PENDING" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  {currentVerificationStatus === "PENDING" 
                    ? "Modification verrouillée pendant la vérification"
                    : "Modifier mes informations"
                  }
                </button>
              </>
            )}
          </div>
        </div>

        {/* Colonne latérale - Vérification */}
        <div className="space-y-5">
          {/* Statut de vérification */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Vérification d'identité
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            {/* Alert de rejet */}
            {showRejectionAlert && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-800 font-medium">Motif du rejet :</p>
                <p className="text-xs text-red-700 mt-1">{verificationStatus?.documents?.motifRejet}</p>
              </div>
            )}

            {currentVerificationStatus === "NOT_VERIFIED" && (
              <p className="text-xs text-slate-500 mb-4">
                Soumettez vos documents pour vérifier votre identité et renforcer la confiance avec votre propriétaire.
              </p>
            )}

            {currentVerificationStatus === "PENDING" && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-800">
                  Votre demande de vérification est en cours de traitement. Vous recevrez une notification une fois celle-ci terminée.
                </p>
              </div>
            )}

            {currentVerificationStatus === "VERIFIED" && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-800">
                  Votre identité a été vérifiée avec succès.
                </p>
              </div>
            )}

            {/* Sélection du type de pièce */}
            {currentVerificationStatus !== "VERIFIED" && currentVerificationStatus !== "PENDING" && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-slate-600 mb-2">Type de pièce d'identité</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TYPE_PIECE_OPTIONS.map((type) => {
                    const Icon = type.icon;
                    const isSelected = typePiece === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setTypePiece(type.value)}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-[#D4A843] bg-[#D4A843]/5"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-[#D4A843] text-white" : "bg-white text-slate-400 border border-slate-100"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-medium ${isSelected ? "text-[#0C1A35]" : "text-slate-600"}`}>
                            {type.value}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-[#D4A843]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documents soumis */}
            {currentVerificationStatus !== "VERIFIED" && currentVerificationStatus !== "PENDING" && (
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-slate-600">Documents à soumettre</h3>
                
                {/* Pièce d'identité - Recto */}
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">
                    {typePiece === "CNI" ? "CNI - Recto" : typePiece === "PASSEPORT" ? "Passeport - Page identité" : "Pièce d'identité"}
                  </p>
                  {pieceIdentiteRecto ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-[#D4A843] bg-slate-50">
                      <img
                        src={pieceIdentiteRecto.preview}
                        alt="Recto"
                        className="w-full aspect-[4/3] object-contain"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        onClick={() => setPieceIdentiteRecto(null)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => pieceIdentiteRectoInputRef.current?.click()}
                      className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center gap-2 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[10px]">Cliquez pour télécharger</span>
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
                    <p className="mt-1 text-[10px] text-red-500">{errors.pieceIdentiteRecto}</p>
                  )}
                </div>
                
                {/* Pièce d'identité - Verso (uniquement pour CNI) */}
                {requiresVerso && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">CNI - Verso</p>
                    {pieceIdentiteVerso ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-[#D4A843] bg-slate-50">
                        <img
                          src={pieceIdentiteVerso.preview}
                          alt="Verso"
                          className="w-full aspect-[4/3] object-contain"
                          style={{ maxHeight: '120px' }}
                        />
                        <button
                          onClick={() => setPieceIdentiteVerso(null)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => pieceIdentiteVersoInputRef.current?.click()}
                        className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center gap-2 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px]">Cliquez pour télécharger</span>
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
                      <p className="mt-1 text-[10px] text-red-500">{errors.pieceIdentiteVerso}</p>
                    )}
                  </div>
                )}
                
                {/* Selfie */}
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Selfie avec pièce d'identité</p>
                  {selfie ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-[#D4A843] bg-slate-50 max-w-[150px] mx-auto">
                      <img
                        src={selfie.preview}
                        alt="Selfie"
                        className="w-full aspect-square object-contain"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        onClick={() => setSelfie(null)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => selfieInputRef.current?.click()}
                      className="w-full p-3 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center gap-2 text-slate-400 hover:border-[#D4A843]/50 hover:text-[#D4A843]/70 hover:bg-[#D4A843]/5 transition-all max-w-[150px] mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-[10px]">Cliquez pour prendre</span>
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
                    <p className="text-[10px] text-red-500 text-center">{errors.selfie}</p>
                  )}
                </div>

                {/* Conditions */}
                <label className="flex items-start gap-2 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={conditionsAcceptees}
                    onChange={(e) => {
                      setConditionsAcceptees(e.target.checked);
                      setErrors((prev) => ({ ...prev, conditions: undefined }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#D4A843] focus:ring-[#D4A843]"
                  />
                  <span className="text-[10px] text-slate-500">
                    J'accepte les conditions de vérification
                  </span>
                </label>
                {errors.conditions && (
                  <p className="text-[10px] text-red-500">{errors.conditions}</p>
                )}
              </div>
            )}

            {currentVerificationStatus !== "VERIFIED" && currentVerificationStatus !== "PENDING" && (
              <button
                onClick={handleSubmitVerification}
                disabled={isUploading || submitVerificationMutation.isPending}
                className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2.5 bg-[#D4A843] text-white rounded-lg text-sm font-medium hover:bg-[#c49a3a] disabled:opacity-60 transition-colors"
              >
                {isUploading || submitVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Soumission...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Soumettre pour vérification
                  </>
                )}
              </button>
            )}
          </div>

          {/* Aide */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-bold text-slate-600 mb-3">Pourquoi vérifier mon identité ?</h3>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                Renforce la confiance avec votre propriétaire
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                Accès à des fonctionnalités supplémentaires
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                Protection de vos informations personnelles
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input file caché pour upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={() => {}}
      />
    </div>
  );
}

// ─── Composants helpers ────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 uppercase font-medium mb-0.5">{label}</p>
      <div className={`flex items-center gap-2 text-sm text-slate-700 ${valueClass || ""}`}>
        {icon}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function FormField({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#D4A843]"
      />
    </div>
  );
}
