import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  fetchAllPagesLegalesAdmin,
  upsertPageLegale,
  type PageLegale,
} from "@/api/pageLegale";
import { Edit, Eye, X, Shield, ScrollText, Lock, ExternalLink } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";

const PAGE_META: Record<string, { icon: React.ElementType; color: string; path: string; description: string }> = {
  "politique-confidentialite": {
    icon: Lock,
    color: "text-blue-600 bg-blue-50",
    path: "/politique-confidentialite",
    description: "Gestion des données personnelles — Loi n° 2008-12, CDP Sénégal",
  },
  "conditions-utilisation": {
    icon: ScrollText,
    color: "text-amber-600 bg-amber-50",
    path: "/conditions-utilisation",
    description: "Règles d'utilisation — Loi n° 2008-10 & 2008-11",
  },
  "conformite-donnees": {
    icon: Shield,
    color: "text-green-600 bg-green-50",
    path: "/conformite-donnees",
    description: "Conformité CDP, transferts internationaux, mesures de sécurité",
  },
};

export default function PagesLegalesAdmin() {
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<PageLegale | null>(null);
  const [editForm, setEditForm] = useState({ titre: "", contenu: "", version: "", publie: true });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["pages-legales-admin"],
    queryFn: fetchAllPagesLegalesAdmin,
  });

  const upsertMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: typeof editForm }) =>
      upsertPageLegale(slug, data),
    onSuccess: () => {
      toast.success("Page mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["pages-legales-admin"] });
      setEditingPage(null);
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const handleEdit = (page: PageLegale) => {
    setEditingPage(page);
    setEditForm({
      titre: page.titre,
      contenu: page.contenu,
      version: page.version ?? "",
      publie: page.publie,
    });
  };

  const handleSave = () => {
    if (!editingPage) return;
    upsertMutation.mutate({ slug: editingPage.slug, data: editForm });
  };

  useEffect(() => {
    if (!editingPage) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setEditingPage(null); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "unset";
    };
  }, [editingPage]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Non enregistrée";
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Paramètres", to: "/admin/parametres/config-site" },
          { label: "Pages légales" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-[#0C1A35]">Pages légales</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gérez le contenu des pages légales conformément au droit sénégalais (Loi 2008-12, CDP).
        </p>
      </div>

      {/* Info band */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <span className="font-semibold">Conformité CDP Sénégal</span> — Ces pages sont accessibles publiquement.
          Le contenu HTML est rendu tel quel. Toute modification est immédiatement visible sur le site.
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Chargement...</div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => {
            const meta = PAGE_META[page.slug];
            const Icon = meta?.icon ?? ScrollText;
            return (
              <div
                key={page.slug}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta?.color ?? "text-slate-500 bg-slate-50"}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#0C1A35]">{page.titre}</h3>
                    {page.version && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                        v{page.version}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      page.publie ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {page.publie ? "Publiée" : "Masquée"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{meta?.description}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Dernière mise à jour : {formatDate(page.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={meta?.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Voir la page publique"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'édition */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-[#0C1A35]">Modifier — {editingPage.titre}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Slug : <code className="bg-slate-100 px-1 rounded">{editingPage.slug}</code></p>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="edit-titre">Titre de la page</Label>
                  <Input
                    id="edit-titre"
                    value={editForm.titre}
                    onChange={(e) => setEditForm((p) => ({ ...p, titre: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-version">Version (ex: 1.2)</Label>
                  <Input
                    id="edit-version"
                    value={editForm.version}
                    placeholder="1.0"
                    onChange={(e) => setEditForm((p) => ({ ...p, version: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="edit-contenu">Contenu HTML</Label>
                  <span className="text-xs text-slate-400">Le contenu est rendu comme HTML dans la page publique</span>
                </div>
                <Textarea
                  id="edit-contenu"
                  value={editForm.contenu}
                  rows={22}
                  className="font-mono text-xs"
                  onChange={(e) => setEditForm((p) => ({ ...p, contenu: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit-publie"
                  checked={editForm.publie}
                  onChange={(e) => setEditForm((p) => ({ ...p, publie: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#D4A843]"
                />
                <Label htmlFor="edit-publie" className="cursor-pointer">
                  Page publiée (visible publiquement)
                </Label>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aperçu rendu</span>
                </div>
                <div
                  className="bg-[#F8F5EE] rounded-xl border border-slate-100 p-5 max-h-60 overflow-y-auto prose prose-sm prose-slate max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: editForm.contenu }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  onClick={handleSave}
                  disabled={upsertMutation.isPending}
                  className="flex-1"
                >
                  {upsertMutation.isPending ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </Button>
                <Button variant="outline" onClick={() => setEditingPage(null)} className="flex-1">
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
