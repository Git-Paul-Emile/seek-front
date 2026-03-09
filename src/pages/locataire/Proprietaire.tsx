import { Link } from "react-router-dom";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ArrowLeft, Phone, Mail, Home, User, Loader2 } from "lucide-react";
import { useLocataireAuth } from "@/context/LocataireAuthContext";
import { useProprietaireLocataire } from "@/hooks/useProprietaireLocataire";

export default function ProprietaireLocatairePage() {
  const { locataire } = useLocataireAuth();
  const hasBailActif = !!locataire?.bails?.find((b) => b.statut === "ACTIF");
  const { data: proprietaireData, isLoading } = useProprietaireLocataire(hasBailActif);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-[#D4A843]" />
      </div>
    );
  }

  if (!proprietaireData) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Aucun bail actif.</p>
        <Link
          to="/locataire/dashboard"
          className="text-[#D4A843] text-sm font-medium mt-2 inline-block"
        >
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const { proprietaire, bien } = proprietaireData;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: "Mon espace", to: "/locataire/dashboard" }, { label: "Mon propriétaire" }]} />
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/locataire/dashboard"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100
              text-slate-500 hover:text-[#0C1A35] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-1">
              <User className="w-3.5 h-3.5" />
              Mon propriétaire
            </div>
            <h1 className="font-display text-xl font-bold text-[#0C1A35] truncate">
              Informations du propriétaire
            </h1>
          </div>
        </div>
      </div>

      {/* Informations du propriétaire */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D4A843]/10 flex items-center justify-center">
            <User className="w-6 h-6 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0C1A35]">
              {proprietaire.prenom} {proprietaire.nom}
            </h2>
            <p className="text-sm text-slate-500">Propriétaire du bien</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Téléphone */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <Phone className="w-5 h-5 text-[#D4A843]" />
            <div>
              <p className="text-xs text-slate-500">Téléphone</p>
              <p className="text-sm font-semibold text-[#0C1A35]">
                {proprietaire.telephone}
              </p>
            </div>
          </div>

          {/* Email */}
          {proprietaire.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <Mail className="w-5 h-5 text-[#D4A843]" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-semibold text-[#0C1A35]">
                  {proprietaire.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Informations du bien */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#0C1A35]/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-[#0C1A35]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0C1A35]">Mon logement</h2>
            <p className="text-sm text-slate-500">Informations du bien</p>
          </div>
        </div>

        <div className="space-y-3">
          {bien.titre && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Titre</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.titre}</span>
            </div>
          )}
          {bien.adresse && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Adresse</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.adresse}</span>
            </div>
          )}
          {bien.quartier && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Quartier</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.quartier}</span>
            </div>
          )}
          {bien.ville && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Ville</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.ville}</span>
            </div>
          )}
          {bien.region && (
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500">Région</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.region}</span>
            </div>
          )}
          {bien.pays && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Pays</span>
              <span className="text-sm font-semibold text-[#0C1A35]">{bien.pays}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message d'aide */}
      <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          Pour toute question ou préoccupation concernant votre bail, contactez votre propriétaire
          directement en utilisant les coordonnées ci-dessus.
        </p>
      </div>
    </div>
  );
}
