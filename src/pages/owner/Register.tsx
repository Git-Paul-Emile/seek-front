import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, Lock, ArrowLeft,
  AlertCircle, Loader2, Eye, EyeOff, ChevronDown, CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { registerOwnerApi } from "@/api/ownerAuth";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import heroBg from "@/assets/hero-bg.jpg";

// ─── Schéma Zod (validation 100 % front, sans validation HTML) ───────────────

const schema = z.object({
  prenom: z
    .string()
    .min(2, "Le prénom est requis (2 caractères minimum)"),
  nom: z
    .string()
    .min(2, "Le nom est requis (2 caractères minimum)"),
  sexe: z.string(),
  telephone: z
    .string()
    .min(1, "Le numéro WhatsApp est requis")
    .regex(
      /^[+]?[\d\s\-()\d]{7,}$/,
      "Format invalide — ex : 77 000 00 00 ou +221 77 000 00 00"
    ),
  email: z.string().refine(
    (v) => v === "" || z.string().email().safeParse(v).success,
    "Format email invalide — ex : prenom@email.com"
  ),
  password: z
    .string()
    .min(8, "Le mot de passe est requis (8 caractères minimum)"),
  cgu: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les CGU pour continuer" }),
  }),
  confidentialite: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter la politique de confidentialité pour continuer",
    }),
  }),
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
  const message = err.response.data?.message as string | undefined;

  switch (status) {
    case 409:
      return message ?? "Un compte avec ces informations existe déjà.";
    case 400:
      return message ?? "Les informations saisies sont invalides.";
    case 429:
      return "Trop de tentatives. Veuillez patienter avant de réessayer.";
    case 500:
    case 502:
    case 503:
      return "Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.";
    default:
      return message ?? "Une erreur est survenue. Veuillez réessayer.";
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

export default function OwnerRegister() {
  const navigate = useNavigate();
  const { setOwner } = useOwnerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { sexe: "", email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await registerOwnerApi({
        prenom: data.prenom,
        nom: data.nom,
        sexe: data.sexe,
        telephone: data.telephone,
        email: data.email,
        password: data.password,
      });

      // Connecter le propriétaire immédiatement avec les données retournées
      setOwner(res.data.data);
      setSuccess(true);

      // Redirection vers le dashboard après un court délai (affichage du message)
      setTimeout(() => navigate("/owner/dashboard", { replace: true }), 1800);
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
          className="w-full max-w-lg"
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#D4A843] border border-[#D4A843]/30 bg-[#D4A843]/10 rounded-full px-4 py-1.5">
              Espace Propriétaires
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white text-center mb-2 leading-tight">
            Créer un compte
          </h1>
          <p className="text-white/45 text-sm text-center mb-8">
            Rejoignez SEEK et gérez vos biens en toute simplicité
          </p>

          {/* Carte */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8">

            {/* Message de succès */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-3 rounded-xl bg-emerald-500/15 border border-emerald-400/25 px-4 py-4 mb-6"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-300 font-medium">
                      Compte créé avec succès !
                    </p>
                    <p className="text-xs text-emerald-400/70 mt-0.5">
                      Bienvenue sur SEEK. Redirection vers votre tableau de bord…
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="prenom" className="block text-xs font-medium text-white/50 ml-0.5">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                    <input
                      id="prenom"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Mamadou"
                      {...register("prenom")}
                      className={`${inputCls(!!errors.prenom)} pl-9 pr-3`}
                    />
                  </div>
                  <FieldError message={errors.prenom?.message} />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="nom" className="block text-xs font-medium text-white/50 ml-0.5">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                    <input
                      id="nom"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Diallo"
                      {...register("nom")}
                      className={`${inputCls(!!errors.nom)} pl-9 pr-3`}
                    />
                  </div>
                  <FieldError message={errors.nom?.message} />
                </div>
              </div>

              {/* Sexe */}
              <div className="space-y-1.5">
                <label htmlFor="sexe" className="block text-xs font-medium text-white/50 ml-0.5">
                  Sexe
                  <span className="ml-1.5 text-white/30 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <select
                    id="sexe"
                    {...register("sexe")}
                    className={`${inputCls(false)} px-3 pr-9 appearance-none cursor-pointer`}
                  >
                    <option value="" className="bg-[#0C1A35]">Non précisé</option>
                    <option value="homme" className="bg-[#0C1A35]">Homme</option>
                    <option value="femme" className="bg-[#0C1A35]">Femme</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                </div>
              </div>

              {/* Téléphone WhatsApp */}
              <div className="space-y-1.5">
                <label htmlFor="telephone" className="block text-xs font-medium text-white/50 ml-0.5">
                  Numéro WhatsApp principal
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                  <input
                    id="telephone"
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+221 77 000 00 00"
                    {...register("telephone")}
                    className={`${inputCls(!!errors.telephone)} pl-9 pr-3`}
                  />
                </div>
                <FieldError message={errors.telephone?.message} />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-white/50 ml-0.5">
                  Adresse email
                  <span className="ml-1.5 text-white/30 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="prenom@email.com"
                    {...register("email")}
                    className={`${inputCls(!!errors.email)} pl-9 pr-3`}
                  />
                </div>
                <FieldError message={errors.email?.message} />
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
                    autoComplete="new-password"
                    placeholder="8 caractères minimum"
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

              <div className="pt-1 border-t border-white/10" />

              {/* CGU */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" {...register("cgu")} className="sr-only peer" />
                    <div className={`w-[18px] h-[18px] rounded-[4px] border transition-all
                      peer-checked:bg-[#D4A843] peer-checked:border-[#D4A843]
                      ${errors.cgu ? "border-red-400/60 bg-red-500/10" : "border-white/30 bg-white/10"}
                      group-hover:border-white/50`}
                    />
                    <svg className="absolute inset-0 w-[18px] h-[18px] text-[#0C1A35] opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9l3.5 3.5L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/60 leading-snug">
                    J'accepte les{" "}
                    <Link to="/cgu" target="_blank" className="text-[#D4A843] hover:underline" onClick={(e) => e.stopPropagation()}>
                      Conditions Générales d'Utilisation
                    </Link>
                  </span>
                </label>
                <FieldError message={errors.cgu?.message} />
              </div>

              {/* Confidentialité */}
              <div className="space-y-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" {...register("confidentialite")} className="sr-only peer" />
                    <div className={`w-[18px] h-[18px] rounded-[4px] border transition-all
                      peer-checked:bg-[#D4A843] peer-checked:border-[#D4A843]
                      ${errors.confidentialite ? "border-red-400/60 bg-red-500/10" : "border-white/30 bg-white/10"}
                      group-hover:border-white/50`}
                    />
                    <svg className="absolute inset-0 w-[18px] h-[18px] text-[#0C1A35] opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9l3.5 3.5L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/60 leading-snug">
                    J'accepte la{" "}
                    <Link to="/confidentialite" target="_blank" className="text-[#D4A843] hover:underline" onClick={(e) => e.stopPropagation()}>
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
                <FieldError message={errors.confidentialite?.message} />
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
                  disabled={isSubmitting || success}
                  className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] text-sm
                    font-bold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création en cours…
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </div>

              {/* Lien connexion */}
              <p className="text-center text-xs text-white/35">
                Déjà un compte ?{" "}
                <Link
                  to="/owner/login"
                  className="text-white/60 hover:text-[#D4A843] transition-colors"
                >
                  Se connecter
                </Link>
              </p>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
