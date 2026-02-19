import { LayoutDashboard } from "lucide-react";
import { useOwnerAuth } from "@/context/OwnerAuthContext";

export default function OwnerDashboard() {
  const { owner } = useOwnerAuth();

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A843] mb-3">
        <LayoutDashboard className="w-3.5 h-3.5" />
        Dashboard
      </div>
      <h1 className="font-display text-3xl font-bold text-[#0C1A35] leading-tight">
        Bienvenue,{" "}
        <span className="text-[#D4A843]">
          {owner?.prenom} {owner?.nom}
        </span>
      </h1>
      <p className="text-slate-400 mt-1 text-sm">
        Gérez vos biens depuis votre espace propriétaire.
      </p>
    </div>
  );
}
