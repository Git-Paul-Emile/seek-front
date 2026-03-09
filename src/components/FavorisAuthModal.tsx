/**
 * Modal affiché quand un visiteur non connecté clique sur "Ajouter en favoris".
 * Propose la création de compte ou la connexion.
 */

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import {
  registerComptePublicApi,
  loginComptePublicApi,
  type RegisterData,
} from "@/api/comptePublicAuth";

interface Props {
  onClose: () => void;
  onSuccess?: () => void; // appelé après connexion (ex: toggleFavori)
}

type Tab = "register" | "login";

export default function FavorisAuthModal({ onClose, onSuccess }: Props) {
  const { setCompte } = useComptePublicAuth();
  const [tab, setTab] = useState<Tab>("register");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Champs inscription ─────────────────────────────────────────────────────
  const [form, setForm] = useState<RegisterData>({
    nom: "", prenom: "", telephone: "", email: "", password: "",
  });

  // ── Champs connexion ───────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ telephone: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.prenom) newErrors.prenom = "Le prénom est requis";
    if (!form.nom) newErrors.nom = "Le nom est requis";
    if (!form.telephone) newErrors.telephone = "Le téléphone est requis";
    if (!form.password) newErrors.password = "Le mot de passe est requis";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 caractères";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const compte = await registerComptePublicApi({
        ...form,
        email: form.email || undefined,
      });
      setCompte(compte);
      toast("Compte créé ! Annonce ajoutée aux favoris.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Erreur lors de la création du compte";
      if (msg.toLowerCase().includes("téléphone") || msg.toLowerCase().includes("telephone")) {
        setErrors({ telephone: msg });
      } else if (msg.toLowerCase().includes("email")) {
        setErrors({ email: msg });
      } else {
        setErrors({ form: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!loginForm.telephone) newErrors.loginTelephone = "Le téléphone est requis";
    if (!loginForm.password) newErrors.loginPassword = "Le mot de passe est requis";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const compte = await loginComptePublicApi(loginForm.telephone, loginForm.password);
      setCompte(compte);
      toast("Connecté ! Annonce ajoutée aux favoris.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Identifiants incorrects";
      setErrors({ loginForm: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#0C1A35] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-base">Sauvegarder cette annonce</h2>
            <p className="text-white/60 text-xs mt-0.5">Créez un compte pour retrouver vos favoris</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setTab("register"); setErrors({}); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "register" ? "text-[#0C1A35] border-b-2 border-[#D4A843]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Créer un compte
          </button>
          <button
            onClick={() => { setTab("login"); setErrors({}); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "login" ? "text-[#0C1A35] border-b-2 border-[#D4A843]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Se connecter
          </button>
        </div>

        <div className="p-6">
          {/* ── Formulaire Inscription ─────────────────────────────────────────── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Prénom *</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => { setForm((p) => ({ ...p, prenom: e.target.value })); setErrors((p) => ({ ...p, prenom: "" })); }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] ${errors.prenom ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Prénom"
                  />
                  {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Nom *</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => { setForm((p) => ({ ...p, nom: e.target.value })); setErrors((p) => ({ ...p, nom: "" })); }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] ${errors.nom ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Nom"
                  />
                  {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Téléphone *</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => { setForm((p) => ({ ...p, telephone: e.target.value })); setErrors((p) => ({ ...p, telephone: "" })); }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] ${errors.telephone ? "border-red-400" : "border-slate-200"}`}
                  placeholder="+221 77 000 00 00"
                />
                {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone}</p>}
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Email</label>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] ${errors.email ? "border-red-400" : "border-slate-200"}`}
                  placeholder="email@exemple.com (optionnel)"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: "" })); }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] pr-10 ${errors.password ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {errors.form && <p className="text-xs text-red-500">{errors.form}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-[#0C1A35] hover:bg-[#1A2942] disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? "Création en cours..." : "Créer mon compte et sauvegarder"}
              </button>
            </form>
          )}

          {/* ── Formulaire Connexion ───────────────────────────────────────────── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Téléphone *</label>
                <input
                  type="text"
                  value={loginForm.telephone}
                  onChange={(e) => { setLoginForm((p) => ({ ...p, telephone: e.target.value })); setErrors((p) => ({ ...p, loginTelephone: "" })); }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] ${errors.loginTelephone ? "border-red-400" : "border-slate-200"}`}
                  placeholder="+221 77 000 00 00"
                />
                {errors.loginTelephone && <p className="text-xs text-red-500 mt-1">{errors.loginTelephone}</p>}
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium mb-1 block text-left">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => { setLoginForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, loginPassword: "" })); }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]/30 focus:border-[#D4A843] pr-10 ${errors.loginPassword ? "border-red-400" : "border-slate-200"}`}
                    placeholder="Mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.loginPassword && <p className="text-xs text-red-500 mt-1">{errors.loginPassword}</p>}
              </div>

              {errors.loginForm && <p className="text-xs text-red-500">{errors.loginForm}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-[#0C1A35] hover:bg-[#1A2942] disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? "Connexion en cours..." : "Se connecter et sauvegarder"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
