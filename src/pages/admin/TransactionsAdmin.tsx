import { useState } from "react";
import { CreditCard, Search, Download, X, ChevronDown, ChevronUp } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useAdminHistoriqueTransactions, useAdminStatsTransactions } from "@/hooks/usePremium";
import { SkTableRows } from "@/components/ui/Skeleton";
import type { Transaction } from "@/api/transaction";

const TYPE_LABELS: Record<string, string> = {
  LOYER: "Loyer",
  PREMIUM: "Premium",
  CAUTION: "Caution",
};

const STATUT_COLORS: Record<string, string> = {
  CONFIRME: "bg-green-100 text-green-700",
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  ECHOUE: "bg-red-100 text-red-700",
  REMBOURSE: "bg-slate-100 text-slate-500",
};

function fmtMontant(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR");
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCsv(transactions: Transaction[]) {
  const header = ["ID", "Type", "Montant", "Mode paiement", "Référence", "Statut", "Propriétaire", "Téléphone", "Bien", "Date initiation", "Date confirmation"];
  const rows = transactions.map((t) => [
    t.id,
    TYPE_LABELS[t.type] ?? t.type,
    t.montant,
    t.modePaiement,
    t.reference ?? t.transactionId ?? "",
    t.statut,
    t.proprietaire ? `${t.proprietaire.prenom} ${t.proprietaire.nom}` : "",
    t.proprietaire?.telephone ?? "",
    t.bien?.titre ?? "",
    fmtDate(t.dateInitiation),
    t.dateConfirmation ? fmtDate(t.dateConfirmation) : "",
  ]);

  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Graphique tendance mensuelle ─────────────────────────────────────────────

function TendanceChart({ data }: { data: { label: string; montant: number; count: number }[] }) {
  const maxMontant = Math.max(...data.map((d) => d.montant), 1);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h2 className="text-sm font-semibold text-[#0C1A35] mb-4">Tendance mensuelle — 12 derniers mois</h2>
      <div className="space-y-2">
        {data.map((m) => {
          const pct = Math.round((m.montant / maxMontant) * 100);
          return (
            <div key={m.label} className="flex items-center gap-3 text-sm">
              <span className="text-xs text-slate-400 w-14 shrink-0">{m.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-[#D4A843] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium text-slate-600 w-28 text-right shrink-0">{fmtMontant(m.montant)}</span>
              <span className="text-xs text-slate-400 w-12 text-right shrink-0">{m.count} tx</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Détail transaction ───────────────────────────────────────────────────────

function DetailPanel({ t, onClose }: { t: Transaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-[#0C1A35]">Détail de la transaction</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <Row label="ID" value={t.id} mono />
          <Row label="Type" value={TYPE_LABELS[t.type] ?? t.type} />
          <Row label="Montant" value={fmtMontant(t.montant)} bold />
          <Row label="Statut">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUT_COLORS[t.statut] ?? "bg-slate-100 text-slate-500"}`}>
              {t.statut}
            </span>
          </Row>
          <Row label="Mode paiement" value={t.modePaiement} />
          {(t.reference || t.transactionId) && (
            <Row label="Référence" value={t.reference ?? t.transactionId ?? ""} mono />
          )}
          <Row label="Date initiation" value={fmtDate(t.dateInitiation)} />
          {t.dateConfirmation && <Row label="Date confirmation" value={fmtDate(t.dateConfirmation)} />}
          {t.proprietaire && (
            <Row label="Propriétaire" value={`${t.proprietaire.prenom} ${t.proprietaire.nom} · ${t.proprietaire.telephone}`} />
          )}
          {t.bien && <Row label="Bien" value={t.bien.titre} />}
          {t.locataire && (
            <Row label="Locataire" value={`${t.locataire.prenom} ${t.locataire.nom} · ${t.locataire.telephone}`} />
          )}
          {t.note && <Row label="Note" value={t.note} />}
          {t.metadata?.formuleNom && <Row label="Formule premium" value={t.metadata.formuleNom} />}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
  children,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
  bold?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-400 shrink-0">{label}</span>
      {children ?? (
        <span className={`text-right text-slate-700 break-all ${mono ? "font-mono text-xs" : ""} ${bold ? "font-semibold" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TransactionsAdmin() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detail, setDetail] = useState<Transaction | null>(null);

  const { data, isLoading } = useAdminHistoriqueTransactions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    statut: statutFilter || undefined,
    search: search || undefined,
  });
  const { data: stats } = useAdminStatsTransactions();

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Transactions" }]} />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1A35]">Transactions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Historique global des paiements</p>
        </div>
        <button
          onClick={() => transactions.length > 0 && exportCsv(transactions)}
          disabled={transactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C1A35] text-white text-sm font-medium hover:bg-[#0C1A35]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total confirmé", value: stats.totalConfirme },
            { label: "Montant total", value: fmtMontant(stats.montantTotal) },
            { label: "Ce mois", value: fmtMontant(stats.montantMois) },
            { label: "Cette année", value: fmtMontant(stats.montantAnnee) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-[#0C1A35]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Graphique tendance */}
      {stats?.par12Mois && stats.par12Mois.some((m) => m.montant > 0) && (
        <TendanceChart data={stats.par12Mois} />
      )}

      {/* Filtres + Recherche */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3 flex-wrap items-center">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les types</option>
          <option value="LOYER">Loyer</option>
          <option value="PREMIUM">Premium</option>
          <option value="CAUTION">Caution</option>
        </select>
        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 outline-none focus:border-[#D4A843]"
        >
          <option value="">Tous les statuts</option>
          <option value="CONFIRME">Confirmé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ECHOUE">Échoué</option>
        </select>

        {/* Recherche par référence / téléphone */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Référence ou téléphone..."
              className="h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-[#D4A843] w-56"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button type="submit"
            className="h-9 px-3 rounded-xl bg-[#0C1A35] text-white text-xs font-medium hover:bg-[#0C1A35]/90 transition-colors">
            Chercher
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <SkTableRows rows={8} />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <CreditCard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucune transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode paiement</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Référence</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Propriétaire</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bien</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setDetail(t)}>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                        <CreditCard className="w-3 h-3" />
                        {TYPE_LABELS[t.type] ?? t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#0C1A35]">{fmtMontant(t.montant)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{t.modePaiement}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs font-mono truncate max-w-[100px]">
                      {t.reference ?? t.transactionId ?? "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUT_COLORS[t.statut] ?? "bg-slate-100 text-slate-500"}`}>
                        {t.statut}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {t.proprietaire ? (
                        <div>
                          <div className="font-medium">{t.proprietaire.prenom} {t.proprietaire.nom}</div>
                          <div className="text-slate-400">{t.proprietaire.telephone}</div>
                        </div>
                      ) : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs truncate max-w-[120px]">
                      {t.bien?.titre ?? ""}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{fmtDate(t.dateInitiation)}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">{pagination.total} transaction{pagination.total !== 1 ? "s" : ""}</span>
            <div className="flex gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Précédent
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de détail */}
      {detail && <DetailPanel t={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
