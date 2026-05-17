import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SlidersHorizontal, ArrowLeft, Loader2, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useChampsAdminState, useSetChampsForTypeLogement } from "@/hooks/useTypeLogementChamp";
import { useTypeLogementsAdmin } from "@/hooks/useTypeLogements";
import type { ChampWithState } from "@/api/typeLogementChamp";

interface ChampRow {
  champId: string;
  nom: string;
  type: string;
  categorieNom: string;
  categorieOrdre: number;
  actif: boolean;
  associe: boolean;
  obligatoire: boolean;
  ordre: number;
}

export default function TypeLogementChampsPage() {
  const { id: typeLogementId = "" } = useParams<{ id: string }>();
  const { data: types = [] }        = useTypeLogementsAdmin();
  const typeLogement                = types.find((t) => t.id === typeLogementId);

  const { data: champsRaw = [], isLoading } = useChampsAdminState(typeLogementId);
  const setChamps = useSetChampsForTypeLogement(typeLogementId);

  const [rows, setRows] = useState<ChampRow[]>([]);

  useEffect(() => {
    if (!champsRaw.length) return;
    setRows(
      (champsRaw as ChampWithState[]).map((c, i) => ({
        champId:        c.id,
        nom:            c.nom,
        type:           c.type,
        categorieNom:   c.categorie.nom,
        categorieOrdre: c.categorie.ordre,
        actif:          c.actif,
        associe:        c.typeLogements.length > 0,
        obligatoire:    c.typeLogements[0]?.obligatoire ?? false,
        ordre:          c.typeLogements[0]?.ordre ?? i,
      }))
    );
  }, [champsRaw]);

  const toggle = (champId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.champId === champId ? { ...r, associe: !r.associe, obligatoire: false } : r
      )
    );
  };

  const toggleObligatoire = (champId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.champId === champId && r.associe ? { ...r, obligatoire: !r.obligatoire } : r
      )
    );
  };

  const handleSave = async () => {
    const associated = rows
      .filter((r) => r.associe)
      .map((r, i) => ({ champId: r.champId, obligatoire: r.obligatoire, ordre: i }));
    await setChamps.mutateAsync(associated);
    toast.success("Configuration enregistrée");
  };

  // Group by categorie
  const grouped = rows.reduce<Record<string, { nom: string; ordre: number; items: ChampRow[] }>>(
    (acc, r) => {
      if (!acc[r.categorieNom]) acc[r.categorieNom] = { nom: r.categorieNom, ordre: r.categorieOrdre, items: [] };
      acc[r.categorieNom].items.push(r);
      return acc;
    },
    {}
  );
  const sortedGroups = Object.entries(grouped).sort((a, b) => a[1].ordre - b[1].ordre);
  const nbAssocies = rows.filter((r) => r.associe).length;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Types de logement", to: "/admin/biens/categories" },
          { label: typeLogement?.nom ?? "Champs" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-3">
        <div className="flex items-start gap-3">
          <Link
            to="/admin/biens/categories"
            className="mt-1 shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Configuration des champs
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
              {typeLogement?.nom ?? "Type de logement"}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {nbAssocies} champ{nbAssocies > 1 ? "s" : ""} associé{nbAssocies > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={setChamps.isPending}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#D4A843] hover:bg-[#C09535] text-white text-sm font-semibold shadow-sm shadow-[#D4A843]/20 transition-all disabled:opacity-50"
        >
          {setChamps.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 text-sm">
          Aucun champ disponible. Créez d'abord des champs dans{" "}
          <Link to="/admin/champs" className="text-[#D4A843] underline">Champs de formulaire</Link>.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGroups.map(([catNom, group]) => (
            <div key={catNom} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/60">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{group.nom}</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {group.items.map((row) => (
                  <div
                    key={row.champId}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                      row.associe ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-slate-200 flex-shrink-0" />

                    <input
                      type="checkbox"
                      checked={row.associe}
                      onChange={() => toggle(row.champId)}
                      disabled={!row.actif}
                      className="w-4 h-4 rounded accent-[#D4A843] cursor-pointer disabled:cursor-not-allowed"
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${row.associe ? "text-[#0C1A35]" : "text-slate-400"}`}>
                        {row.nom}
                        {!row.actif && <span className="ml-2 text-xs font-normal text-slate-300">(inactif)</span>}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{row.type}</p>
                    </div>

                    {row.associe && (
                      <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={row.obligatoire}
                          onChange={() => toggleObligatoire(row.champId)}
                          className="w-4 h-4 rounded accent-red-400"
                        />
                        Obligatoire
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
