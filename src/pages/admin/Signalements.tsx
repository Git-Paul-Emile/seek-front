import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  Flag, Eye, Loader2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useBiensSignales } from "@/hooks/useSignalement";
import type { PrioriteSignalement, BienSignale } from "@/api/signalement";

const MOTIF_LABELS: Record<string, string> = {
  ARNAQUE_SUSPECTEE:     "Arnaque suspectée",
  PHOTOS_NON_CONFORMES:  "Photos non conformes",
  LOGEMENT_INSALUBRE:    "Logement insalubre",
  INFORMATIONS_ERRONEES: "Informations erronées",
  PRIX_INCORRECT:        "Prix incorrect",
  DOUBLON:               "Doublon",
  AUTRE:                 "Autre",
};

export default function AdminSignalements() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [priorite, setPriorite] = useState<PrioriteSignalement | "">("");

  const { data, isLoading, isError, refetch } = useBiensSignales({
    page,
    limit: 20,
    priorite: priorite || undefined,
  });

  const items: BienSignale[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Signalements" }]} />

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <Flag className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0C1A35]">Signalements</h1>
            <p className="text-sm text-slate-500">{total} annonce{total > 1 ? "s" : ""} signalée{total > 1 ? "s" : ""} en attente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtre priorité */}
          <select
            value={priorite}
            onChange={(e) => { setPriorite(e.target.value as any); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#D4A843]/40"
          >
            <option value="">Toutes priorités</option>
            <option value="HAUTE">Haute priorité</option>
            <option value="BASSE">Basse priorité</option>
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center py-20 gap-3 text-slate-500">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <p>Erreur lors du chargement.</p>
          <button onClick={() => refetch()} className="text-sm text-[#D4A843] hover:underline">Réessayer</button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-slate-500">
          <Flag className="w-8 h-8 text-slate-300" />
          <p className="font-medium">Aucun signalement en attente</p>
          <p className="text-sm">La plateforme est propre !</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Annonce</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Propriétaire</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Signalements</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Dernier motif</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Priorité</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((bien) => (
                <tr
                  key={bien.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/signalements/${bien.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0C1A35] truncate max-w-[180px]">
                      {bien.titre ?? "Sans titre"}
                    </p>
                    <p className="text-xs text-slate-400">{bien.ville}{bien.quartier ? ` · ${bien.quartier}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0C1A35]">
                      {bien.proprietaire.prenom} {bien.proprietaire.nom}
                    </p>
                    {bien.proprietaire.nbAvertissements > 0 && (
                      <p className="text-xs text-orange-500 font-medium">
                        {bien.proprietaire.nbAvertissements} avertissement{bien.proprietaire.nbAvertissements > 1 ? "s" : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                      {bien.reportCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-600">
                      {bien.dernierMotif ? MOTIF_LABELS[bien.dernierMotif] ?? bien.dernierMotif : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        bien.priorite === "HAUTE"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bien.priorite === "HAUTE" ? "🔴 Haute" : "🟡 Basse"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/signalements/${bien.id}`); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
