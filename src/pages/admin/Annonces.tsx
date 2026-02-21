import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileSearch,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAnnoncesAdmin, useValiderAnnonce, useAnnoncesStatusCounts } from "@/hooks/useAnnonces";
import type { Bien, StatutAnnonce } from "@/api/bien";

// ─── Constantes ───────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: StatutAnnonce | "TOUS" }[] = [
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Publiés", value: "PUBLIE" },
  { label: "Rejetés", value: "REJETE" },
  { label: "Tous", value: "TOUS" },
];

const LIMIT = 15;

// ─── Modal de rejet ───────────────────────────────────────────────────────────

function RejetModal({
  bien,
  isPending,
  onConfirm,
  onCancel,
}: {
  bien: Bien;
  isPending: boolean;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0C1A35]/60 backdrop-blur-sm"
        onClick={!isPending ? onCancel : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-[#0C1A35]">
          Rejeter l'annonce
        </h2>
        <p className="text-sm text-slate-500">
          <span className="font-medium text-[#0C1A35]">
            {bien.titre || "Sans titre"}
          </span>{" "}
          — Indiquez le motif de rejet qui sera transmis au propriétaire.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Motif de rejet (obligatoire)…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm
            outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/30 transition resize-none"
        />
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isPending || !note.trim()}
            className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm
              font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ligne du tableau ──────────────────────────────────────────────────────────

function AnnonceRow({
  bien,
  onApprouver,
  onRejeter,
  actionId,
}: {
  bien: Bien;
  onApprouver: (id: string) => void;
  onRejeter: (bien: Bien) => void;
  actionId: string | null;
}) {
  const isActing = actionId === bien.id;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      {/* Photo + titre */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {bien.photos?.[0] ? (
            <img
              src={bien.photos[0]}
              alt={bien.titre || "Bien"}
              className="w-14 h-10 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-300" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[#0C1A35] text-sm truncate">
              {bien.titre || "Sans titre"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {[bien.ville, bien.quartier].filter(Boolean).join(", ") ||
                bien.adresse ||
                "Adresse non spécifiée"}
            </p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-4 hidden md:table-cell">
        <p className="text-sm text-slate-600">{bien.typeLogement?.nom || "—"}</p>
        {bien.typeTransaction?.nom && (
          <p className="text-xs text-slate-400">{bien.typeTransaction.nom}</p>
        )}
      </td>

      {/* Propriétaire */}
      <td className="px-4 py-4 hidden lg:table-cell">
        {bien.proprietaire ? (
          <div>
            <div className="flex items-center gap-1 text-sm text-[#0C1A35]">
              <User className="w-3 h-3 text-slate-400" />
              {bien.proprietaire.prenom} {bien.proprietaire.nom}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Phone className="w-3 h-3" />
              {bien.proprietaire.telephone}
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      {/* Prix */}
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className="font-semibold text-[#0C1A35] text-sm">
          {bien.prix ? `${bien.prix.toLocaleString("fr-FR")} F` : "—"}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-4 hidden xl:table-cell">
        <span className="text-xs text-slate-400">
          {new Date(bien.updatedAt).toLocaleDateString("fr-FR")}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/annonces/${bien.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir
          </Link>
          {bien.statutAnnonce === "EN_ATTENTE" ? (
            <>
              <button
                onClick={() => onApprouver(bien.id)}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {isActing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Approuver
              </button>
              <button
                onClick={() => onRejeter(bien)}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Rejeter
              </button>
            </>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                bien.statutAnnonce === "PUBLIE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {bien.statutAnnonce === "PUBLIE" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {bien.statutAnnonce === "PUBLIE" ? "Publié" : "Rejeté"}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Annonces() {
  const [statutFilter, setStatutFilter] = useState<StatutAnnonce | "TOUS">("EN_ATTENTE");
  const [page, setPage] = useState(1);
  const [rejetTarget, setRejetTarget] = useState<Bien | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const params =
    statutFilter === "TOUS"
      ? { page, limit: LIMIT }
      : { statut: statutFilter, page, limit: LIMIT };

  const { data, isLoading } = useAnnoncesAdmin(params);
  const { data: statusCounts } = useAnnoncesStatusCounts();
  const valider = useValiderAnnonce();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleApprouver = (id: string) => {
    setActionId(id);
    valider.mutate(
      { id, action: "APPROUVER" },
      {
        onSuccess: () => {
          toast.success("Annonce approuvée et publiée");
          setActionId(null);
        },
        onError: () => {
          toast.error("Erreur lors de l'approbation");
          setActionId(null);
        },
      }
    );
  };

  const handleRejeter = (note: string) => {
    if (!rejetTarget) return;
    setActionId(rejetTarget.id);
    valider.mutate(
      { id: rejetTarget.id, action: "REJETER", note },
      {
        onSuccess: () => {
          toast.success("Annonce rejetée");
          setRejetTarget(null);
          setActionId(null);
        },
        onError: () => {
          toast.error("Erreur lors du rejet");
          setActionId(null);
        },
      }
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <FileSearch className="w-3.5 h-3.5" />
          Modération
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">Annonces</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {total} annonce{total > 1 ? "s" : ""}
          {statutFilter !== "TOUS" && ` en statut « ${FILTERS.find((f) => f.value === statutFilter)?.label} »`}
        </p>
      </div>

      {/* Filtres avec compteurs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "TOUS"
              ? (statusCounts
                  ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
                  : null)
              : (statusCounts?.[value as keyof typeof statusCounts] ?? null);
          const active = statutFilter === value;
          return (
            <button
              key={value}
              onClick={() => { setStatutFilter(value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#0C1A35] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {value === "EN_ATTENTE" && <Clock className="w-3.5 h-3.5" />}
              {value === "PUBLIE" && <CheckCircle className="w-3.5 h-3.5" />}
              {value === "REJETE" && <XCircle className="w-3.5 h-3.5" />}
              {label}
              {count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileSearch className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm">Aucune annonce pour ce filtre.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Bien
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">
                      Propriétaire
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                      Prix
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden xl:table-cell">
                      Date
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((bien) => (
                    <AnnonceRow
                      key={bien.id}
                      bien={bien}
                      onApprouver={handleApprouver}
                      onRejeter={setRejetTarget}
                      actionId={actionId}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Page {page} / {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                      hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500
                      hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal rejet */}
      {rejetTarget && (
        <RejetModal
          bien={rejetTarget}
          isPending={valider.isPending}
          onConfirm={handleRejeter}
          onCancel={() => !valider.isPending && setRejetTarget(null)}
        />
      )}
    </div>
  );
}
