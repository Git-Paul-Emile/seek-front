import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationState } from "@/hooks/usePagination";

interface Props extends PaginationState {
  total:    number;
  pageSize: number;
}

export default function Pagination({ page, totalPages, pageWindow, total, pageSize, goTo, goNext, goPrev }: Props) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const btnBase = "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all";

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
      <p className="text-xs text-slate-400">
        {from}–{to} sur {total}
      </p>

      <div className="flex items-center gap-0.5">
        {/* Précédent */}
        <button
          onClick={goPrev}
          disabled={page === 1}
          className={`${btnBase} text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de page (fenêtre de 5) */}
        {pageWindow.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`${btnBase} ${
              p === page
                ? "bg-[#0C1A35] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Suivant */}
        <button
          onClick={goNext}
          disabled={page === totalPages}
          className={`${btnBase} text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
