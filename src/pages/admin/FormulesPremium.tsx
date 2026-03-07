import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminFormules,
  useAdminCreateFormule,
  useAdminUpdateFormule,
  useAdminDeleteFormule,
  type FormulePremiumFull,
} from "@/hooks/usePremium";

const EMPTY: Partial<FormulePremiumFull> = {
  code: "",
  nom: "",
  dureeJours: 7,
  prix: 5000,
  accroche: "",
  description: "",
  idealPour: [],
  populer: false,
  actif: true,
  ordre: 1,
};

function FormuleModal({
  initial,
  onClose,
  onSave,
  isPending,
}: {
  initial: Partial<FormulePremiumFull>;
  onClose: () => void;
  onSave: (data: Partial<FormulePremiumFull>) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<Partial<FormulePremiumFull>>(initial);
  const [idealStr, setIdealStr] = useState((initial.idealPour ?? []).join("\n"));

  const set = (k: keyof FormulePremiumFull, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!form.code || !form.nom) {
      toast.error("Code et nom requis");
      return;
    }
    onSave({ ...form, idealPour: idealStr.split("\n").map((s) => s.trim()).filter(Boolean) });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#0C1A35]">
            {initial.id ? "Modifier la formule" : "Nouvelle formule"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Code *</label>
              <input value={form.code ?? ""} onChange={(e) => set("code", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50"
                placeholder="BASIC" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nom *</label>
              <input value={form.nom ?? ""} onChange={(e) => set("nom", e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50"
                placeholder="Formule Basic" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Durée (jours)</label>
              <input type="number" value={form.dureeJours ?? ""} onChange={(e) => set("dureeJours", Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Prix (FCFA)</label>
              <input type="number" value={form.prix ?? ""} onChange={(e) => set("prix", Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Accroche</label>
            <input value={form.accroche ?? ""} onChange={(e) => set("accroche", e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50"
              placeholder="Idéal pour commencer" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
            <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Idéal pour (une valeur par ligne)</label>
            <textarea value={idealStr} onChange={(e) => setIdealStr(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50 resize-none"
              placeholder="Petits propriétaires&#10;Première annonce" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Ordre</label>
              <input type="number" value={form.ordre ?? 1} onChange={(e) => set("ordre", Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#D4A843] bg-slate-50" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.populer ?? false}
                  onChange={(e) => set("populer", e.target.checked)}
                  className="rounded" />
                <span className="text-sm text-slate-700">Populaire</span>
              </label>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.actif ?? true}
                  onChange={(e) => set("actif", e.target.checked)}
                  className="rounded" />
                <span className="text-sm text-slate-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
            Annuler
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#D4A843] text-white hover:bg-[#c49735] disabled:opacity-50 transition-colors flex items-center gap-1.5">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormulesPremium() {
  const { data: formules = [], isLoading } = useAdminFormules();
  const { mutate: create, isPending: creating } = useAdminCreateFormule();
  const { mutate: update, isPending: updating } = useAdminUpdateFormule();
  const { mutate: remove } = useAdminDeleteFormule();

  const [modal, setModal] = useState<{ open: boolean; initial: Partial<FormulePremiumFull> }>({
    open: false,
    initial: EMPTY,
  });

  const handleSave = (data: Partial<FormulePremiumFull>) => {
    if (data.id) {
      update(
        { id: data.id, data },
        {
          onSuccess: () => { toast.success("Formule mise à jour"); setModal({ open: false, initial: EMPTY }); },
          onError: () => toast.error("Erreur lors de la mise à jour"),
        }
      );
    } else {
      create(data, {
        onSuccess: () => { toast.success("Formule créée"); setModal({ open: false, initial: EMPTY }); },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette formule ?")) return;
    remove(id, {
      onSuccess: () => toast.success("Formule supprimée"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1A35]">Formules Premium</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestion des offres de mise en avant</p>
        </div>
        <button
          onClick={() => setModal({ open: true, initial: EMPTY })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A843] text-white text-sm font-medium hover:bg-[#c49735] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle formule
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {formules.map((f) => (
            <div key={f.id} className={`bg-white rounded-2xl border p-5 space-y-3 ${f.populer ? "border-[#D4A843]" : "border-slate-100"}`}>
              <div className="flex items-start justify-between">
                <div>
                  {f.populer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] text-[10px] font-semibold mb-1">
                      <Star className="w-2.5 h-2.5 fill-[#D4A843]" /> POPULAIRE
                    </span>
                  )}
                  <h3 className="font-semibold text-[#0C1A35]">{f.nom}</h3>
                  <p className="text-xs text-slate-400">{f.code}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ open: true, initial: f })}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-[#D4A843] hover:bg-[#D4A843]/5 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(f.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-[#D4A843]">
                  {new Intl.NumberFormat("fr-FR").format(f.prix)} FCFA
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{f.dureeJours} jours</span>
                <span className="text-slate-400">·</span>
                <span className={`text-xs font-medium ${f.actif ? "text-green-600" : "text-slate-400"}`}>
                  {f.actif ? "Active" : "Inactive"}
                </span>
              </div>

              {f.accroche && <p className="text-xs text-slate-500">{f.accroche}</p>}
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <FormuleModal
          initial={modal.initial}
          onClose={() => setModal({ open: false, initial: EMPTY })}
          onSave={handleSave}
          isPending={creating || updating}
        />
      )}
    </div>
  );
}
