import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import { updateProfileApi, deleteProfileApi, meOwnerApi } from "@/api/ownerAuth";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Loader2, Save, Trash2, User, Mail, Phone, Lock, ChevronDown } from "lucide-react";

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
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Validation du mot de passe
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
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
      
      setSuccessMessage(data.message);
      
      // Reset password fields
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil.");
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
      setErrorMessage(error.response?.data?.message || "Une erreur est survenue lors de la suppression du compte.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Mon Profil</h1>
        <p className="text-slate-500 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25 px-4 py-3">
          <p className="text-sm text-emerald-600">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/15 border border-red-400/25 px-4 py-3">
          <p className="text-sm text-red-600">{errorMessage}</p>
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
                  required
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
                  required
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
                required
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
                type="email"
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
    </div>
  );
}
