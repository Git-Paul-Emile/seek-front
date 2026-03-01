import { useState, useEffect } from "react";
import { FileText, Building2, Calendar, Banknote, User, Clock, CheckCircle, AlertCircle, Printer, Download } from "lucide-react";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { getLocataireContratApi, type ContratLocataireData } from "@/api/locataireAuth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const fmtMontant = (n?: number | null) =>
  n != null ? `${n.toLocaleString("fr-FR")} FCFA` : "—";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LocataireContrat() {
  const { locataire } = useLocataireAuth();
  const [contrat, setContrat] = useState<ContratLocataireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le contrat au montage
  useEffect(() => {
    const fetchContrat = async () => {
      try {
        setLoading(true);
        const data = await getLocataireContratApi();
        setContrat(data);
      } catch (err) {
        console.error("Erreur lors du chargement du contrat:", err);
        setError("Impossible de charger le contrat");
      } finally {
        setLoading(false);
      }
    };
    fetchContrat();
  }, []);

  if (!locataire) return null;

  const bailActif = locataire.bails?.find((b) => b.statut === "ACTIF");

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A843]" />
      </div>
    );
  }

  // Pas de bail actif
  if (!bailActif) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <FileText className="w-3.5 h-3.5" />
            Mon contrat
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
            Contrat de bail
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-600 font-medium">Aucun bail actif</p>
          <p className="text-sm text-slate-400 mt-1">
            Votre propriétaire n'a pas encore créé de bail pour votre compte.
          </p>
        </div>
      </div>
    );
  }

  // Pas de contrat disponible
  if (!contrat) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
            <FileText className="w-3.5 h-3.5" />
            Mon contrat
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
            Contrat de bail
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-600 font-medium">Contrat en attente</p>
          <p className="text-sm text-slate-400 mt-1">
            Votre propriétaire n'a pas encore généré votre contrat de bail.
          </p>
        </div>
      </div>
    );
  }

  // Affichage du contrat
  const contratData = contrat.contrat;
  const bailData = contrat.bail;
  const bienData = contrat.bien;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <FileText className="w-3.5 h-3.5" />
          Mon contrat
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Contrat de bail
        </h1>
        <p className="text-slate-400 mt-0.5 text-sm">
          Consultez les détails de votre contrat de location
        </p>
      </div>

      {/* Statut du contrat */}
      <div className="flex items-center gap-2">
        {contratData.statut === "ACTIF" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Contrat actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            En attente
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Détails du bail ── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Détails du bail
            </h2>

            {/* Bien */}
            <div className="bg-[#0C1A35] rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#D4A843]" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {bienData.titre || bienData.ville || "Logement"}
                </p>
                {bienData.adresse && (
                  <p className="text-xs text-white/50 mt-0.5">
                    {[bienData.adresse, bienData.quartier, bienData.ville].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Infos bail */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="Loyer mensuel"
                value={fmtMontant(bailData.montantLoyer)}
                icon={<Banknote className="w-3.5 h-3.5 text-[#D4A843]" />}
              />
              {bailData.montantCaution && (
                <StatBox
                  label="Dépôt de caution"
                  value={fmtMontant(bailData.montantCaution)}
                  icon={<Banknote className="w-3.5 h-3.5 text-slate-400" />}
                />
              )}
              <StatBox
                label="Date de début"
                value={fmt(bailData.dateDebutBail)}
                icon={<Calendar className="w-3.5 h-3.5 text-[#D4A843]" />}
              />
              {bailData.dateFinBail && (
                <StatBox
                  label="Date de fin"
                  value={fmt(bailData.dateFinBail)}
                  icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
                />
              )}
              <StatBox
                label="Type de bail"
                value={bailData.typeBail || "Standard"}
                icon={<FileText className="w-3.5 h-3.5 text-[#D4A843]" />}
              />
              <StatBox
                label="Fréquence de paiement"
                value={bailData.frequencePaiement || "Mensuel"}
                icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
              />
            </div>
          </div>

          {/* ── Contenu du contrat ── */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Contenu du contrat
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0C1A35] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <div 
                className="bg-slate-50 rounded-xl p-6 text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contratData.contenu.replace(/\n/g, '<br />') }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              Document généré le {new Date(contratData.createdAt).toLocaleDateString("fr-FR")}
              {contratData.updatedAt !== contratData.createdAt && (
                <> — Dernière mise à jour le {new Date(contratData.updatedAt).toLocaleDateString("fr-FR")}</>
              )}
            </p>
          </div>
        </div>

        {/* ── Informations ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Vos informations
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600">
                <span className="font-medium">{locataire.prenom} {locataire.nom}</span>
              </p>
              {locataire.email && (
                <p className="text-slate-500 text-xs">{locataire.email}</p>
              )}
              {locataire.telephone && (
                <p className="text-slate-500 text-xs">{locataire.telephone}</p>
              )}
            </div>
          </div>

          {/* Modèle de contrat */}
          {contratData.modele && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                Modèle utilisé
              </h2>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  {contratData.modele.titre}
                </p>
                {contratData.modele.typeBail && (
                  <p className="text-xs text-slate-400">
                    Type: {contratData.modele.typeBail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Aide */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700">Besoin d'aide?</p>
                <p className="text-xs text-blue-600 mt-1">
                  Pour toute question concernant votre contrat, contactez votre propriétaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composants helpers ────────────────────────────────────────────────────────

const StatBox = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-[#F8F5EE] rounded-xl p-4">
    <p className="text-xs text-slate-400 uppercase font-medium mb-1.5 flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="font-bold text-[#0C1A35] text-sm">{value}</p>
  </div>
);
