import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Building2, Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { resetPasswordLocataireApi } from "@/api/locataireAuth";
import heroBg from "@/assets/bg-locataire.png";

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl text-sm bg-white/10 border text-white
   placeholder:text-white/30 outline-none transition-all pl-9 pr-10
   focus:border-white/40 focus:bg-white/15
   ${hasError ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`;

export default function LocataireResetPassword() {
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
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
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
      await resetPasswordLocataireApi(token, password);
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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0C1A35]">
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/82 to-[#0C1A35]/45" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between h-16 px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest text-[#D4A843]"
        >
          SEEK
        </Link>
        <Link
          to="/locataire/login"
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </header>

      {/* Contenu */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#D4A843] border border-[#D4A843]/30 bg-[#D4A843]/10 rounded-full px-4 py-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Espace Locataire
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white text-center mb-2 leading-tight">
            Nouveau mot de passe
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            Choisissez un nouveau mot de passe pour votre compte
          </p>

          <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            {success ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Mot de passe modifié !</h2>
                <p className="text-sm text-white/50 max-w-xs mx-auto">
                  Votre mot de passe a été réinitialisé avec succès.
                </p>
                <button
                  onClick={() => navigate("/locataire/login")}
                  className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#D4A843] text-[#0C1A35] text-sm font-bold hover:bg-[#c49a3a] transition-colors"
                >
                  Se connecter
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {!token && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-orange-500/15 border border-orange-400/25 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-300 leading-snug">Lien manquant ou invalide.</p>
                  </div>
                )}

                {/* Nouveau mot de passe */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 ml-0.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 caractères minimum"
                      className={inputCls(!!error && error.includes("caractère"))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 ml-0.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className={`w-full h-11 rounded-xl text-sm bg-white/10 border text-white
                        placeholder:text-white/30 outline-none transition-all pl-9 pr-3
                        focus:border-white/40 focus:bg-white/15 border-white/20`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/15 border border-red-400/25 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300 leading-snug">{error}</p>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#c49a3a] text-[#0C1A35] text-sm
                      font-bold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]
                      focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement…
                      </>
                    ) : (
                      "Enregistrer le mot de passe"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
