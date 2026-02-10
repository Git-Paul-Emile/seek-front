import { useState, useMemo } from "react";
import { mockProperties } from "@/data/properties";
import PropertyCard from "@/components/properties/PropertyCard";
import SearchFilters, { SearchFiltersState } from "@/components/properties/SearchFilters";
import { Search } from "lucide-react";

const Properties = () => {
  const [filters, setFilters] = useState<SearchFiltersState>({
    type: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "",
  });

  const filtered = useMemo(() => {
    let result = [...mockProperties];

    if (filters.type) result = result.filter((p) => p.type === filters.type);
    if (filters.city) result = result.filter((p) => p.location.city === filters.city);
    if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice));

    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "date-desc":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Search className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider font-body">Explorer</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Toutes les annonces</h1>
          <p className="text-muted-foreground mt-2">
            {filtered.length} bien{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
