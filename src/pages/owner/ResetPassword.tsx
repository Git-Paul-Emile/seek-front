import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { resetPasswordApi } from "@/api/ownerAuth";
import heroBg from "@/assets/herosectionowner.png";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!token) {
      setError("Lien invalide. Demandez un nouveau lien de réinitialisation.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue. Le lien est peut-être expiré.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Illustration */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/80 to-[#0C1A35]/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-white">
          <h2 className="text-4xl font-display font-bold mb-4 leading-tight">
            Nouveau mot de passe
          </h2>
          <p className="text-white/70 text-lg max-w-sm text-center">
            Choisissez un nouveau mot de passe sécurisé pour votre compte SEEK.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#F8F5EE]">
        <div className="w-full max-w-md">
          <Link
            to="/owner/login"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0C1A35] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-[#0C1A35] mb-2">Mot de passe modifié !</h1>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Votre mot de passe a été réinitialisé avec succès.
                </p>
                <button
                  onClick={() => navigate("/owner/login")}
                  className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49735] transition-colors"
                >
                  Se connecter
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold text-[#0C1A35] mb-1">
                  Réinitialiser le mot de passe
                </h1>
                <p className="text-sm text-slate-500 mb-6">
                  Choisissez un nouveau mot de passe d'au moins 8 caractères.
                </p>

                {!token && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Lien manquant ou invalide.
                  </div>
                )}

                {error && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8 caractères minimum"
                        className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-200 text-sm
                          text-slate-700 placeholder:text-slate-300 outline-none bg-slate-50
                          focus:border-[#D4A843] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 text-sm
                          text-slate-700 placeholder:text-slate-300 outline-none bg-slate-50
                          focus:border-[#D4A843] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full h-12 rounded-xl bg-[#D4A843] text-white font-semibold text-sm
                      hover:bg-[#c49735] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer le mot de passe"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
