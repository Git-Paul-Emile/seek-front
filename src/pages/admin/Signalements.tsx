import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Flag, Search, Eye, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useSignalementsAdmin } from "@/hooks/useSignalement";

const TYPE_LABELS: Record<string, string> = {
  ANNONCE: "Annonce",
  PROPRIETAIRE: "Propriétaire",
  LOCATAIRE: "Locataire",
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TRAITE: "Traité",
  REJETE: "Rejeté",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  EN_COURS: "bg-blue-100 text-blue-700",
  TRAITE: "bg-green-100 text-green-700",
  REJETE: "bg-slate-100 text-slate-500",
};

export default function Signalements() {
  const navigate = useNavigate();
  const [statutFilter, setStatutFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSignalementsAdmin({
    statut: statutFilter || undefined,
    type: typeFilter || undefined,
    page,
    limit: 20,
  });

  const signalements = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Signalements" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1A35]">Signalements</h1>
          <p className="text-sm text-slate-500 mt-0.5">Modération des signalements utilisateurs</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les types</option>
          <option value="ANNONCE">Annonce</option>
          <option value="PROPRIETAIRE">Propriétaire</option>
          <option value="LOCATAIRE">Locataire</option>
        </select>

        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="EN_COURS">En cours</option>
          <option value="TRAITE">Traité</option>
          <option value="REJETE">Rejeté</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
          </div>
        ) : signalements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Flag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Aucun signalement trouvé</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Motif</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Signalé par</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {signalements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
                      <Flag className="w-3 h-3" />
                      {TYPE_LABELS[s.type] ?? s.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium max-w-xs truncate">{s.motif}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{s.signalePar}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[s.statut] ?? ""}`}>
                      {STATUT_LABELS[s.statut] ?? s.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/admin/signalements/${s.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                        text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {pagination.total} signalement{pagination.total !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
