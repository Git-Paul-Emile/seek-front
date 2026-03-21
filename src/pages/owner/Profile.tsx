import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { updateProfileApi, deleteProfileApi, meOwnerApi, getOwnScoreApi } from "@/api/ownerAuth";
import { useVerificationStatus } from "@/hooks/useVerification";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { TrustScoreFull } from "@/components/ui/TrustScoreBadge";
import { toast } from "sonner";
import { Loader2, Save, Trash2, User, Mail, Phone, Lock, ChevronDown, Shield, Check, AlertCircle, Clock, Eye, CreditCard, X } from "lucide-react";
import { SkForm } from "@/components/ui/Skeleton";

interface ProfileFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  sexe: string;
  password: string;
  confirmPassword: string;
}

export default function Profile() {
  const { owner, setOwner, logout } = useOwnerAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Vérification d'identité
  const { data: verificationStatus, isLoading: isVerificationLoading } = useVerificationStatus();

  // Score de confiance
  const { data: scoreData } = useQuery({
    queryKey: ["owner-trust-score"],
    queryFn: () => getOwnScoreApi().then((r) => r.data.data.score),
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    sexe: "",
    password: "",
    confirmPassword: "",
  });

  // Charger les données du profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await meOwnerApi();
        const profile = data.data;
        setFormData((prev) => ({
          ...prev,
          prenom: profile.prenom || "",
          nom: profile.nom || "",
          email: profile.email || "",
          telephone: profile.telephone || "",
          sexe: (profile as any).sexe || "",
        }));
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du mot de passe
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email || null,
        sexe: formData.sexe || null,
      };

      // Only include telephone if it changed
      if (formData.telephone !== owner?.telephone) {
        payload.telephone = formData.telephone;
      }

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      const { data } = await updateProfileApi(payload);
      
      // Mettre à jour le contexte
      setOwner(data.data);
      
      // Afficher le toast de succès
      toast.success(data.message || "Profil mis à jour avec succès");
      
      // Reset password fields
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProfileApi();
      await logout();
      navigate("/proprietaires");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la suppression du compte.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Mon profil" }]} />
        <SkForm fields={8} />
        <SkForm fields={4} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/owner/dashboard" }, { label: "Mon profil" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Mon Profil</h1>
        <p className="text-slate-500 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Section Vérification d'identité */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#0C1A35] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4A843]" />
            Vérification d'identité
          </h2>
          {verificationStatus?.statut === "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              <Check className="w-3.5 h-3.5" />
              Vérifié
            </span>
          )}
          {verificationStatus?.statut === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              En attente
            </span>
          )}
          {verificationStatus?.statut === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Rejeté
            </span>
          )}
        </div>

        {isVerificationLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : verificationStatus?.statut && (verificationStatus.statut === "VERIFIED" || verificationStatus.statut === "PENDING") ? (
          /* Documents soumis - afficher les détails */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type de pièce */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Type de pièce</p>
                <p className="text-sm font-medium text-[#0C1A35] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  {verificationStatus?.documents?.typePiece === "CNI" ? "CNI" : 
                   verificationStatus?.documents?.typePiece === "PASSEPORT" ? "Passeport" : 
                   verificationStatus?.documents?.typePiece || "Non spécifié"}
                </p>
              </div>

              {/* Date de soumission */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">
                  {verificationStatus?.statut === "VERIFIED" ? "Date de vérification" : "Date de soumission"}
                </p>
                <p className="text-sm font-medium text-[#0C1A35]">
                  {verificationStatus?.verifiedAt 
                    ? new Date(verificationStatus.verifiedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "En attente d'approbation"}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-400 mb-3">Documents soumis</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {verificationStatus?.documents?.pieceIdentiteRecto && (
                  <button
                    onClick={() => setPreviewImage(verificationStatus?.documents?.pieceIdentiteRecto || null)}
                    className="relative group p-3 rounded-lg bg-white border border-slate-200 hover:border-[#D4A843] transition-all text-left"
                  >
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-slate-100 mb-2">
                      <img 
                        src={verificationStatus.documents.pieceIdentiteRecto} 
                        alt="Recto"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Pièce identité (Recto)</p>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </button>
                )}
                {verificationStatus?.documents?.pieceIdentiteVerso && (
                  <button
                    onClick={() => setPreviewImage(verificationStatus?.documents?.pieceIdentiteVerso || null)}
                    className="relative group p-3 rounded-lg bg-white border border-slate-200 hover:border-[#D4A843] transition-all text-left"
                  >
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-slate-100 mb-2">
                      <img 
                        src={verificationStatus.documents.pieceIdentiteVerso} 
                        alt="Verso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Pièce identité (Verso)</p>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </button>
                )}
                {verificationStatus?.documents?.selfie && (
                  <button
                    onClick={() => setPreviewImage(verificationStatus?.documents?.selfie || null)}
                    className="relative group p-3 rounded-lg bg-white border border-slate-200 hover:border-[#D4A843] transition-all text-left"
                  >
                    <div className="aspect-square rounded-md overflow-hidden bg-slate-100 mb-2">
                      <img 
                        src={verificationStatus.documents.selfie} 
                        alt="Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-slate-600">Selfie</p>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {verificationStatus?.statut === "PENDING" && (
              <p className="text-sm text-slate-500">
                Votre demande est en cours d'analyse. Vous ne pouvez pas soumettre de nouvelle demande pour le moment.
              </p>
            )}
          </div>
        ) : verificationStatus?.statut === "REJECTED" ? (
          /* Documents rejetés */
          <div className="space-y-4">
            {/* Message de rejet */}
            {verificationStatus?.documents?.motifRejet && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">Motif du rejet</p>
                <p className="text-sm text-red-700">{verificationStatus.documents.motifRejet}</p>
              </div>
            )}

            {/* Bouton pour soumettre une nouvelle demande */}
            <Link
              to="/owner/verification"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-semibold transition-colors"
            >
              <Shield className="w-4 h-4" />
              Soumettre une nouvelle demande
            </Link>
          </div>
        ) : (
          /* Pas encore de documents soumis - afficher le formulaire de vérification */
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Pour publier des annonces et gérer vos biens, vous devez vérifier votre identité.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/owner/verification"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-semibold transition-colors"
              >
                <Shield className="w-4 h-4" />
                Vérifier mon identité
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Score de confiance */}
      {scoreData && (
        <div>
          <TrustScoreFull score={scoreData} />
          <p className="text-xs text-slate-400 mt-2 px-1">
            Ce score est visible par les visiteurs qui consultent vos annonces. Vérifiez votre identité pour l'améliorer.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-[#0C1A35] mb-4">
          Informations personnelles
        </h2>
        
        <div className="space-y-5">
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prenom" className="block text-xs font-medium text-slate-500 ml-0.5">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nom" className="block text-xs font-medium text-slate-500 ml-0.5">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sexe */}
          <div className="space-y-1.5">
            <label htmlFor="sexe" className="block text-xs font-medium text-slate-500 ml-0.5">
              Genre
            </label>
            <div className="relative">
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-3 pr-9 text-slate-700 outline-none focus:border-[#D4A843] focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">Sélectionner...</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-1.5">
            <label htmlFor="telephone" className="block text-xs font-medium text-slate-500 ml-0.5">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                id="telephone"
                name="telephone"
                type="text"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="77 000 00 00"
                className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 ml-0.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-medium text-[#0C1A35] mb-4">
              Changer le mot de passe (optionnel)
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-slate-500 ml-0.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Laissez vide pour garder l'actuel"
                    className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-500 ml-0.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>

      {/* Zone dangereuse */}
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Zone dangereuse
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          La suppression de votre compte est irréversible. Toutes vos annonces seront également supprimées.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Supprimer mon compte
        </button>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer votre compte ?"
        message="Cette action est irréversible. Toutes vos annonces seront automatiquement supprimées. Vous ne pourrez plus récupérer votre compte ni vos données."
        confirmLabel="Oui, supprimer mon compte"
        cancelLabel="Annuler"
        variant="danger"
        isPending={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Lightbox pour afficher les images en grand */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={previewImage}
            alt="Document en grand"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
