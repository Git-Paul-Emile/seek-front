import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Bell, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  Menu,
  X,
  Shield,
  Zap,
  Heart,
  Clock,
  TrendingUp,
  Smartphone,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "#why-us", label: "Pourquoi-nous ?" },
  { to: "#how-it-works", label: "Comment ça marche ?" },
  { to: "#pricing", label: "Tarifs" },
];

const steps = [
  {
    icon: Building2,
    title: "Créez un bien",
    description: "Ajoutez votre premier bien immobilier avec photos, description et documents associés."
  },
  {
    icon: FileCheck,
    title: "Ajoutez un locataire",
    description: "Enregistrez les informations de votre locataire : identité, contacts, documents."
  },
  {
    icon: FileText,
    title: "Créez une location",
    description: "Liez votre bien immobilier et votre locataire, établissez le bail et suivez les paiements."
  }
];

const features = [
  {
    icon: Building2,
    title: "Gestion des biens",
    description: "Centralisez tous vos biens immobiliers en un seul endroit."
  },
  {
    icon: FileText,
    title: "Gestion des locations",
    description: "Gérez vos contrats de bail, suivez les dates clés et renouvellements."
  },
  {
    icon: DollarSign,
    title: "Suivi des loyers",
    description: "Visualisez vos revenus et suivez les paiements en retard."
  },
  {
    icon: FileText,
    title: "Quittances automatiques",
    description: "Générez et envoyez des quittances automatiquement."
  },
  {
    icon: Bell,
    title: "Rappels de paiement",
    description: "Envoyez des rappels automatiques aux locataires en retard."
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description: "Vue d'ensemble claire de votre patrimoine et revenus."
  }
];

const benefits = [
  {
    icon: Clock,
    title: "Gagnez du temps",
    description: "Automatisez les tâches répétitives et concentrez-vous sur l'essentiel."
  },
  {
    icon: CheckCircle2,
    title: "Moins d'erreurs",
    description: "Réduisez les risques d'erreurs dans la gestion de vos locations."
  },
  {
    icon: Heart,
    title: "Tout centralisé",
    description: "Tous vos documents, informations et données au même endroit."
  },
  {
    icon: Zap,
    title: "Documents automatiques",
    description: "Générez quittances, baux et courriers en quelques clics."
  }
];

const benefitsDetailed = [
  {
    icon: Smartphone,
    title: "Accessible partout",
    description: "Gérez vos locations depuis votre ordinateur, tablette ou smartphone."
  },
  {
    icon: TrendingUp,
    title: "Optimisez vos revenus",
    description: "Suivez vos revenus locatifs et identifiez les opportunités d'amélioration."
  },
  {
    icon: FileCheck,
    title: "Documents conformes",
    description: "Tous vos documents sont générés selon les normes légales en vigueur."
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Vos informations sont chiffrées et protégées sur des serveurs sécurisés."
  }
];

const pricingPlans = [
  {
    name: "Découverte",
    price: "Gratuit",
    description: "Pour commencer à gérer vos locations",
    features: [
      "Jusqu'à 2 biens",
      "Gestion de base des locataires",
      "Suivi des paiements",
      "Génération de quittances",
      "Support par email"
    ],
    cta: "Commencer gratuitement",
    popular: false
  },
  {
    name: "Essentiel",
    price: "9 900 XAF",
    period: "/mois",
    description: "Pour les propriétaires actifs",
    features: [
      "Jusqu'à 5 biens",
      "Gestion complète des locataires",
      "Rappels de paiement automatiques",
      "Rapports et statistiques",
      "Support prioritaire",
      "Export de données"
    ],
    cta: "Choisir Essentiel",
    popular: true
  },
  {
    name: "Professionnel",
    price: "19 900 XAF",
    period: "/mois",
    description: "Pour les gestionnaires exigeants",
    features: [
      "Biens illimités",
      "Toutes les fonctionnalités",
      "Gestion multi-comptes",
      "API access",
      "Support dédié",
      "Formation personnalisée"
    ],
    cta: "Choisir Professionnel",
    popular: false
  }
];

const testimonials = [
  {
    quote: "Seek a transformé ma façon de gérer mes 3 appartements. Je gagne des heures chaque semaine.",
    author: "Marie Dupont",
    role: "Propriétaire de 3 biens",
    rating: 5
  },
  {
    quote: "Fini les retards de loyer ! Les rappels automatiques font vraiment la différence.",
    author: "Jean Martin",
    role: "Propriétaire de 5 biens",
    rating: 5
  },
  {
    quote: "Simple, efficace, vraiment conçu pour les particuliers. Je recommande Seek à tous les propriétaires.",
    author: "Sophie Bernard",
    role: "Investisseuse immobilière",
    rating: 5
  }
];

const OwnerHome = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 1️⃣ HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary tracking-wide">
                SEEK
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/owner/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/owner/register">
                <Button size="sm">
                  Inscription
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden bg-white border-t border-gray-100"
              >
                <div className="px-4 py-4 flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <a
                      key={link.to}
                      href={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium py-2 text-gray-600"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                    <Link to="/owner/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/owner/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        Inscription
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2️⃣ SECTION HERO */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Gérez vos locations <span className="text-primary">simplement</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                La solution tout-en-un pour les propriétaires bailleurs. 
                Gestion des loyers, quittances automatiques, suivi des paiements — 
                tout ce dont vous avez besoin pour gérer vos biens en toute sérénité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/owner/register">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Créer un compte gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Voir comment ça marche
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3️⃣ COMMENT ÇA MARCHE ? */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600">
              Three étapes simples pour commencer à gérer vos locations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{index + 1}</span>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4️⃣ SEEK VOUS ASSISTE AVEC VOTRE GESTION LOCATIVE */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seek vous assiste avec votre gestion locative
            </h2>
            <p className="text-gray-600">
              Toutes les fonctionnalités pour simplifier votre quotidien de propriétaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ POURQUOI CHOISIR SEEK ? */}
      <section id="why-us" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Seek ?
            </h2>
            <p className="text-gray-600">
              Les bénéfices concrets pour votre quotidien de propriétaire
            </p>
          </div>

          {/* Avantages principaux */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Avantages détaillés */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefitsDetailed.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-5 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-medium text-base mb-1">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ TARIFS */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs
            </h2>
            <p className="text-gray-600">
              Des prix transparents, adaptés à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular ? "ring-2 ring-primary shadow-xl scale-105" : "border border-gray-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    Le plus populaire
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/owner/register" className="block">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7️⃣ GÉRER VOS BIENS EN LOCATION N'A JAMAIS ÉTÉ AUSS FACILE ! */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Gérer vos biens en location n'a jamais été aussi facile !
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Rejoignez des centaines de propriétaires qui nous font confiance
              </p>
              <Link to="/owner/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chiffres clés */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="text-sm text-gray-600">Propriétaires actifs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">1 200+</p>
              <p className="text-sm text-gray-600">Biens gérés</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">98%</p>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">2M€</p>
              <p className="text-sm text-gray-600">Loyers collectés/an</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9️⃣ FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="font-display text-2xl font-bold text-white tracking-wide">
                  SEEK
                </span>
              </Link>
              <p className="text-sm">
                La solution de gestion locative conçue pour les propriétaires bailleurs.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a></li>
                <li><a href="#why-us" className="hover:text-white transition-colors">Pourquoi Seek</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Conditions générales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>contact@seek.cm</li>
                <li>+237 6 00 00 00 00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} SEEK. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OwnerHome;
