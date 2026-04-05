import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink, AlertTriangle, Shield, FileSearch, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { InAppNotification, AdminNotifItem } from "@/api/notificationInApp";
import { useMarkOwnerOneNotificationRead, useMarkLocataireOneNotificationRead } from "@/hooks/useNotificationInApp";

// ─── Type helpers ─────────────────────────────────────────────────────────────

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    RAPPEL_LOYER:                    "Rappel de loyer",
    CONFIRMATION_PAIEMENT:           "Paiement confirmé",
    ALERTE_RETARD:                   "Loyer en retard",
    INITIATION_PAIEMENT:             "Initiation de paiement",
    VERIFICATION_LOCATAIRE:          "Vérification locataire",
    PAIEMENT_LOCATAIRE:              "Paiement locataire",
    PREAVIS:                         "Préavis",
    RESILIATION:                     "Résiliation",
    FIN_BAIL:                        "Fin de bail",
    CONTRAT:                         "Contrat",
    ALERTE:                          "Alerte",
    INVITATION_BAIL:                 "Invitation bail",
    PAIEMENT_ESPECES_LOCATAIRE:      "Paiement en espèces",
    CONFIRMATION_ESPECES_PROPRIETAIRE: "Espèces confirmées",
    ETAT_DES_LIEUX_DISPONIBLE:       "État des lieux à valider",
    ETAT_DES_LIEUX_VALIDE:           "État des lieux validé",
    ETAT_DES_LIEUX_MODIFIE:          "État des lieux mis à jour",
  };
  return map[type] ?? type;
}

function typeDot(type: string): string {
  const urgent = ["ALERTE_RETARD", "RESILIATION", "FIN_BAIL", "ALERTE"];
  const success = ["CONFIRMATION_PAIEMENT", "CONFIRMATION_ESPECES_PROPRIETAIRE", "PAIEMENT_LOCATAIRE"];
  if (urgent.includes(type)) return "bg-red-500";
  if (success.includes(type)) return "bg-green-500";
  return "bg-[#D4A843]";
}

function adminIcon(type: string) {
  if (type === "ANNONCE_EN_ATTENTE") return <FileSearch className="w-5 h-5 text-[#D4A843]" />;
  if (type === "VERIFICATION_EN_ATTENTE") return <Shield className="w-5 h-5 text-amber-500" />;
  return <AlertTriangle className="w-5 h-5 text-red-500" />;
}

// ─── Link resolver ────────────────────────────────────────────────────────────

const PAYMENT_TYPES = new Set([
  "RAPPEL_LOYER", "ALERTE_RETARD", "CONFIRMATION_PAIEMENT",
  "INITIATION_PAIEMENT", "PAIEMENT_LOCATAIRE",
  "PAIEMENT_ESPECES_LOCATAIRE", "CONFIRMATION_ESPECES_PROPRIETAIRE",
]);
const BAIL_TYPES = new Set([
  "INVITATION_BAIL", "CONTRAT", "RESILIATION", "FIN_BAIL", "PREAVIS",
]);
const EDL_TYPES = new Set([
  "ETAT_DES_LIEUX_DISPONIBLE", "ETAT_DES_LIEUX_VALIDE", "ETAT_DES_LIEUX_MODIFIE",
]);

function getNotifLink(notif: InAppNotification, role: "owner" | "locataire"): string {
  if (role === "locataire") {
    if (EDL_TYPES.has(notif.type)) return "/locataire/etats-des-lieux";
    if (PAYMENT_TYPES.has(notif.type)) return "/locataire/paiements";
    return "/locataire/dashboard";
  }
  if (PAYMENT_TYPES.has(notif.type) && notif.bienId)
    return `/owner/biens/${notif.bienId}/paiements`;
  if (BAIL_TYPES.has(notif.type) && notif.bienId)
    return `/owner/biens/${notif.bienId}`;
  if (EDL_TYPES.has(notif.type) && notif.bailId)
    return `/owner/bails/${notif.bailId}/etats-des-lieux`;
  if (notif.type === "VERIFICATION_LOCATAIRE")
    return notif.locataireId ? `/owner/locataires/${notif.locataireId}` : "/owner/locataires";
  if (notif.bienId) return `/owner/biens/${notif.bienId}`;
  return "/owner/biens";
}

// ─── Notification item (owner / locataire) ─────────────────────────────────────

function NotifItem({ notif, role, onClose }: { notif: InAppNotification; role: "owner" | "locataire"; onClose: () => void }) {
  const dot = typeDot(notif.type);
  const { mutate: markOwner } = useMarkOwnerOneNotificationRead();
  const { mutate: markLocataire } = useMarkLocataireOneNotificationRead();

  function handleClick() {
    if (!notif.lu) {
      if (role === "owner") markOwner(notif.id);
      else markLocataire(notif.id);
    }
    onClose();
  }

  return (
    <Link
      to={getNotifLink(notif, role)}
      onClick={handleClick}
      className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${notif.lu ? "" : "bg-amber-50/40"}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${notif.lu ? "bg-slate-200" : dot}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${notif.lu ? "text-slate-600" : "text-[#0C1A35]"}`}>
            {notif.sujet ?? typeLabel(notif.type)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Admin notification item ──────────────────────────────────────────────────

function AdminNotifItem({ item }: { item: AdminNotifItem }) {
  return (
    <Link
      to={item.lien}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        {adminIcon(item.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#0C1A35] truncate">{item.titre}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{item.message}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
    </Link>
  );
}

// ─── Props variants ───────────────────────────────────────────────────────────

interface OwnerLocataireProps {
  role: "owner" | "locataire";
  notifications: InAppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  allNotificationsPath: string;
}

interface AdminProps {
  role: "admin";
  items: AdminNotifItem[];
  unreadCount: number;
  allNotificationsPath: string;
}

type NotificationPanelProps = OwnerLocataireProps | AdminProps;

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationPanel(props: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const badgeCount = props.unreadCount;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0C1A35] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-[#0C1A35]">Notifications</span>
            {props.role !== "admin" && (
              <button
                onClick={() => { props.onMarkAllRead(); }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#0C1A35] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {props.role === "admin" ? (
              props.items.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Aucun élément en attente</div>
              ) : (
                props.items.map((item) => <AdminNotifItem key={item.id} item={item} />)
              )
            ) : (
              props.notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">Aucune notification</div>
              ) : (
                props.notifications.slice(0, 8).map((n) => (
                <NotifItem key={n.id} notif={n} role={props.role} onClose={() => setOpen(false)} />
              ))
              )
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to={props.allNotificationsPath}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#D4A843] hover:text-[#b8943e] transition-colors"
            >
              Voir toutes les notifications
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
