import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Phone, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { forgotPasswordLocataireApi } from "@/api/locataireAuth";
import heroBg from "@/assets/bg-locataire.png";

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl text-sm bg-white/10 border text-white
   placeholder:text-white/30 outline-none transition-all pl-9 pr-3
   focus:border-white/40 focus:bg-white/15
   ${hasError ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`;

export default function LocataireForgotPassword() {
  const [identifiant, setIdentifiant] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiant.trim()) return;
    setError("");
    setLoading(true);
    try {
      await forgotPasswordLocataireApi(identifiant.trim());
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
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
            Mot de passe oublié
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            Entrez votre téléphone ou email pour recevoir un lien de réinitialisation
          </p>

          <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Lien envoyé !</h2>
                <p className="text-sm text-white/50 max-w-xs mx-auto">
                  Si ce compte existe et possède un email, un lien de réinitialisation a été envoyé.
                </p>
                <Link
                  to="/locataire/login"
                  className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#D4A843] text-[#0C1A35] text-sm font-bold hover:bg-[#c49a3a] transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/50 ml-0.5">
                    Téléphone ou adresse email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      type="text"
                      value={identifiant}
                      onChange={(e) => setIdentifiant(e.target.value)}
                      placeholder="+221 77 000 00 00 ou email"
                      className={inputCls(!!error)}
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
                    disabled={loading || !identifiant.trim()}
                    className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#c49a3a] text-[#0C1A35] text-sm
                      font-bold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]
                      focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      "Envoyer le lien"
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-white/30">
                  Le lien est valable 1 heure.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
