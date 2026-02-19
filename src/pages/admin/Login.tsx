import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";

// ─── Validation Zod (100 % front, aucune validation HTML) ────────────────────

const loginSchema = z.object({
  email: z
    .string({ required_error: "Veuillez saisir votre adresse email" })
    .min(1, "Veuillez saisir votre adresse email")
    .email("Format invalide — exemple : admin@seek.sn")
    .trim(),
  password: z
    .string({ required_error: "Veuillez saisir votre mot de passe" })
    .min(1, "Veuillez saisir votre mot de passe"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Résolution des erreurs serveur ──────────────────────────────────────────

function resolveServerError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Une erreur inattendue est survenue. Veuillez réessayer.";
  }

  // Pas de réponse reçue = problème réseau / serveur inaccessible
  if (!err.response) {
    return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  }

  const status  = err.response.status;
  const message = err.response.data?.message as string | undefined;

  switch (status) {
    case 401:
      return "Email ou mot de passe incorrect.";
    case 429:
      return "Trop de tentatives. Veuillez patienter 15 minutes avant de réessayer.";
    case 400:
      return message ?? "Les informations saisies sont invalides.";
    case 403:
      return "Accès refusé. Ce compte n'a pas les droits d'administration.";
    case 500:
    case 502:
    case 503:
      return "Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.";
    default:
      return message ?? "Une erreur est survenue. Veuillez réessayer.";
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // valide au blur, pas à chaque frappe
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setServerError(resolveServerError(err));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── Fond hero ────────────────────────────────────────────────────────── */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/80 to-[#0C1A35]/40" />

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-xl font-bold tracking-widest text-[#D4A843]">
          SEEK
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </header>

      {/* ── Contenu centré ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase
              text-[#D4A843] border border-[#D4A843]/30 bg-[#D4A843]/10 rounded-full px-4 py-1.5">
              Espace Administration
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white text-center mb-2 leading-tight">
            Connexion
          </h1>
          <p className="text-white/45 text-sm text-center mb-8">
            Accès réservé aux administrateurs SEEK
          </p>

          {/* ── Carte ──────────────────────────────────────────────────────── */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8">
            {/*
              noValidate  → désactive toute validation HTML5 du navigateur
              type="text" → évite le clavier email mobile ET les bulles de
                            validation natives sur type="email"
            */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-white/50 ml-0.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                  <input
                    id="email"
                    type="text"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="admin@seek.sn"
                    {...register("email")}
                    className={`w-full h-11 rounded-xl pl-9 pr-3 text-sm bg-white/10 border text-white
                      placeholder:text-white/30 outline-none transition-all
                      focus:border-white/40 focus:bg-white/15
                      ${errors.email ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      key="email-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 flex items-center gap-1 ml-0.5"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
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
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full h-11 rounded-xl pl-9 pr-14 text-sm bg-white/10 border text-white
                      placeholder:text-white/30 outline-none transition-all
                      focus:border-white/40 focus:bg-white/15
                      ${errors.password ? "border-red-400/60 bg-red-500/10" : "border-white/20"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30
                      hover:text-white/60 transition-colors text-xs select-none"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? "Masquer" : "Voir"}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      key="password-error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-400 flex items-center gap-1 ml-0.5"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Erreur serveur */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    key="server-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 rounded-xl bg-red-500/15
                      border border-red-400/25 px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300 leading-snug">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-1 border-t border-white/10" />

              {/* Bouton */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm
                  font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]
                  focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50 focus:ring-offset-1
                  focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:scale-100 flex items-center justify-center gap-2"
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
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
