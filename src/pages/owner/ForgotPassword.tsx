import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { forgotPasswordApi } from "@/api/ownerAuth";
import heroBg from "@/assets/hero-bg.jpg";

export default function ForgotPassword() {
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
      await forgotPasswordApi(identifiant.trim());
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
    <div className="min-h-screen flex">
      {/* Illustration */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/80 to-[#0C1A35]/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-white">
          <h2 className="text-4xl font-display font-bold mb-4 leading-tight">
            Mot de passe oublié
          </h2>
          <p className="text-white/70 text-lg max-w-sm text-center">
            Entrez votre numéro de téléphone ou email pour recevoir un lien de réinitialisation.
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
            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-[#0C1A35] mb-2">Email envoyé !</h1>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Si ce compte existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte mail.
                </p>
                <Link
                  to="/owner/login"
                  className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49735] transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold text-[#0C1A35] mb-1">
                  Réinitialiser le mot de passe
                </h1>
                <p className="text-sm text-slate-500 mb-6">
                  Entrez votre téléphone ou email associé à votre compte.
                </p>

                {error && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Téléphone ou email
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={identifiant}
                        onChange={(e) => setIdentifiant(e.target.value)}
                        placeholder="77 000 00 00 ou email@exemple.com"
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 text-sm
                          text-slate-700 placeholder:text-slate-300 outline-none bg-slate-50
                          focus:border-[#D4A843] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifiant.trim()}
                    className="w-full h-12 rounded-xl bg-[#D4A843] text-white font-semibold text-sm
                      hover:bg-[#c49735] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le lien"}
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
