import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Phone, Lock, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { loginLocataireApi, meLocataireApi } from "@/api/locataireAuth";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

// ─── Helpers UI ────────────────────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl text-sm bg-white/10 border text-white
   placeholder:text-white/30 outline-none transition-all pl-9 pr-3
   focus:border-white/40 focus:bg-white/15
   ${hasError ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireLogin() {
  const navigate = useNavigate();
  const { setLocataire } = useLocataireAuth();
  const [form, setForm] = useState({ identifiant: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.identifiant || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setIsSubmitting(true);
    try {
      await loginLocataireApi(form);
      const locataire = await meLocataireApi();
      setLocataire(locataire);
      navigate("/locataire/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Identifiant ou mot de passe incorrect";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0C1A35]">

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between h-16 px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest text-[#D4A843]"
        >
          SEEK
        </Link>
        <Link
          to="/"
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
            Connexion
          </h1>
          <p className="text-white/40 text-sm text-center mb-8">
            Accédez à votre espace locataire
          </p>

          {/* Carte */}
          <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Identifiant */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/50 ml-0.5">
                  Téléphone ou adresse email
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    value={form.identifiant}
                    onChange={(e) => setForm((p) => ({ ...p, identifiant: e.target.value }))}
                    placeholder="+221 77 000 00 00 ou email"
                    className={inputCls(!!error)}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/50 ml-0.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Votre mot de passe"
                    className={inputCls(!!error)}
                  />
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-500/15 border border-red-400/25 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 leading-snug">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#c49a3a] text-[#0C1A35] text-sm
                    font-bold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connexion en cours…
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-white/30">
                Vous devez recevoir un lien d'activation de votre propriétaire pour créer votre compte.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
