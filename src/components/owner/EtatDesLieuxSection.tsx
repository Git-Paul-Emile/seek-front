import React from "react";
import { Loader2, Plus, Trash2, UploadCloud, CheckCheck, PenSquare } from "lucide-react";
import { toast } from "sonner";
import type { EtatDesLieux, EtatElement } from "@/api/etatDesLieux";
import {
  useAddEtatDesLieuxItem,
  useAddEtatDesLieuxPhoto,
  useCreateEtatDesLieux,
  useDeleteEtatDesLieuxItem,
  useDeleteEtatDesLieuxPhoto,
  useEtatsDesLieux,
  useSignerEtatDesLieuxOwner,
  useUpdateEtatDesLieux,
  useUpdateEtatDesLieuxItem,
} from "@/hooks/useEtatDesLieux";

const ETAT_OPTIONS: EtatElement[] = ["NEUF", "BON", "MOYEN", "MAUVAIS", "HS"];

const toInputDate = (date: string) => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function badgeClass(statut: string) {
  return statut === "VALIDE"
    ? "bg-green-100 text-green-700"
    : "bg-slate-100 text-slate-600";
}

export default function EtatDesLieuxSection({
  bienId,
  bailId,
}: {
  bienId: string;
  bailId: string;
}) {
  const { data: etats = [], isLoading } = useEtatsDesLieux(bienId, bailId);
  const createEtat = useCreateEtatDesLieux();
  const updateEtat = useUpdateEtatDesLieux();
  const signOwner = useSignerEtatDesLieuxOwner();
  const addItem = useAddEtatDesLieuxItem();
  const updateItem = useUpdateEtatDesLieuxItem();
  const deleteItem = useDeleteEtatDesLieuxItem();
  const addPhoto = useAddEtatDesLieuxPhoto();
  const deletePhoto = useDeleteEtatDesLieuxPhoto();

  const [selectedId, setSelectedId] = React.useState<string>("");
  const selected = etats.find((e) => e.id === selectedId) ?? etats[0] ?? null;

  React.useEffect(() => {
    if (!selectedId && etats[0]?.id) setSelectedId(etats[0].id);
    if (selectedId && !etats.some((e) => e.id === selectedId) && etats[0]?.id) {
      setSelectedId(etats[0].id);
    }
  }, [etats, selectedId]);

  const [dateEtat, setDateEtat] = React.useState("");
  const [commentaireGlobal, setCommentaireGlobal] = React.useState("");
  const [piece, setPiece] = React.useState("");
  const [element, setElement] = React.useState("");
  const [etat, setEtat] = React.useState<EtatElement>("BON");
  const [commentaire, setCommentaire] = React.useState("");

  React.useEffect(() => {
    if (!selected) return;
    setDateEtat(toInputDate(selected.dateEtat));
    setCommentaireGlobal(selected.commentaireGlobal ?? "");
  }, [selected?.id]);

  const create = async (type: "ENTREE" | "SORTIE") => {
    try {
      const created = await createEtat.mutateAsync({ bienId, bailId, payload: { type } });
      setSelectedId(created.id);
      toast.success(`Etat des lieux ${type === "ENTREE" ? "d'entrée" : "de sortie"} créé`);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur");
    }
  };

  const saveHeader = async () => {
    if (!selected) return;
    try {
      await updateEtat.mutateAsync({
        bienId,
        bailId,
        etatDesLieuxId: selected.id,
        payload: { dateEtat, commentaireGlobal },
      });
      toast.success("Etat des lieux mis à jour");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur");
    }
  };

  const validateEtat = async () => {
    if (!selected) return;
    try {
      await updateEtat.mutateAsync({
        bienId,
        bailId,
        etatDesLieuxId: selected.id,
        payload: { statut: "VALIDE" },
      });
      toast.success("Etat des lieux validé");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur");
    }
  };

  const signAsOwner = async () => {
    if (!selected) return;
    try {
      await signOwner.mutateAsync({ bienId, bailId, etatDesLieuxId: selected.id });
      toast.success("Etat des lieux signé");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur");
    }
  };

  const addNewItem = async () => {
    if (!selected) return;
    if (!piece.trim() || !element.trim()) {
      toast.error("Renseignez la pièce et l'élément");
      return;
    }
    try {
      await addItem.mutateAsync({
        bienId,
        bailId,
        etatDesLieuxId: selected.id,
        payload: { piece: piece.trim(), element: element.trim(), etat, commentaire },
      });
      setPiece("");
      setElement("");
      setEtat("BON");
      setCommentaire("");
      toast.success("Elément ajouté");
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  const hasEntree = etats.some((e) => e.type === "ENTREE");
  const hasSortie = etats.some((e) => e.type === "SORTIE");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!hasEntree && (
          <button
            onClick={() => create("ENTREE")}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          >
            + Entrée
          </button>
        )}
        {!hasSortie && (
          <button
            onClick={() => create("SORTIE")}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
          >
            + Sortie
          </button>
        )}
      </div>

      {etats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {etats.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border ${
                selected?.id === e.id
                  ? "border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {e.type === "ENTREE" ? "Entrée" : "Sortie"}
              <span className={`ml-2 px-1.5 py-0.5 rounded ${badgeClass(e.statut)}`}>{e.statut}</span>
            </button>
          ))}
        </div>
      )}

      {!selected ? (
        <p className="text-xs text-slate-500">Aucun état des lieux pour ce bail.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <input
              type="date"
              value={dateEtat}
              onChange={(e) => setDateEtat(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs"
              disabled={selected.statut === "VALIDE"}
            />
            <textarea
              value={commentaireGlobal}
              onChange={(e) => setCommentaireGlobal(e.target.value)}
              className="min-h-[70px] p-2.5 rounded-lg border border-slate-200 text-xs"
              placeholder="Commentaire global"
              disabled={selected.statut === "VALIDE"}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveHeader}
              disabled={selected.statut === "VALIDE" || updateEtat.isPending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <PenSquare className="w-3.5 h-3.5 inline mr-1" />
              Enregistrer
            </button>
            <button
              onClick={validateEtat}
              disabled={selected.statut === "VALIDE" || updateEtat.isPending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 inline mr-1" />
              Valider
            </button>
            <button
              onClick={signAsOwner}
              disabled={selected.statut !== "VALIDE" || !!selected.signeParProprioAt || signOwner.isPending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 disabled:opacity-50"
            >
              Signer propriétaire
            </button>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Ajouter un élément</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={piece}
                onChange={(e) => setPiece(e.target.value)}
                placeholder="Pièce (Salon, Chambre 1...)"
                className="h-8 px-2.5 rounded border border-slate-200 text-xs"
                disabled={selected.statut === "VALIDE"}
              />
              <input
                value={element}
                onChange={(e) => setElement(e.target.value)}
                placeholder="Elément (Mur, Sol...)"
                className="h-8 px-2.5 rounded border border-slate-200 text-xs"
                disabled={selected.statut === "VALIDE"}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value as EtatElement)}
                className="h-8 px-2.5 rounded border border-slate-200 text-xs"
                disabled={selected.statut === "VALIDE"}
              >
                {ETAT_OPTIONS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              <button
                onClick={addNewItem}
                disabled={selected.statut === "VALIDE" || addItem.isPending}
                className="h-8 rounded border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1" />
                Ajouter
              </button>
            </div>
            <input
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire"
              className="h-8 px-2.5 rounded border border-slate-200 text-xs w-full"
              disabled={selected.statut === "VALIDE"}
            />
          </div>

          <div className="space-y-2">
            {selected.items.length === 0 ? (
              <p className="text-xs text-slate-500">Aucun élément ajouté.</p>
            ) : (
              selected.items.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">
                        {item.piece} - {item.element}
                      </p>
                      <p className="text-slate-500">Etat: {item.etat}</p>
                      {item.commentaire && <p className="text-slate-500">{item.commentaire}</p>}
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm("Supprimer cet élément ?")) return;
                        deleteItem.mutate(
                          { bienId, bailId, etatDesLieuxId: selected.id, itemId: item.id },
                          {
                            onSuccess: () => toast.success("Elément supprimé"),
                            onError: () => toast.error("Erreur de suppression"),
                          }
                        );
                      }}
                      disabled={selected.statut === "VALIDE"}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <select
                      value={item.etat}
                      onChange={(e) => {
                        updateItem.mutate(
                          {
                            bienId,
                            bailId,
                            etatDesLieuxId: selected.id,
                            itemId: item.id,
                            payload: { etat: e.target.value as EtatElement },
                          },
                          {
                            onError: () => toast.error("Erreur de mise à jour"),
                          }
                        );
                      }}
                      disabled={selected.statut === "VALIDE"}
                      className="h-7 px-2 rounded border border-slate-200 text-xs"
                    >
                      {ETAT_OPTIONS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                    <label className="cursor-pointer text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={selected.statut === "VALIDE"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          addPhoto.mutate(
                            { bienId, bailId, etatDesLieuxId: selected.id, itemId: item.id, photo: file },
                            {
                              onSuccess: () => toast.success("Photo ajoutée"),
                              onError: () => toast.error("Erreur upload photo"),
                            }
                          );
                          e.target.value = "";
                        }}
                      />
                      <UploadCloud className="w-3.5 h-3.5 inline mr-1" />
                      Photo
                    </label>
                  </div>

                  {item.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {item.photos.map((photo) => (
                        <div key={photo.id} className="relative rounded overflow-hidden border border-slate-100">
                          <img src={photo.url} alt={photo.nom ?? "photo"} className="w-full h-20 object-cover" />
                          {selected.statut !== "VALIDE" && (
                            <button
                              onClick={() => {
                                deletePhoto.mutate(
                                  {
                                    bienId,
                                    bailId,
                                    etatDesLieuxId: selected.id,
                                    itemId: item.id,
                                    photoId: photo.id,
                                  },
                                  {
                                    onSuccess: () => toast.success("Photo supprimée"),
                                    onError: () => toast.error("Erreur suppression photo"),
                                  }
                                );
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded bg-white/90 text-red-600 flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            Signature propriétaire: {selected.signeParProprioAt ? "Oui" : "Non"} · Signature locataire:{" "}
            {selected.signeParLocataireAt ? "Oui" : "Non"}
          </div>
        </div>
      )}
    </div>
  );
}
