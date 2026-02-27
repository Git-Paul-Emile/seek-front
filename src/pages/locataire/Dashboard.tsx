import {
  Building2,
  Calendar,
  Banknote,
  CheckCircle,
  Home,
  LayoutDashboard,
  Phone,
  Mail,
  User,
  Clock,
} from "lucide-react";
import { useLocataireAuth } from "@/context/LocataireAuthContext";

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

export default function LocataireDashboard() {
  const { locataire } = useLocataireAuth();

  if (!locataire) return null;

  const bailActif = locataire.bails?.find((b) => b.statut === "ACTIF");

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-2">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0C1A35]">
          Bonjour,{" "}
          <span className="text-[#D4A843]">
            {locataire.prenom} {locataire.nom}
          </span>
        </h1>
        <p className="text-slate-400 mt-0.5 text-sm">
          Bienvenue dans votre espace locataire
        </p>
      </div>

      {/* Statut du compte */}
      <div className="flex items-center gap-2">
        {locataire.statut === "ACTIF" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Compte actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            En attente d'activation
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Bail actif ── */}
        <div className="lg:col-span-2 space-y-5">
          {bailActif ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-5 flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                Mon logement actuel
              </h2>

              {/* Bien */}
              <div className="bg-[#0C1A35] rounded-xl p-4 mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4A843]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#D4A843]" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {bailActif.bien?.titre || bailActif.bien?.ville || "Logement"}
                  </p>
                  {bailActif.bien?.ville && bailActif.bien?.titre && (
                    <p className="text-xs text-white/50 mt-0.5">{bailActif.bien.ville}</p>
                  )}
                </div>
              </div>

              {/* Infos bail */}
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Loyer mensuel"
                  value={fmtMontant(bailActif.montantLoyer)}
                  icon={<Banknote className="w-3.5 h-3.5 text-[#D4A843]" />}
                />
                <StatBox
                  label="Début du bail"
                  value={fmt(bailActif.dateDebutBail)}
                  icon={<Calendar className="w-3.5 h-3.5 text-[#D4A843]" />}
                />
                {bailActif.dateFinBail && (
                  <StatBox
                    label="Fin du bail"
                    value={fmt(bailActif.dateFinBail)}
                    icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">Aucun bail actif</p>
              <p className="text-sm text-slate-400 mt-1">
                Votre propriétaire n'a pas encore associé de bien à votre compte.
              </p>
            </div>
          )}
        </div>

        {/* ── Infos personnelles ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Mes informations
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {locataire.telephone}
              </div>
              {locataire.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {locataire.email}
                </div>
              )}
              {locataire.nationalite && (
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {locataire.nationalite}
                </div>
              )}
              {locataire.situationProfessionnelle && (
                <div className="text-slate-500 text-xs bg-slate-50 rounded-lg px-2.5 py-1.5 mt-2">
                  {locataire.situationProfessionnelle}
                </div>
              )}
            </div>
          </div>

          {/* Identité — uniquement si remplie */}
          {(locataire.typePiece || locataire.dateNaissance) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-4">
                Identité
              </h2>
              <div className="space-y-2">
                {locataire.dateNaissance && (
                  <Row label="Naissance" value={fmt(locataire.dateNaissance)} />
                )}
                {locataire.typePiece && (
                  <Row label="Pièce" value={`${locataire.typePiece}${locataire.numPieceIdentite ? ` — ${locataire.numPieceIdentite}` : ""}`} />
                )}
                {locataire.dateExpiration && (
                  <Row label="Expire le" value={fmt(locataire.dateExpiration)} />
                )}
              </div>
            </div>
          )}
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

const Row = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  ) : null;
