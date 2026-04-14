import { X, GitCompareArrows } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/context/ComparisonContext";

export default function ComparisonBar() {
  const { items, remove, clear } = useComparison();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const handleCompare = () => {
    const ids = items.map((b) => b.id).join(",");
    navigate(`/comparaison?ids=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        className="pointer-events-auto bg-[#0C1A35] text-white rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 max-w-2xl w-full"
        style={{ backdropFilter: "blur(12px)" }}
      >
        {/* Miniatures */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {items.map((bien) => (
            <div key={bien.id} className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-white/20">
                <img
                  src={bien.photos?.[0] ?? "/placeholder.svg"}
                  alt={bien.titre ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => remove(bien.id)}
                className="absolute -top-1.5 -right-1.5 !w-4 !h-4 !min-h-0 !p-0 !rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                title="Retirer"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}

          {/* Slots vides — masqués sur mobile */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="hidden sm:flex w-12 h-12 rounded-xl border-2 border-dashed border-white/20 items-center justify-center text-white/30 text-xs flex-shrink-0"
            >
              +
            </div>
          ))}
        </div>

        {/* Texte — masqué sur mobile */}
        <div className="hidden sm:block flex-1 min-w-0 ml-1">
          <p className="text-sm font-semibold truncate">
            {items.length} bien{items.length > 1 ? "s" : ""} sélectionné{items.length > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-white/50">
            {items.length < 2 ? "Ajoutez au moins 2 biens" : "Prêt à comparer"}
          </p>
        </div>

        {/* Spacer sur mobile */}
        <div className="flex-1 sm:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={clear}
            className="text-xs text-white/50 hover:text-white/80 transition-colors px-2 py-1 hidden sm:block"
          >
            Tout effacer
          </button>
          <button
            onClick={handleCompare}
            disabled={items.length < 2}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#D4A843] hover:bg-[#C49830] disabled:opacity-40 disabled:cursor-not-allowed text-[#0C1A35] font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            <GitCompareArrows className="w-4 h-4" />
            Comparer ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
}
