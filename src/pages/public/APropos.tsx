import { Link } from "react-router-dom";
import {
  Shield,
  MapPin,
  Users,
  Building2,
  CheckCircle2,
  Star,
  TrendingUp,
  HeartHandshake,
  Eye,
  Target,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Données ──────────────────────────────────────────────────────────────────

const VALEURS = [
  {
    icon: Shield,
    titre: "Confiance",
    texte: "Chaque propriétaire est vérifié manuellement. Vos données sont protégées conformément à la Loi n° 2008-12 et sous le contrôle de la CDP Sénégal.",
  },
  {
    icon: Eye,
    titre: "Transparence",
    texte: "Prix clairs, diagnostics complets, historique des biens. Aucune mauvaise surprise entre la recherche et la signature du bail.",
  },
  {
    icon: HeartHandshake,
    titre: "Proximité",
    texte: "Conçu pour le marché sénégalais : Mobile Money, quartiers géolocalisés, support en wolof et français.",
  },
  {
    icon: TrendingUp,
    titre: "Innovation",
    texte: "Gestion de bail numérique, états des lieux dématérialisés, rappels de loyer automatiques — une gestion locative moderne.",
  },
];

const CHIFFRES = [
  { valeur: "100 %", label: "Propriétaires vérifiés", icon: Shield },
  { valeur: "3 villes", label: "Couverture au Sénégal", icon: MapPin },
  { valeur: "24 / 7", label: "Accès à votre espace", icon: TrendingUp },
  { valeur: "0 papier", label: "Gestion 100 % numérique", icon: CheckCircle2 },
];

const EQUIPE = [
  {
    nom: "Équipe Produit",
    role: "Design & Développement",
    description: "Ingénieurs et designers passionnés par l'immobilier sénégalais.",
    color: "bg-[#0C1A35]",
  },
  {
    nom: "Équipe Opérations",
    role: "Vérification & Support",
    description: "Chaque propriétaire passe par notre processus de vérification humaine.",
    color: "bg-[#D4A843]",
  },
  {
    nom: "Équipe Conformité",
    role: "Légal & Protection des données",
    description: "Respect du droit sénégalais et des recommandations de la CDP.",
    color: "bg-slate-700",
  },
];

// ─── Composants ───────────────────────────────────────────────────────────────

function SectionTitle({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-xl mx-auto mb-12">
      <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-3">
        {label}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#0C1A35] leading-snug">{title}</h2>
      {sub && <p className="mt-3 text-slate-500 text-sm leading-relaxed">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function APropos() {
  return (
    <div className="min-h-screen bg-[#F8F5EE]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="bg-[#0C1A35] text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5">
              Qui sommes-nous ?
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              La plateforme immobilière{" "}
              <span className="text-[#D4A843]">de référence</span>{" "}
              au Sénégal
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Seek connecte propriétaires et locataires dans un environnement sécurisé,
              transparent et 100 % numérique — conçu spécifiquement pour le marché sénégalais.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/annonces">
                <Button className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold px-6 transition-all hover:scale-[1.03]">
                  Voir les annonces
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/proprietaires">
                <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 px-6">
                  Espace propriétaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chiffres clés ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {CHIFFRES.map(({ valeur, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#D4A843]" />
                </div>
                <div className="text-2xl font-bold text-[#0C1A35]">{valeur}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
              Notre mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0C1A35] leading-snug mb-5">
              Simplifier l'accès au logement pour tous
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              Trouver un logement au Sénégal est souvent synonyme de démarches longues,
              d'intermédiaires peu fiables et de contrats flous. Seek a été créé pour changer ça.
            </p>
            <p className="text-slate-500 leading-relaxed mb-6">
              Notre plateforme donne aux propriétaires les outils pour gérer leurs biens
              sérieusement, et aux locataires la visibilité pour choisir en toute confiance.
            </p>
            <div className="space-y-3">
              {[
                "Annonces vérifiées avec visuels authentiques",
                "Baux numériques signés et archivés",
                "Paiements de loyer tracés et quittançables",
                "États des lieux dématérialisés",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-[#D4A843] flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 col-span-2">
              <div className="w-9 h-9 rounded-xl bg-[#0C1A35] flex items-center justify-center mb-4">
                <Target className="w-4 h-4 text-[#D4A843]" />
              </div>
              <h3 className="font-semibold text-[#0C1A35] mb-2">Notre vision</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Devenir la référence de l'immobilier numérique en Afrique de l'Ouest,
                en plaçant la confiance et la transparence au cœur de chaque transaction.
              </p>
            </div>
            <div className="bg-[#0C1A35] rounded-2xl p-6 text-white">
              <Building2 className="w-7 h-7 text-[#D4A843] mb-4" />
              <div className="text-2xl font-bold mb-1">Dakar</div>
              <div className="text-xs text-white/50">Siège social</div>
            </div>
            <div className="bg-[#D4A843] rounded-2xl p-6">
              <Star className="w-7 h-7 text-[#0C1A35] mb-4" />
              <div className="text-2xl font-bold text-[#0C1A35] mb-1">2024</div>
              <div className="text-xs text-[#0C1A35]/60">Fondée au Sénégal</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Valeurs ──────────────────────────────────────────────── */}
      <div className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <SectionTitle
            label="Nos valeurs"
            title="Ce qui guide chacune de nos décisions"
            sub="Quatre principes fondateurs qui orientent notre façon de construire Seek."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALEURS.map(({ icon: Icon, titre, texte }) => (
              <div key={titre} className="bg-[#F8F5EE] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#0C1A35] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#D4A843]" />
                </div>
                <h3 className="font-semibold text-[#0C1A35] mb-2">{titre}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Équipe ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <SectionTitle
          label="L'équipe"
          title="Des gens passionnés derrière la plateforme"
          sub="Seek est porté par une équipe pluridisciplinaire engagée pour un immobilier plus juste au Sénégal."
        />
        <div className="grid sm:grid-cols-3 gap-5">
          {EQUIPE.map(({ nom, role, description, color }) => (
            <div key={nom} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className={`${color} px-6 py-8 flex items-center justify-center`}>
                <Users className="w-10 h-10 text-white/70" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-[#0C1A35]">{nom}</h3>
                <p className="text-xs text-[#D4A843] font-medium mt-0.5 mb-2">{role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Conformité ───────────────────────────────────────────── */}
      <div className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-[#0C1A35] mb-1">
                Conformité légale au Sénégal
              </h3>
              <p className="text-sm text-slate-500">
                Seek respecte la <strong className="text-slate-700">Loi n° 2008-12</strong> sur
                la protection des données personnelles et opère sous le contrôle de la{" "}
                <strong className="text-slate-700">Commission de Protection des Données Personnelles (CDP)</strong>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Link to="/politique-confidentialite">
                <Button variant="outline" size="sm" className="text-xs">
                  Politique de confidentialité
                </Button>
              </Link>
              <Link to="/conformite-donnees">
                <Button variant="outline" size="sm" className="text-xs">
                  Conformité données
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact / CTA ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="bg-[#0C1A35] rounded-3xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Une question ? Contactez-nous</h2>
          <p className="text-white/55 text-sm mb-8 max-w-md mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions sur la plateforme,
            la sécurité ou vos données.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-white/60">
            <a href="mailto:contact@seek.sn" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-[#D4A843]" />
              contact@seek.sn
            </a>
            <span className="w-px h-4 bg-white/15 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#D4A843]" />
              +221 77 000 00 00
            </span>
            <span className="w-px h-4 bg-white/15 hidden sm:block" />
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4A843]" />
              Dakar, Sénégal
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/annonces">
              <Button className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-semibold px-6 transition-all hover:scale-[1.03]">
                Explorer les annonces
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/proprietaires">
              <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 px-6">
                Publier une annonce
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
