import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SkForm } from "@/components/ui/Skeleton";
import { updateProfileApi, meApi, changePasswordApi } from "@/api/auth";
import { Loader2, Save, Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormData {
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { admin, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Password field errors
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Charger les données du profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await meApi();
        const profile = data.data;
        setProfileForm({
          email: profile.email || "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (name === "currentPassword") setCurrentPasswordError(null);
    if (name === "newPassword") setNewPasswordError(null);
    if (name === "confirmPassword") setConfirmPasswordError(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSavingProfile(true);
    try {
      const payload: any = {};

      // Only include email if it changed
      if (profileForm.email !== admin?.email) {
        payload.email = profileForm.email;
      }

      // Don't send empty payload
      if (Object.keys(payload).length === 0) {
        toast.error("Aucune modification détectée.");
        setIsSavingProfile(false);
        return;
      }

      const { data } = await updateProfileApi(payload);
      
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error("Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset field errors
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    
    // Validation du nouveau mot de passe
    if (!passwordForm.currentPassword) {
      setCurrentPasswordError("Le mot de passe actuel est requis");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setNewPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      setNewPasswordError("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setNewPasswordError("Le nouveau mot de passe doit être différent de l'actuel");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data } = await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      
      toast.success("Mot de passe modifié avec succès");
      
      // Reset password fields
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Déconnecter l'utilisateur après changement de mot de passe
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      toast.error("Une erreur est survenue lors du changement de mot de passe.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Mon profil" }]} />
        <SkForm />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Mon profil" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Mon Profil</h1>
        <p className="text-slate-500 mt-1">
          Gérez vos informations d'administrateur
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "profile"
              ? "bg-[#D4A843] text-[#0C1A35]"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Mail className="w-4 h-4 inline-block mr-2" />
          Informations du profil
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "password"
              ? "bg-[#D4A843] text-[#0C1A35]"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <KeyRound className="w-4 h-4 inline-block mr-2" />
          Changer le mot de passe
        </button>
      </div>

      {/* Profil Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#0C1A35] mb-4">
            Informations d'administrateur
          </h2>
          
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-500 ml-0.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="admin@seek.com"
                  className="w-full h-11 rounded-xl text-sm bg-slate-50 border border-slate-200 pl-9 pr-3 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-[#0C1A35] mb-4">
            Changer mon mot de passe
          </h2>
          
          <div className="space-y-5">
            {/* Mot de passe actuel */}
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="block text-xs font-medium text-slate-500 ml-0.5">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre mot de passe actuel"
                  className={`w-full h-11 rounded-xl text-sm bg-slate-50 border ${currentPasswordError ? 'border-red-500' : 'border-slate-200'} pl-9 pr-10 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {currentPasswordError && (
                <p className="text-xs text-red-500">{currentPasswordError}</p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-xs font-medium text-slate-500 ml-0.5">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Entrez le nouveau mot de passe"
                  className={`w-full h-11 rounded-xl text-sm bg-slate-50 border ${newPasswordError ? 'border-red-500' : 'border-slate-200'} pl-9 pr-10 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPasswordError && (
                <p className="text-xs text-red-500">{newPasswordError}</p>
              )}
              <p className="text-xs text-slate-400">
                Minimum 8 caractères, avec au moins une majuscule, une minuscule et un chiffre
              </p>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-500 ml-0.5">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez le nouveau mot de passe"
                  className={`w-full h-11 rounded-xl text-sm bg-slate-50 border ${confirmPasswordError ? 'border-red-500' : 'border-slate-200'} pl-9 pr-10 text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#D4A843] focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-xs text-red-500">{confirmPasswordError}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4A843] hover:bg-[#c49933] text-[#0C1A35] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                Changer le mot de passe
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
