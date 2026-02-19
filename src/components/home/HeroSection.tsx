import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown, Navigation, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroBg from "@/assets/hero-bg.jpg";
import { PROPERTY_TYPES, STATS, TRAVEL_TIMES } from "@/data/home";

const HeroSection = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [preciseAddress, setPreciseAddress] = useState("");
  const [searchRadius, setSearchRadius] = useState("");

  const formatBudget = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-16 overflow-hidden">
      <img
        src={heroBg}
        alt="Architecture moderne à Dakar"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1A35] via-[#0C1A35]/68 to-[#0C1A35]/15" />

      <div className="relative z-10 container mx-auto px-4 pt-24">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.1] max-w-3xl">
          Trouvez votre<br />
          <span className="text-[#D4A843]">propriété idéale</span><br />
          au Sénégal
        </h1>

        <p className="text-white/60 text-xl mb-10 max-w-2xl leading-relaxed">
          Appartements, villas, studios ou espaces commerciaux, explorez des
          milliers d'annonces à Dakar et partout au Sénégal.
        </p>

        {/* Search bar */}
        <div className="max-w-3xl bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <label className="text-white/50 text-xs font-medium block mb-1.5 ml-0.5">Quartier</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none z-10" />
                <Input
                  type="text"
                  placeholder="Almadies, Point E…"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-9 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium block mb-1.5 ml-0.5">Type de logement</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/50 text-xs font-medium block mb-1.5 ml-0.5">Budget</label>
              <Input
                type="text"
                placeholder="Max FCFA"
                value={budget}
                onChange={(e) => setBudget(formatBudget(e.target.value))}
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all"
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button
                type="submit"
                className="h-11 w-full bg-[#D4A843] hover:bg-[#C09535] text-white font-semibold shadow-lg shadow-[#D4A843]/20 transition-all hover:scale-[1.02]"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>

          {/* Advanced search */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center gap-1.5 text-white/45 hover:text-white/75 text-xs transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Recherche par point précis
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`} />
            </button>

            {advancedOpen && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5 ml-0.5">
                    Lieu précis
                    <div className="relative group/info">
                      <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-default transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0C1A35] border border-white/10 text-white/80 text-xs px-3 py-2 rounded-xl leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-30">
                        La recherche à partir d'un point permet de trouver des biens immobiliers situés à proximité d'un lieu précis, plutôt que simplement dans un quartier.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Ex : Avenue Bourguiba, Dakar"
                      value={preciseAddress}
                      onChange={(e) => setPreciseAddress(e.target.value)}
                      className="pl-9 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/35 focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5 ml-0.5">
                    Temps de trajet
                    <div className="relative group/traj">
                      <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/60 cursor-default transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0C1A35] border border-white/10 text-white/80 text-xs px-3 py-2 rounded-xl leading-relaxed opacity-0 group-hover/traj:opacity-100 transition-opacity pointer-events-none z-30">
                        Le temps de trajet indique combien de minutes il faudra pour rejoindre un lieu précis depuis un logement.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0C1A35]" />
                      </div>
                    </div>
                  </label>
                  <Select value={searchRadius} onValueChange={setSearchRadius}>
                    <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm">
                      <SelectValue placeholder="Choisir un temps" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_TIMES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/40 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
