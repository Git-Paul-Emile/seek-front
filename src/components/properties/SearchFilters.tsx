import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cities, getNeighborhoodsForCity, propertyCategoryLabels, furnishedLabels, availabilityLabels } from "@/data/properties";

export interface SearchFiltersState {
  // Localisation
  city: string;
  neighborhood: string;
  // Budget
  minPrice: string;
  maxPrice: string;
  // Type de bien
  category: string; // logement_entier | chambre | all
  bedrooms: string; // nombre de chambres
  // État
  furnished: string; // meublé | non_meublé | all
  // Disponibilité
  availability: string; // immediate | future | all
  availableFrom: string;
  // Tri
  sortBy: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  compact?: boolean;
}

const SearchFilters = ({ filters, onChange, compact }: SearchFiltersProps) => {
  const [expanded, setExpanded] = useState(!compact);

  const neighborhoods = useMemo(() => {
    return getNeighborhoodsForCity(filters.city);
  }, [filters.city]);

  const update = (key: keyof SearchFiltersState, value: string | boolean | number) => {
    onChange({ ...filters, [key]: value });
  };

  const updateCity = (value: string) => {
    onChange({ ...filters, city: value, neighborhood: "all" });
  };

  const reset = () => {
    onChange({
      city: "all",
      neighborhood: "all",
      minPrice: "",
      maxPrice: "",
      category: "all",
      bedrooms: "all",
      furnished: "tous",
      availability: "tous",
      availableFrom: "",
      sortBy: "date-desc",
    });
  };

  const hasFilters = Object.values(filters).some(
    (v) =>
      v !== "" &&
      v !== "all" &&
      v !== "tous" &&
      v !== "date-desc"
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {compact && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground w-full"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres de recherche
          {hasFilters && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-auto">
              Actifs
            </span>
          )}
        </button>
      )}

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ville */}
          <Select value={filters.city} onValueChange={updateCity}>
            <SelectTrigger>
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quartier */}
          <Select 
            value={filters.neighborhood} 
            onValueChange={(v) => update("neighborhood", v)}
            disabled={!filters.city || filters.city === "all" || neighborhoods.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quartier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les quartiers</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Budget Min */}
          <Input
            type="number"
            placeholder="Prix min (FCFA)"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />

          {/* Budget Max */}
          <Input
            type="number"
            placeholder="Prix max (FCFA)"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>
      )}

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Type de bien */}
          <Select value={filters.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Type de bien" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="logement_entier">{propertyCategoryLabels.logement_entier}</SelectItem>
              <SelectItem value="chambre">{propertyCategoryLabels.chambre}</SelectItem>
            </SelectContent>
          </Select>

          {/* Nombre de chambres */}
          <Select value={filters.bedrooms} onValueChange={(v) => update("bedrooms", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Nombre de chambres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="1">1 chambre</SelectItem>
              <SelectItem value="2">2 chambres</SelectItem>
              <SelectItem value="3">3 chambres</SelectItem>
              <SelectItem value="4">4+ chambres</SelectItem>
            </SelectContent>
          </Select>

          {/* Meublé / Non meublé */}
          <Select value={filters.furnished} onValueChange={(v) => update("furnished", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Meublé / Non meublé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">{furnishedLabels.tous}</SelectItem>
              <SelectItem value="meublé">{furnishedLabels.meublé}</SelectItem>
              <SelectItem value="non_meublé">{furnishedLabels.non_meublé}</SelectItem>
            </SelectContent>
          </Select>

          {/* Disponibilité */}
          <Select value={filters.availability} onValueChange={(v) => update("availability", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">{availabilityLabels.tous}</SelectItem>
              <SelectItem value="immediate">{availabilityLabels.immediate}</SelectItem>
              <SelectItem value="future">{availabilityLabels.future}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date de disponibilité (si future) */}
      {expanded && filters.availability === "future" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="date"
            placeholder="Date de disponibilité"
            value={filters.availableFrom}
            onChange={(e) => update("availableFrom", e.target.value)}
          />
        </div>
      )}

      {/* Tri */}
      {expanded && (
        <div className="flex items-center gap-2 pt-2">
          <Select value={filters.sortBy} onValueChange={(v) => update("sortBy", v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="date-desc">Plus récent</SelectItem>
              <SelectItem value="date-asc">Plus ancien</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {expanded && hasFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
