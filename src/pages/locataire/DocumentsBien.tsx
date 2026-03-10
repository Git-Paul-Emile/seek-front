import { Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, Download, FolderOpen } from "lucide-react";
import { getLocataireDocumentsBienApi, type DocumentBienLocataire } from "@/api/locataireAuth";
import { SkListItems } from "@/components/ui/Skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  ACTE_PROPRIETE:   "Acte de propriété",
  PLAN_CADASTRAL:   "Plan cadastral",
  PERMIS_CONSTRUIRE:"Permis de construire",
  AUTRE:            "Autre document",
};

const fmtTaille = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function DocRow({ doc }: { doc: DocumentBienLocataire }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-[#D4A843]/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-[#D4A843]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0C1A35] truncate">{doc.nom}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {TYPE_LABELS[doc.type] ?? doc.type}
          {doc.taille ? ` · ${fmtTaille(doc.taille)}` : ""}
          {" · "}
          {fmtDate(doc.createdAt)}
        </p>
      </div>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
          text-slate-500 hover:bg-[#D4A843] hover:text-white hover:border-[#D4A843] transition-all"
        title="Télécharger"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DocumentsBien() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["locataire-documents-bien"],
    queryFn: getLocataireDocumentsBienApi,
  });

  return (
    <div className="space-y-5 max-w-2xl">
      <Breadcrumb items={[{ label: "Mon espace", to: "/locataire/dashboard" }, { label: "Documents" }]} />
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          to="/locataire/dashboard"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
            text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-0.5">
            <FileText className="w-3.5 h-3.5" />
            Mon logement
          </div>
          <h1 className="font-display text-xl font-bold text-[#0C1A35]">Documents du bien</h1>
        </div>
      </div>

      {isLoading && (
        <SkListItems items={4} itemHeight="h-20" />
      )}

      {!isLoading && (!documents || documents.length === 0) && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm font-medium">Aucun document disponible</p>
          <p className="text-slate-400 text-xs mt-1">
            Votre propriétaire n'a pas encore partagé de documents.
          </p>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{documents.length} document{documents.length > 1 ? "s" : ""} partagé{documents.length > 1 ? "s" : ""}</p>
          {documents.map((doc) => (
            <DocRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-4">
        <p className="text-xs text-slate-600">
          Ces documents sont partagés par votre propriétaire. Pour tout document supplémentaire,
          contactez-le directement.
        </p>
      </div>
    </div>
  );
}
