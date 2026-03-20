import { ShieldCheck, Flame, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrustScore {
  total: number;
  badges: ("identite_verifiee" | "hote_actif" | "anciennete_1an")[];
  nbAnnonces: number;
  moisAnciennete: number;
  nbSignalementsNegatifs: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (score >= 50) return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { bar: "bg-red-400", text: "text-red-600", bg: "bg-red-50 border-red-200" };
}

function getScoreLabel(score: number) {
  if (score >= 75) return "Très fiable";
  if (score >= 50) return "Fiable";
  if (score >= 25) return "Peu vérifié";
  return "Non vérifié";
}

const BADGE_META: Record<
  TrustScore["badges"][number],
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  identite_verifiee: { icon: ShieldCheck, label: "Identité vérifiée", color: "text-emerald-600 bg-emerald-50" },
  hote_actif:        { icon: Flame,       label: "Hôte actif",         color: "text-orange-600 bg-orange-50" },
  anciennete_1an:    { icon: Clock,       label: "Ancienneté > 1 an",  color: "text-blue-600 bg-blue-50" },
};

// ─── Composant compact (pour cartes / sidebar) ────────────────────────────────

export function TrustScoreCompact({ score }: { score: TrustScore }) {
  const colors = getScoreColor(score.total);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span>{score.total}/100</span>
      <span className="font-normal opacity-70">- {getScoreLabel(score.total)}</span>
    </div>
  );
}

// ─── Composant complet (pour profil / détail) ─────────────────────────────────

export function TrustScoreFull({ score }: { score: TrustScore }) {
  const colors = getScoreColor(score.total);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#0C1A35] text-sm">Score de confiance</span>
        <span className={`text-2xl font-bold ${colors.text}`}>{score.total}<span className="text-sm font-normal text-slate-400">/100</span></span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${score.total}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${colors.text}`}>{getScoreLabel(score.total)}</p>

      {/* Badges */}
      {score.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {score.badges.filter(b => b !== 'hote_actif').map((b) => {
            const meta = BADGE_META[b];
            const Icon = meta.icon;
            return (
              <span key={b} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Export par défaut = compact ─────────────────────────────────────────────

export default TrustScoreCompact;
