import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOwnerAuth } from "@/context/OwnerAuthContext";
import {
  Building2, TrendingUp, Bell,
  FileText, Headphones, ArrowRight, Menu, X,
  CheckCircle2, Users, UserPlus, Upload, MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import Footer from "@/components/layout/Footer";

// ─── Navbar propriétaires ──────────────────────────────────────────────────

const NAV_ANCHORS = [
  { href: "#accueil", label: "Accueil" },
  { href: "#comment-ca-marche", label: "Comment ça marche ?" },
  { href: "#pourquoi-nous", label: "Pourquoi nous ?" },
];

const ProprietairesNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, owner, logout } = useOwnerAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = !scrolled;

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent border-b border-white/10"
          : "bg-white shadow-sm border-b border-slate-100"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className={`font-display text-xl font-bold tracking-widest transition-colors duration-300 ${
              transparent ? "text-[#D4A843]" : "text-[#0C1A35]"
            }`}
          >
            SEEK
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all ${
              transparent
                ? "bg-white/15 text-white/70"
                : "bg-[#0C1A35]/8 text-[#0C1A35]/55"
            }`}
          >
            Propriétaires
          </span>
        </Link>

        {/* Desktop anchor links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_ANCHORS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`text-sm font-medium transition-colors duration-200 ${
                transparent
                  ? "text-white/65 hover:text-white"
                  : "text-slate-500 hover:text-[#0C1A35]"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className={`text-sm font-medium transition-colors ${
                transparent
                  ? "text-white/55 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-[#0C1A35]"
              }`}
            >
              ← Retour au site
            </Button>
          </Link>
          <div className={`w-px h-4 ${transparent ? "bg-white/20" : "bg-slate-200"}`} />
          {isAuthenticated ? (
            <>
              <Link to="/owner/dashboard">
                <Button
                  size="sm"
                  className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold px-5 transition-all hover:scale-[1.03]"
                >
                  {owner?.prenom ? `Bonjour, ${owner.prenom}` : "Dashboard"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className={`text-sm font-medium transition-colors ${
                  transparent
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-slate-400 hover:text-[#0C1A35]"
                }`}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/owner/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-medium transition-colors ${
                    transparent
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-slate-600 hover:text-[#0C1A35]"
                  }`}
                >
                  Connexion
                </Button>
              </Link>
              <Link to="/owner/register">
                <Button
                  size="sm"
                  className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold px-5 transition-all hover:scale-[1.03]"
                >
                  Inscription
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-1 rounded-md ${
            transparent ? "text-white" : "text-[#0C1A35]"
          }`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0C1A35] overflow-hidden"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {NAV_ANCHORS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-medium py-2.5 px-3 rounded-xl text-left text-white/65 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-white/10 mt-3 pt-4 flex flex-col gap-2">
                <Link to="/" onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full text-white/45 hover:text-white hover:bg-white/10 justify-start text-sm"
                  >
                    ← Retour au site
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/owner/dashboard" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full text-white/50 hover:text-white hover:bg-white/10 justify-start"
                      onClick={() => { logout(); setOpen(false); }}
                    >
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/owner/login" onClick={() => setOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full text-white/65 hover:text-white hover:bg-white/10 justify-start"
                      >
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/owner/register" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold">
                        Inscription
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ─── Hero ──────────────────────────────────────────────────────────────────

const Hero = () => (
  <section
    id="accueil"
    className="relative min-h-screen flex items-center overflow-hidden"
  >
    <img
      src={heroBg}
      alt="Gestion locative SEEK"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-[#0C1A35]/92 via-[#0C1A35]/78 to-[#1E3A6E]/55" />

    <div className="relative z-10 container mx-auto px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl"
      >
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
          Gérez vos biens<br />
          <span className="text-[#D4A843]">simplement</span><br />
          avec SEEK
        </h1>

        <p className="text-white/60 text-xl mb-10 max-w-lg leading-relaxed">
          La plateforme qui vous accompagne dans toute votre gestion locative :
          annonces, candidatures, documents et bien plus encore.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/owner/register">
            <Button
              size="lg"
              className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-bold px-10 py-6 text-base shadow-2xl shadow-[#D4A843]/20 transition-all hover:scale-[1.03]"
            >
              Créer un compte gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <button
            onClick={() =>
              document
                .querySelector("#comment-ca-marche")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center justify-center gap-2 text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-8 py-3.5 text-base font-medium transition-all"
          >
            Comment ça marche ?
          </button>
        </div>

      </motion.div>
    </div>
  </section>
);

// ─── Comment ça marche ─────────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Créez votre compte",
    desc: "Inscrivez-vous en quelques minutes. Renseignez vos informations et accédez immédiatement à votre espace propriétaire.",
  },
  {
    step: "02",
    icon: Upload,
    title: "Publiez votre annonce",
    desc: "Ajoutez vos biens avec photos, description et loyer. Notre formulaire guidé vous aide à créer une annonce attractive en un temps record.",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Recevez des candidatures",
    desc: "Les locataires intéressés vous contactent directement. Echangez et sélectionnez le candidat idéal.",
  },
  {
    step: "04",
    icon: LayoutDashboard,
    title: "Gérez en toute simplicité",
    desc: "Suivez vos locations, paiements et contrats depuis votre tableau de bord. Tout est centralisé pour vous simplifier la vie.",
  },
];

const HowItWorks = () => (
  <section id="comment-ca-marche" className="py-24 bg-[#F8F5EE]">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          Simple & rapide
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0C1A35] mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
          Démarrez en 4 étapes simples et commencez à gérer vos biens dès aujourd'hui.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map(({ step, icon: Icon, title, desc }, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[calc(50%+44px)] right-[-50%] h-px bg-[#D4A843]/20 z-0" />
            )}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#D4A843]" />
                </div>
                <span className="font-display text-4xl font-bold text-[#0C1A35]/8">
                  {step}
                </span>
              </div>
              <h3 className="font-semibold text-[#0C1A35] text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Seek la solution ──────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Building2,
    title: "Gestion centralisée",
    desc: "Tous vos biens réunis en un seul endroit. Gérez appartements, villas et studios depuis un tableau de bord unique.",
  },
  {
    icon: FileText,
    title: "Contrats & documents",
    desc: "Générez et archivez vos quittances et autres documents numériquement. Fini les papiers éparpillés.",
  },
  {
    icon: TrendingUp,
    title: "Suivi des paiements",
    desc: "Visualisez vos loyers perçus, les retards et l'historique complet de chaque locataire en un coup d'œil.",
  },
  {
    icon: Bell,
    title: "Alertes & notifications",
    desc: "Recevez des rappels automatiques pour les renouvellements de bail, les échéances et les nouvelles candidatures.",
  },
  {
    icon: Users,
    title: "Gestion des locataires",
    desc: "Accédez aux profils complets de vos locataires.",
  },
  {
    icon: Headphones,
    title: "Assistance dédiée",
    desc: "Notre équipe vous accompagne à chaque étape, de la mise en ligne de votre annonce jusqu'à la fin.",
  },
];

const SeekSolution = () => (
  <section id="pourquoi-nous" className="py-24 bg-[#0C1A35]">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — Text */}
        <div>
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/12 border border-[#D4A843]/25 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Pourquoi nous ?
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            SEEK, la solution qui vous assiste dans votre{" "}
            <span className="text-[#D4A843]">gestion locative</span>
          </h2>
          <p className="text-white/55 text-lg leading-relaxed mb-8">
            Seek a pour mission d'assister à la fois les locataires et les
            propriétaires. Nous mettons à votre disposition des outils puissants
            pour simplifier chaque aspect de la gestion de vos biens immobiliers
            au Sénégal.
          </p>
          <div className="flex flex-col gap-3 mb-10">
            {[
              "Plateforme 100% accessible pour les propriétaires",
              "Interface intuitive, aucune formation requise",
              "Support client réactif en français",
              "Données hébergées en toute sécurité",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-white/70">
                <CheckCircle2 className="w-5 h-5 text-[#D4A843] flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Link to="/owner/register">
            <Button className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-bold px-8 py-5 transition-all hover:scale-[1.03]">
              Rejoindre SEEK gratuitement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Right — Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white/5 border border-white/8 rounded-2xl p-5 hover:bg-white/8 hover:border-white/15 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/12 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#D4A843]" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── CTA final ─────────────────────────────────────────────────────────────

const FinalCTA = () => (
  <section className="relative py-24 bg-[#F8F5EE] overflow-hidden">
    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#D4A843] opacity-[0.06] blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500 opacity-[0.04] blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

    <div className="relative container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          Commencez dès aujourd'hui
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0C1A35] mb-5 max-w-3xl mx-auto leading-tight">
          Gérer vos biens en location n'a jamais été aussi facile !
        </h2>
        <p className="text-slate-500 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Rejoignez des centaines de propriétaires qui font confiance à SEEK
          pour gérer leur patrimoine immobilier au Sénégal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/owner/register">
            <Button
              size="lg"
              className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-bold px-10 py-6 text-base shadow-xl shadow-[#D4A843]/15 transition-all hover:scale-[1.03]"
            >
              Créer mon compte gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/owner/login">
            <Button
              size="lg"
              variant="outline"
              className="border-[#0C1A35]/15 text-[#0C1A35] hover:bg-[#0C1A35]/5 px-10 py-6 text-base transition-all"
            >
              J'ai déjà un compte
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Page ──────────────────────────────────────────────────────────────────

const Proprietaires = () => (
  <div>
    <ProprietairesNavbar />
    <Hero />
    <HowItWorks />
    <SeekSolution />
    <FinalCTA />
    <Footer />
  </div>
);

export default Proprietaires;
