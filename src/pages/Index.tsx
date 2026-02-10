import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Shield, Star, TrendingUp, Home, Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { mockProperties, typeLabels } from "@/data/properties";
import PropertyCard from "@/components/properties/PropertyCard";
import heroBg from "@/assets/hero-bg.jpg";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const features = [
  { icon: Search, title: "Recherche Intelligente", desc: "Trouvez le bien idéal grâce à nos filtres avancés par type, lieu et budget." },
  { icon: Shield, title: "Annonces Vérifiées", desc: "Chaque propriété est validée pour garantir votre tranquillité." },
  { icon: TrendingUp, title: "Estimation Précise", desc: "Des prix du marché fiables pour des décisions éclairées." },
];

const Index = () => {
  const [searchParams] = useSearchParams();
  const featuredProperties = mockProperties.filter((p) => p.featured);
  const [isHovered, setIsHovered] = useState(false);

  // Tracking du canal d'acquisition
  useEffect(() => {
    const channel = searchParams.get("source");
    if (channel) {
      // Stocker le canal d'acquisition dans le localStorage pour suivi
      localStorage.setItem("acquisition_channel", channel);
      console.log(`Canal d'acquisition détecté: ${channel}`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Architecture moderne"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-secondary/90" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-secondary-foreground mb-6 leading-tight">
              Trouvez le bien
              <br />
              <span className="text-primary">qui vous ressemble</span>
            </h1>
            <p className="text-secondary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body">
              Parcourez des centaines d'annonces immobilières vérifiées. Achetez, louez ou vendez en toute confiance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/annonces">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Search className="w-4 h-4" />
                  Explorer les annonces
                </Button>
              </Link>
              <Link to="/owner/register">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 text-base px-8 border-secondary-foreground/30 text-secondary-foreground bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-all duration-300"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Home className="w-4 h-4" />
                  Publier mon bien gratuitement
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-8 rounded-lg bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Sélection</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Annonces en vedette</h2>
            </div>
            <Link to="/annonces" className="hidden md:block">
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/annonces">
              <Button variant="outline" className="gap-2">
                Voir toutes les annonces <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Vous êtes propriétaire ?
          </h2>
          <p className="text-secondary-foreground/60 max-w-xl mx-auto mb-8">
            Publiez votre bien gratuitement et touchez des milliers d'acheteurs et locataires potentiels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/owner/register?source=CTA_HOMEPAGE">
              <Button size="lg" className="gap-2 px-8 min-w-[250px]">
                <Building2 className="w-4 h-4" />
                Créer mon espace propriétaire
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/owner/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 border-secondary-foreground/30 text-secondary-foreground bg-transparent min-w-[200px]"
              >
                Déjà propriétaire ?
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
