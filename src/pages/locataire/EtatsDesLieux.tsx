import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileCheck, Loader2, PenSquare, Home } from "lucide-react";
import { toast } from "sonner";
import {
  getLocataireEtatsDesLieuxApi,
  signerEtatDesLieuxLocataireApi,
  type EtatDesLieuxLocataire,
} from "@/api/locataireAuth";

function EtatCard({ item }: { item: EtatDesLieuxLocataire }) {
  const qc = useQueryClient();
  const sign = useMutation({
    mutationFn: () => signerEtatDesLieuxLocataireApi(item.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locataire-etats-des-lieux"] });
      toast.success("Etat des lieux signé");
    },
    onError: () => toast.error("Impossible de signer"),
  });

  const canSign = item.statut === "VALIDE" && !item.signeParLocataireAt;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0C1A35]">
            Etat des lieux {item.type === "ENTREE" ? "d'entrée" : "de sortie"}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(item.dateEtat).toLocaleDateString("fr-FR")}
            {" · "}
            {item.bail.bien.titre || item.bail.bien.ville || "Logement"}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            item.statut === "VALIDE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.statut}
        </span>
      </div>

      {item.commentaireGlobal && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">{item.commentaireGlobal}</p>
      )}

      <div className="space-y-2">
        {item.items.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun élément.</p>
        ) : (
          item.items.map((it) => (
            <div key={it.id} className="rounded-lg border border-slate-100 p-2.5">
              <p className="text-xs font-medium text-slate-700">
                {it.piece} - {it.element}
              </p>
              <p className="text-xs text-slate-500">Etat: {it.etat}</p>
              {it.commentaire && <p className="text-xs text-slate-500">{it.commentaire}</p>}
              {it.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {it.photos.map((p) => (
                    <a key={p.id} href={p.url} target="_blank" rel="noreferrer">
                      <img src={p.url} alt={p.nom ?? "photo"} className="w-full h-16 object-cover rounded border border-slate-100" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded ${item.signeParProprioAt ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
          Propriétaire: {item.signeParProprioAt ? "signé" : "non signé"}
        </span>
        <span className={`px-2 py-1 rounded ${item.signeParLocataireAt ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
          Locataire: {item.signeParLocataireAt ? "signé" : "non signé"}
        </span>
      </div>

      {canSign && (
        <button
          onClick={() => sign.mutate()}
          disabled={sign.isPending}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 disabled:opacity-50"
        >
          <PenSquare className="w-3.5 h-3.5" />
          Signer cet état des lieux
        </button>
      )}
    </div>
  );
}

export default function EtatsDesLieux() {
  const { data, isLoading } = useQuery({
    queryKey: ["locataire-etats-des-lieux"],
    queryFn: getLocataireEtatsDesLieuxApi,
  });

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[{ label: "Mon espace", to: "/locataire/dashboard" }, { label: "États des lieux" }]} />
      <div className="flex items-center gap-3">
        <Link
          to="/locataire/dashboard"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-0.5">
            <FileCheck className="w-3.5 h-3.5" />
            Mon logement
          </div>
          <h1 className="font-display text-xl font-bold text-[#0C1A35]">États des lieux</h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <Home className="w-9 h-9 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Aucun état des lieux disponible pour le moment.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Vérifiez et signez chaque état des lieux validé.
          </div>
          {data.map((item) => (
            <EtatCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
