import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, TrendingDown, AlertTriangle } from "lucide-react";
import { useFavoris } from "@/hooks/useFavoris";
import { useFavorisList, useRemoveFavori, useSyncSnapshot } from "@/hooks/useFavorisList";
import type { FavoriItem } from "@/api/favori";
import PropertyCard from "@/components/PropertyCard";
import ScrollToTop from "@/components/ui/ScrollToTop";
import FavorisAuthModal from "@/components/FavorisAuthModal";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("fr-SN", { style: "currency", currency: "XOF" }).format(p);

// ─── Carte favori avec détection de changements ────────────────────────────────

function FavoriCard({ item }: { item: FavoriItem }) {
  const removeMutation = useRemoveFavori();
  const syncMutation = useSyncSnapshot();
  const { changements, bien } = item;
  const isUnavailable = changements.bienSuppr;
  const hasChanges = changements.prixChange || changements.statutChange;

  return (
    <div className="relative flex flex-col gap-0 h-full">
      {hasChanges && (
        <div className="rounded-t-2xl px-3 py-2 text-xs font-medium flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 border-b-0">
          {changements.prixChange ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />
              Prix modifié
              {changements.nouveauPrix !== null && (
                <span className="text-green-700 font-semibold">{formatPrice(changements.nouveauPrix)}</span>
              )}
              <button
                onClick={() => syncMutation.mutate(item.bienId)}
                className="ml-auto text-amber-600 hover:underline whitespace-nowrap"
              >
                Marquer comme vu
              </button>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Statut modifié : {changements.nouveauStatut}
              <button
                onClick={() => syncMutation.mutate(item.bienId)}
                className="ml-auto hover:underline whitespace-nowrap"
              >
                Marquer comme vu
              </button>
            </>
          )}
        </div>
      )}

      {/* Carte - grisée + overlay hover si indisponible */}
      <div className={`relative group ${hasChanges ? "ring-2 ring-amber-300 rounded-b-2xl" : ""}`}>
        <div className={isUnavailable ? "grayscale opacity-50 pointer-events-none select-none" : ""}>
          <PropertyCard property={bien} isApiData />
        </div>
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900/30 rounded-2xl">
            <span className="text-white text-sm font-semibold text-center px-4 leading-snug">
              Annonce retirée ou non disponible
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => removeMutation.mutate(item.bienId)}
        title="Retirer des favoris"
        className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 border border-slate-200 flex items-center justify-center shadow-sm transition-colors"
      >
        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FavorisPage() {
  const { count, isAuthenticated, idsLoaded } = useFavoris();
  const { data: apiFavoris, isLoading } = useFavorisList();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const displayCount = apiFavoris?.length ?? count;
  const hasChanges = apiFavoris?.some(
    (f) => f.changements.prixChange || f.changements.statutChange || f.changements.bienSuppr
  );

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      <ScrollToTop />

      {/* ── Bandeau header ── */}
      <div className="bg-[#0C1A35]">
        <div className="container mx-auto px-8 py-7">
          <p className="text-[#D4A843] font-bold text-xs uppercase tracking-wider mb-1">Mon espace</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Mes favoris
            {hasChanges && (
              <span className="text-xs bg-amber-500 text-white rounded-full px-2.5 py-0.5 font-semibold">
                Mises à jour
              </span>
            )}
          </h1>
          {isAuthenticated && (
            <p className="text-white/50 text-sm mt-1">
              {displayCount === 0 ? (
                "Aucun bien sauvegardé"
              ) : (
                <>
                  <span className="text-[#D4A843] font-semibold">{displayCount}</span>
                  {" "}bien{displayCount > 1 ? "s" : ""} sauvegardé{displayCount > 1 ? "s" : ""}
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container mx-auto px-8 py-10">

        {/* Non connecté */}
        {idsLoaded && !isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-lg font-bold text-[#1A2942] mb-2">
              Connectez-vous pour voir vos favoris
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mb-7">
              Créez un compte ou connectez-vous pour sauvegarder des annonces et suivre leur évolution.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Créer un compte / Se connecter
            </button>
            {showAuthModal && <FavorisAuthModal onClose={() => setShowAuthModal(false)} />}
          </div>
        )}

        {/* Empty state (connecté, aucun favori) */}
        {isAuthenticated && !isLoading && displayCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-lg font-bold text-[#1A2942] mb-2">
              Aucun favori pour l'instant
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mb-7">
              Cliquez sur le cœur d'une annonce pour la sauvegarder ici.
            </p>
            <Link
              to="/annonces"
              className="bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Parcourir les annonces
            </Link>
          </div>
        )}

        {/* Grille */}
        {isAuthenticated && apiFavoris && apiFavoris.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {apiFavoris.map((item) => (
              <FavoriCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Loading */}
        {isAuthenticated && isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
