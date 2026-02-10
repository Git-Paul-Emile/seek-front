import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { propertyTypes, typeLabels, cities } from "@/data/properties";

export interface SearchFiltersState {
  type: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  compact?: boolean;
}

const SearchFilters = ({ filters, onChange, compact }: SearchFiltersProps) => {
  const [expanded, setExpanded] = useState(!compact);

  const update = (key: keyof SearchFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onChange({ type: "", city: "", minPrice: "", maxPrice: "", sortBy: "" });
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={filters.type} onValueChange={(v) => update("type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Type de bien" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((t) => (
                <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.city} onValueChange={(v) => update("city", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Prix min (FCFA)"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Prix max (FCFA)"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />

          <Select value={filters.sortBy} onValueChange={(v) => update("sortBy", v)}>
            <SelectTrigger>
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
