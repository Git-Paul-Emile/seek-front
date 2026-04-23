import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPageLegaleBySlug } from "@/api/pageLegale";
import { Shield, ScrollText, Lock, Calendar, ExternalLink } from "lucide-react";

const SLUG_BY_PATH: Record<string, string> = {
  "/politique-confidentialite": "politique-confidentialite",
  "/conditions-utilisation": "conditions-utilisation",
  "/conformite-donnees": "conformite-donnees",
};

const PAGE_ICON: Record<string, React.ElementType> = {
  "politique-confidentialite": Lock,
  "conditions-utilisation": ScrollText,
  "conformite-donnees": Shield,
};

const PAGE_ACCENT: Record<string, string> = {
  "politique-confidentialite": "bg-blue-600",
  "conditions-utilisation": "bg-amber-500",
  "conformite-donnees": "bg-green-600",
};

export default function PageLegale() {
  const location = useLocation();
  const slug = SLUG_BY_PATH[location.pathname] ?? "";

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ["page-legale", slug],
    queryFn: () => fetchPageLegaleBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const Icon = PAGE_ICON[slug] ?? Shield;
  const accent = PAGE_ACCENT[slug] ?? "bg-[#D4A843]";

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Page introuvable
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE]">
      {/* Header */}
      <div className="bg-[#0C1A35] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
          <div className={`w-12 h-12 rounded-2xl ${accent} flex items-center justify-center mb-6`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {isLoading ? (
            <div className="h-9 w-64 bg-white/10 rounded-xl animate-pulse" />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {page?.titre ?? "Page légale"}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/50">
            {page?.version && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Version {page.version}
              </span>
            )}
            {page?.updatedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Mise à jour le{" "}
                {new Date(page.updatedAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-4 bg-slate-200 rounded ${i % 3 === 0 ? "w-1/3" : "w-full"}`} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Impossible de charger cette page.</p>
          </div>
        ) : page && !page.publie ? (
          <div className="text-center py-20 text-slate-400">
            <p>Cette page n'est pas encore disponible.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-10">
            <div
              className="prose prose-slate max-w-none
                prose-h2:text-[#0C1A35] prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3
                prose-h3:text-[#0C1A35] prose-h3:text-base prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-2.5
                prose-ul:text-slate-600 prose-ul:my-2.5 prose-li:my-1
                prose-a:text-[#D4A843] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#0C1A35]
                prose-table:w-full prose-table:text-sm
                prose-th:bg-[#0C1A35] prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left
                prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-slate-100
                prose-tr:even:bg-slate-50
                [&_h2:not(:first-child)]:mt-9
                [&_h2:not(:first-child)]:pt-7
                [&_h2:not(:first-child)]:border-t
                [&_h2:not(:first-child)]:border-slate-100
                [&_h2:first-child]:mt-0"
              dangerouslySetInnerHTML={{ __html: page?.contenu ?? "" }}
            />
          </div>
        )}

        {/* Footer CTA */}
        {!isLoading && !isError && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 text-sm text-slate-500">
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>
                Conforme à la{" "}
                <strong className="text-slate-700">Loi n° 2008-12</strong> sur la protection des données
                personnelles au Sénégal.
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <a
                href="https://cdp.sn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                cdp.sn
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
