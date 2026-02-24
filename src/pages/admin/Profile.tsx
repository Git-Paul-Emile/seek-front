import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfileApi, meApi } from "@/api/auth";
import { Loader2, Save, Mail, Lock } from "lucide-react";

interface ProfileFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Profile() {
  const { admin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Charger les données du profil au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await meApi();
        const profile = data.data;
        setFormData((prev) => ({
          ...prev,
          email: profile.email || "",
        }));
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const payload: any = {};

      // Only include email if it changed
      if (formData.email !== admin?.email) {
        payload.email = formData.email;
      }

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      // Don't send empty payload
      if (Object.keys(payload).length === 0) {
        setErrorMessage("Aucune modification détectée.");
        setIsSaving(false);
        return;
      }

      const { data } = await updateProfileApi(payload);
      
      setSuccessMessage(data.message);
      
      // Reset password fields
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil.");
    } finally {
      setIsSaving(false);
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
          Gérez vos informations d'administrateur
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
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@seek.com"
                required
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
    </div>
  );
}
