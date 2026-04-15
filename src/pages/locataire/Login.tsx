import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import axios from "axios";
import { loginLocataireApi } from "@/api/locataireAuth";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";
import heroBg from "@/assets/bg-locataire.png";

const schema = z.object({
  identifiant: z.string().min(1, "L'identifiant est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type FormData = z.infer<typeof schema>;

function resolveServerError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Une erreur inattendue est survenue. Veuillez reessayer.";
  }
  if (!err.response) {
    return "Impossible de joindre le serveur. Verifiez votre connexion.";
  }

  const status = err.response.status;
  switch (status) {
    case 401:
      return "Identifiant ou mot de passe incorrect.";
    case 403:
      return (err.response.data?.message as string | undefined) ?? "Acces refuse.";
    case 429:
      return "Trop de tentatives. Veuillez patienter avant de reessayer.";
    case 500:
    case 502:
    case 503:
      return "Le serveur rencontre un probleme. Veuillez reessayer dans quelques instants.";
    default:
      return (err.response.data?.message as string | undefined) ?? "Une erreur est survenue. Veuillez reessayer.";
  }
}

const FieldError = ({ message }: { message?: string }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        key={message}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="ml-0.5 mt-1 flex items-center gap-1 text-xs text-red-400"
      >
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
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

export default function LocataireLogin() {
  const navigate = useNavigate();
  const { setLocataire } = useLocataireAuth();
  const { refreshMe: refreshPublicAccount } = useComptePublicAuth();
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
      const { locataire } = await loginLocataireApi({
        identifiant: data.identifiant,
        password: data.password,
      });
      setLocataire(locataire);
      await refreshPublicAccount();
      navigate("/locataire/dashboard", { replace: true });
    } catch (err) {
      setServerError(resolveServerError(err));
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/82 to-[#0C1A35]/45" />

      <header className="relative z-10 container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-widest text-[#D4A843]"
        >
          SEEK
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D4A843]">
              <Building2 className="h-3.5 w-3.5" />
              Espace Locataire
            </span>
          </div>

          <h1 className="mb-2 text-center font-display text-4xl font-bold leading-tight text-white">
            Connexion
          </h1>
          <p className="mb-8 text-center text-sm text-white/45">
            Accedez a votre espace locataire
          </p>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-8 backdrop-blur-md">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="identifiant" className="ml-0.5 block text-xs font-medium text-white/50">
                  Telephone ou adresse email
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
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

              <div className="space-y-1.5">
                <label htmlFor="password" className="ml-0.5 block text-xs font-medium text-white/50">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
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
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/65"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <div className="text-right -mt-1">
                <Link
                  to="/locataire/forgot-password"
                  className="text-xs text-white/50 transition-colors hover:text-white/80"
                >
                  Mot de passe oublie ?
                </Link>
              </div>

              <AnimatePresence>
                {serverError && (
                  <motion.div
                    key="server-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/15 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                    <p className="text-sm leading-snug text-red-300">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D4A843] text-sm font-bold text-[#0C1A35] shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02] hover:bg-[#C09535] focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-white/35">
                Vous devez recevoir un lien d'activation de votre proprietaire pour creer votre compte.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
