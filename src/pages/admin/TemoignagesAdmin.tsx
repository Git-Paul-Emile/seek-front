import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchAllTemoignagesAdmin, updateTemoignage, deleteTemoignage, type Temoignage } from "@/api/temoignage";
import { Trash2, Edit, X, MessageSquare } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function TemoignagesAdmin() {
  const queryClient = useQueryClient();
  const [editingTemoignage, setEditingTemoignage] = useState<Temoignage | null>(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    profession: "",
    temoignage: "",
    actif: false,
    ordre: 0,
  });

  const { data: temoignages = [], isLoading } = useQuery({
    queryKey: ["temoignages-admin"],
    queryFn: fetchAllTemoignagesAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTemoignage(id, data),
    onSuccess: () => {
      toast.success("Témoignage mis à jour");
      queryClient.invalidateQueries({ queryKey: ["temoignages-admin"] });
      setEditingTemoignage(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemoignage,
    onSuccess: () => {
      toast.success("Témoignage supprimé");
      queryClient.invalidateQueries({ queryKey: ["temoignages-admin"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    deleteMutation.mutate(id);
  };

  const handleEdit = (temoignage: Temoignage) => {
    setEditingTemoignage(temoignage);
    setEditForm({
      nom: temoignage.nom,
      profession: temoignage.profession || "",
      temoignage: temoignage.temoignage,
      actif: temoignage.actif || false,
      ordre: temoignage.ordre || 0,
    });
  };

  const handleSaveEdit = () => {
    if (!editingTemoignage) return;
    updateMutation.mutate({ id: editingTemoignage.id, data: editForm });
  };

  useEffect(() => {
    if (!editingTemoignage) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setEditingTemoignage(null); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "unset";
    };
  }, [editingTemoignage]);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Témoignages" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Gestion des témoignages</h1>
        <p className="text-sm text-slate-500 mt-0.5">Approuvez, modifiez ou supprimez les témoignages soumis.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">Chargement...</div>
        ) : temoignages.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Aucun témoignage</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Profession</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Témoignage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {temoignages.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-[#0C1A35]">{t.nom}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{t.profession || "-"}</td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs max-w-[200px] truncate">{t.temoignage}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${t.actif ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {t.actif ? "Actif" : "En attente"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{t.ordre ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'édition */}
      {editingTemoignage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-[#0C1A35]">Modifier le témoignage</h3>
              <button onClick={() => setEditingTemoignage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-nom">Nom</Label>
                <Input id="edit-nom" value={editForm.nom}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="edit-profession">Profession</Label>
                <Input id="edit-profession" value={editForm.profession}
                  onChange={(e) => setEditForm(prev => ({ ...prev, profession: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="edit-temoignage">Témoignage</Label>
                <Textarea id="edit-temoignage" value={editForm.temoignage} rows={4}
                  onChange={(e) => setEditForm(prev => ({ ...prev, temoignage: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="edit-actif" checked={editForm.actif}
                  onChange={(e) => setEditForm(prev => ({ ...prev, actif: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#D4A843]" />
                <Label htmlFor="edit-actif" className="cursor-pointer">Actif (visible publiquement)</Label>
              </div>
              <div>
                <Label htmlFor="edit-ordre">Ordre d'affichage</Label>
                <Input id="edit-ordre" type="number" value={editForm.ordre}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ordre: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}
                  className="flex-1">
                  {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                <Button variant="outline" onClick={() => setEditingTemoignage(null)} className="flex-1">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
