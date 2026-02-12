import { useState, useMemo } from "react";
import { mockProperties } from "@/data/properties";
import PropertyCard from "@/components/properties/PropertyCard";
import SearchFilters, { SearchFiltersState } from "@/components/properties/SearchFilters";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyAlertForm from "@/components/property-alerts/PropertyAlertForm";

const ITEMS_PER_PAGE = 9;

const Properties = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFiltersState>({
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

  const filtered = useMemo(() => {
    let result = [...mockProperties];

    // Filter by availability (for guests: only show available properties)
    result = result.filter((p) => p.status === "libre");

    // Filter by city
    if (filters.city && filters.city !== "all") {
      result = result.filter((p) => p.location.city === filters.city);
    }

    // Filter by neighborhood
    if (filters.neighborhood && filters.neighborhood !== "all") {
      result = result.filter((p) => 
        p.location.address.includes(filters.neighborhood) ||
        p.location.address.toLowerCase().includes(filters.neighborhood.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.minPrice) {
      result = result.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((p) => p.price <= Number(filters.maxPrice));
    }

    // Filter by category (logement entier vs chambre)
    if (filters.category && filters.category !== "all") {
      if (filters.category === "logement_entier") {
        // Logement entier: propriétés qui ne sont pas en colocation
        result = result.filter((p) => p.rentalMode !== "colocation");
      } else if (filters.category === "chambre") {
        // Chambre: propriétés en colocation
        result = result.filter((p) => p.rentalMode === "colocation");
      }
    }

    // Filter by number of bedrooms
    if (filters.bedrooms && filters.bedrooms !== "all") {
      if (filters.bedrooms === "4") {
        result = result.filter((p) => p.bedrooms >= 4);
      } else {
        result = result.filter((p) => p.bedrooms === Number(filters.bedrooms));
      }
    }

    // Filter by furnished status
    if (filters.furnished && filters.furnished !== "tous") {
      if (filters.furnished === "meublé") {
        result = result.filter((p) => p.furnished === true);
      } else if (filters.furnished === "non_meublé") {
        result = result.filter((p) => p.furnished !== true);
      }
    }

    // Filter by availability
    if (filters.availability && filters.availability !== "tous") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.availability === "immediate") {
        // Disponible immédiatement: pas de date de disponibilité future
        result = result.filter((p) => {
          if (!p.availableFrom) return true;
          const availableDate = new Date(p.availableFrom);
          return availableDate <= today;
        });
      } else if (filters.availability === "future") {
        // Date future: date de disponibilité spécifiée
        if (filters.availableFrom) {
          const fromDate = new Date(filters.availableFrom);
          result = result.filter((p) => {
            if (!p.availableFrom) return false;
            const availableDate = new Date(p.availableFrom);
            return availableDate >= fromDate;
          });
        } else {
          // Si pas de date spécifiée, montrer tous ceux avec une date future
          result = result.filter((p) => {
            if (!p.availableFrom) return false;
            const availableDate = new Date(p.availableFrom);
            return availableDate > today;
          });
        }
      }
    }

    // Sort results
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

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProperties = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Search className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider font-body">Explorer</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Toutes les annonces</h1>
            <p className="text-muted-foreground mt-2">
              {filtered.length} bien{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
          <PropertyAlertForm />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map((property, i) => (
                <PropertyCard key={property.id} property={property} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-10 h-10 p-0"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
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
