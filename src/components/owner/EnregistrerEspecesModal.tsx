import { useState } from "react";
import { X, Loader2, Banknote, CheckCircle2, ChevronRight, Building2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Echeance, BienAvecBailActif } from "@/api/bail";
import { useEnregistrerPaiementEspeces, useEcheancier, useBiensAvecBailActif } from "@/hooks/useBail";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("fr-FR");
const todayIso = () => new Date().toISOString().split("T")[0];

// ─── Étape formulaire (bien + bail + écheancier connus) ───────────────────────

function FormStep({
  bienId,
  bailId,
  echeancier,
  bienTitre,
  locataireNom,
  onClose,
}: {
  bienId: string;
  bailId: string;
  echeancier: Echeance[];
  bienTitre?: string;
  locataireNom?: string;
  onClose: () => void;
}) {
  const unpaid = echeancier
    .filter(e => e.statut !== "PAYE" && e.statut !== "ANNULE" && e.statut !== "EN_ATTENTE_CONFIRMATION")
    .sort((a, b) => new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime());

  const [selectedEcheanceId, setSelectedEcheanceId] = useState(unpaid[0]?.id ?? "");
  const [datePaiement, setDatePaiement] = useState(todayIso());
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const { mutate, isPending } = useEnregistrerPaiementEspeces();

  const selectedEch = echeancier.find(e => e.id === selectedEcheanceId);

  const canSubmit =
    !!selectedEcheanceId &&
    datePaiement.length > 0 &&
    new Date(datePaiement) <= new Date(todayIso());

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutate(
      {
        bienId,
        bailId,
        echeanceId: selectedEcheanceId,
        payload: {
          datePaiement,
          note: note || undefined,
        },
      },
      {
        onSuccess: () => {
          setDone(true);
          toast.success("Paiement espèces enregistré — le locataire doit confirmer");
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          toast.error(msg ?? "Erreur lors de l'enregistrement");
        },
      }
    );
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <p className="font-semibold text-[#0C1A35]">Paiement enregistré</p>
        <p className="text-sm text-slate-500">
          Le locataire a reçu une notification et doit confirmer ce paiement depuis son espace SEEK.
        </p>
        <button
          onClick={onClose}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49a38] transition-colors"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="px-5 pt-5 pb-2 space-y-4">
      {/* Bien + locataire recap */}
      {(bienTitre || locataireNom) && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            {bienTitre && <p className="text-xs font-semibold text-[#0C1A35] truncate">{bienTitre}</p>}
            {locataireNom && <p className="text-[11px] text-slate-500 truncate">Locataire : {locataireNom}</p>}
          </div>
        </div>
      )}

      {/* Info mode */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <Banknote className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          Le paiement passera en <strong>attente de confirmation</strong> jusqu'à ce que le locataire valide depuis son espace.
        </p>
      </div>

      {/* Type — auto */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
        <input
          readOnly
          value="Paiement de loyer"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
        />
      </div>

      {/* Mode — fixe */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Mode de paiement</label>
        <input
          readOnly
          value="Espèces"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
        />
      </div>

      {/* Mois concerné */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Mois concerné</label>
        {unpaid.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucune échéance impayée disponible.</p>
        ) : (
          <select
            value={selectedEcheanceId}
            onChange={e => setSelectedEcheanceId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
          >
            {unpaid.map(e => (
              <option key={e.id} value={e.id}>
                {new Date(e.dateEcheance).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                {" — "}
                {fmt(e.montant)} FCFA
                {" ("}
                {e.statut === "EN_RETARD" ? "En retard" : e.statut === "EN_ATTENTE" ? "En attente" : "À venir"}
                {")"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Montant (lecture seule) */}
      {selectedEch && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Montant (FCFA)</label>
          <input
            readOnly
            value={`${fmt(selectedEch.montant)} FCFA`}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Date de réception</label>
        <input
          type="date"
          value={datePaiement}
          onChange={e => setDatePaiement(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Note (optionnel)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Ex: remise en main propre au bureau…"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843] resize-none"
        />
      </div>

    </div>
    {/* Actions — sticky en bas de la zone scroll */}
    <div className="sticky bottom-0 bg-white flex gap-3 px-5 py-4 border-t border-slate-100">
      <button
        onClick={onClose}
        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        Annuler
      </button>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isPending || unpaid.length === 0}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A843] text-white text-sm font-semibold hover:bg-[#c49a38] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
        Valider
      </button>
    </div>
    </>
  );
}

// ─── Chargement bail/échéancier après sélection d'un bien ─────────────────────

function LoadBailStep({
  item,
  onClose,
}: {
  item: BienAvecBailActif;
  onClose: () => void;
}) {
  const { data: echeancier = [], isLoading } = useEcheancier(item.bienId, item.bailId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <FormStep
      bienId={item.bienId}
      bailId={item.bailId}
      echeancier={echeancier}
      bienTitre={item.bienTitre ?? undefined}
      locataireNom={item.locataireNom ?? undefined}
      onClose={onClose}
    />
  );
}

// ─── Props publiques ──────────────────────────────────────────────────────────

interface EnregistrerEspecesModalProps {
  /** Si fourni, saute l'étape de sélection du bien */
  bienId?: string;
  bailId?: string;
  echeancier?: Echeance[];
  bienTitre?: string;
  locataireNom?: string;
  onClose: () => void;
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function EnregistrerEspecesModal({
  bienId,
  bailId,
  echeancier,
  bienTitre,
  locataireNom,
  onClose,
}: EnregistrerEspecesModalProps) {
  const { data: biens = [], isLoading } = useBiensAvecBailActif();
  const [selectedItem, setSelectedItem] = useState<BienAvecBailActif | null>(null);
  const [search, setSearch] = useState("");

  const directMode = !!bienId && !!bailId && echeancier !== undefined;

  // Recherche par nom, prénom, téléphone locataire ou titre du bien
  const q = search.trim().toLowerCase();
  const filtered = biens.filter(b => {
    if (!q) return true;
    return (
      (b.locataireNom ?? "").toLowerCase().includes(q) ||
      (b.locataireTelephone ?? "").includes(q) ||
      (b.bienTitre ?? "").toLowerCase().includes(q) ||
      (b.bienVille ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* En-tête — fixe */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#D4A843]" />
            <h2 className="font-semibold text-[#0C1A35]">Enregistrer un paiement</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu — scrollable */}
        <div className="overflow-y-auto flex-1">
        {directMode ? (
          <FormStep
            bienId={bienId}
            bailId={bailId!}
            echeancier={echeancier!}
            bienTitre={bienTitre}
            locataireNom={locataireNom}
            onClose={onClose}
          />
        ) : selectedItem ? (
          /* ─── Étape 2 : formulaire ─── */
          <LoadBailStep item={selectedItem} onClose={onClose} />
        ) : (
          /* ─── Étape 1 : sélection du bien ─── */
          <>
          <div className="px-5 pt-4 pb-2 space-y-3">
            <p className="text-xs text-slate-500">
              Sélectionnez le bien concerné. Recherchez par nom/prénom ou téléphone du locataire.
            </p>

            {/* Barre de recherche — sticky sous le header */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, prénom, téléphone du locataire…"
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0C1A35] focus:outline-none focus:border-[#D4A843]"
              />
            </div>

            {/* Liste des biens */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#D4A843]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-6">
                {biens.length === 0 ? "Aucun bien avec bail actif." : "Aucun résultat."}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filtered.map(b => (
                  <button
                    key={b.bailId}
                    onClick={() => setSelectedItem(b)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#D4A843]/50 hover:bg-[#D4A843]/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[#D4A843]" />
                      </div>
                      <div className="min-w-0">
                        {/* Bien en titre principal */}
                        <p className="text-sm font-semibold text-[#0C1A35] truncate">
                          {b.bienTitre ?? "Bien sans titre"}
                        </p>
                        {/* Ville + loyer */}
                        <p className="text-[11px] text-slate-400 truncate">
                          {b.bienVille ?? ""}
                          {b.bienVille ? " · " : ""}
                          {fmt(b.montantLoyer)} FCFA / mois
                        </p>
                        {/* Locataire en sous-titre */}
                        {b.locataireNom && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {b.locataireNom}
                            {b.locataireTelephone ? ` · ${b.locataireTelephone}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}

          </div>
          <div className="sticky bottom-0 bg-white px-5 py-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
