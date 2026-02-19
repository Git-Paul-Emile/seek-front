import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="relative py-24 bg-[#0C1A35] overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#D4A843] opacity-[0.04] blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-500 opacity-[0.04] blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

    <div className="relative container mx-auto px-4 text-center">
      <div className="inline-flex items-center gap-2 bg-[#D4A843]/12 border border-[#D4A843]/25 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
        Gratuit pour les propriétaires
      </div>

      <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5 max-w-2xl mx-auto leading-tight">
        Vous êtes propriétaire ?
      </h2>

      <p className="text-white/50 text-xl max-w-xl mx-auto mb-10 leading-relaxed">
        Publiez votre bien sur SEEK et atteignez des milliers de locataires potentiels au Sénégal.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/owner/register">
          <Button
            size="lg"
            className="bg-[#D4A843] hover:bg-[#C09535] text-[#0C1A35] font-bold px-10 py-6 text-base shadow-2xl shadow-[#D4A843]/15 transition-all hover:scale-[1.03]"
          >
            Publier mon bien
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        <Link to="/owner/login">
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-base hover:bg-white/8 hover:border-white/40 px-10 py-6 text-base transition-all"
          >
            Déjà propriétaire ? Se connecter
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CTASection;
