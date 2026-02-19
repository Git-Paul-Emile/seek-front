import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Lock, ArrowLeft,
  AlertCircle, Loader2, Eye, EyeOff,
} from "lucide-react";
import axios from "axios";
import { loginOwnerApi } from "@/api/ownerAuth";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import heroBg from "@/assets/hero-bg.jpg";

// ─── Schéma Zod ───────────────────────────────────────────────────────────────

const schema = z.object({
  identifiant: z
    .string()
    .min(1, "L'identifiant est requis"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

type FormData = z.infer<typeof schema>;

// ─── Résolution des erreurs serveur ──────────────────────────────────────────

function resolveServerError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Une erreur inattendue est survenue. Veuillez réessayer.";
  }
  if (!err.response) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  }
  const status = err.response.status;
  switch (status) {
    case 401:
      return "Identifiant ou mot de passe incorrect.";
    case 429:
      return "Trop de tentatives. Veuillez patienter avant de réessayer.";
    case 500:
    case 502:
    case 503:
      return "Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.";
    default:
      return (err.response.data?.message as string | undefined) ?? "Une erreur est survenue. Veuillez réessayer.";
  }
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        key={message}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="text-xs text-red-400 flex items-center gap-1 ml-0.5 mt-1"
      >
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

const inputCls = (hasError: boolean) =>
  `w-full h-11 rounded-xl text-sm bg-white/10 border text-white
   placeholder:text-white/30 outline-none transition-all
   focus:border-white/40 focus:bg-white/15
   ${hasError ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerLogin() {
  const navigate = useNavigate();
  const { setOwner } = useOwnerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await loginOwnerApi({
        identifiant: data.identifiant,
        password: data.password,
      });
      setOwner(res.data.data);
      navigate("/owner/dashboard", { replace: true });
    } catch (err) {
      setServerError(resolveServerError(err));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Fond */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/82 to-[#0C1A35]/45" />

      {/* Header */}
      <header className="relative z-10 container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest text-[#D4A843]"
        >
          SEEK
        </Link>
        <Link
          to="/proprietaires"
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </header>

      {/* Contenu */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#D4A843] border border-[#D4A843]/30 bg-[#D4A843]/10 rounded-full px-4 py-1.5">
              Espace Propriétaires
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white text-center mb-2 leading-tight">
            Connexion
          </h1>
          <p className="text-white/45 text-sm text-center mb-8">
            Accédez à votre espace propriétaire
          </p>

          {/* Carte */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8">

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Identifiant */}
              <div className="space-y-1.5">
                <label htmlFor="identifiant" className="block text-xs font-medium text-white/50 ml-0.5">
                  Téléphone ou adresse email
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                  <input
                    id="identifiant"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="+221 77 000 00 00 ou prenom@email.com"
                    {...register("identifiant")}
                    className={`${inputCls(!!errors.identifiant)} pl-9 pr-3`}
                  />
                </div>
                <FieldError message={errors.identifiant?.message} />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-white/50 ml-0.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    {...register("password")}
                    className={`${inputCls(!!errors.password)} pl-9 pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/65 transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              {/* Erreur serveur */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    key="server-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 rounded-xl bg-red-500/15 border border-red-400/25 px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300 leading-snug">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] text-sm
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

              {/* Lien inscription */}
              <p className="text-center text-xs text-white/35">
                Pas encore de compte ?{" "}
                <Link
                  to="/owner/register"
                  className="text-white/60 hover:text-[#D4A843] transition-colors"
                >
                  Créer un compte
                </Link>
              </p>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
