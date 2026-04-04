import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Lock, Trash2, ChevronRight, AlertTriangle } from "lucide-react";
import {
  updateComptePublicApi,
  changePasswordApi,
  deleteComptePublicApi,
} from "@/api/comptePublicAuth";
import { useComptePublicAuth } from "@/context/ComptePublicAuthContext";

type Tab = "profil" | "mot-de-passe" | "supprimer";

export default function MonCompte() {
  const { compte, setCompte, logout, isAuthenticated, isLoading } = useComptePublicAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profil");

  // ─── Profil ───────────────────────────────────────────────────────────────
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  // Sync les champs quand le compte est chargé (useState n'initialise qu'au 1er render)
  useEffect(() => {
    if (compte) {
      setNom(compte.nom);
      setPrenom(compte.prenom);
      setEmail(compte.email ?? "");
    }
  }, [compte]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateComptePublicApi({
        nom: nom.trim() || undefined,
        prenom: prenom.trim() || undefined,
        email: email.trim() || null,
      }),
    onSuccess: (updated) => {
      setCompte(updated);
      toast.success("Profil mis à jour");
    },
    onError: (err: any) => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  // ─── Mot de passe ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () => changePasswordApi({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Mot de passe modifié");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      toast.error("Erreur lors du changement de mot de passe");
    },
  });

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit faire au moins 6 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    changePasswordMutation.mutate();
  };

  // ─── Suppression ──────────────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteComptePublicApi(deletePassword),
    onSuccess: async () => {
      toast.success("Compte supprimé");
      await logout();
      navigate("/");
    },
    onError: (err: any) => {
      toast.error("Erreur lors de la suppression");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0C1A35] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !compte) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Vous devez être connecté pour accéder à cette page.
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profil", label: "Mon profil", icon: <User className="w-4 h-4" /> },
    { key: "mot-de-passe", label: "Mot de passe", icon: <Lock className="w-4 h-4" /> },
    { key: "supprimer", label: "Supprimer le compte", icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0C1A35] mb-6">Mon compte</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? t.key === "supprimer"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#0C1A35] text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* ── Profil ── */}
          {tab === "profil" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-800">Informations personnelles</h2>

              <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                <span className="font-medium text-slate-700">Téléphone :</span>
                {compte.telephone}
                <span className="text-xs ml-auto">(non modifiable)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                />
              </div>

              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="w-full bg-[#0C1A35] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0C1A35]/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
                {!updateMutation.isPending && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* ── Mot de passe ── */}
          {tab === "mot-de-passe" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-800">Changer le mot de passe</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                />
                <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C1A35]/20"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-full bg-[#0C1A35] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0C1A35]/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {changePasswordMutation.isPending ? "Modification…" : "Modifier le mot de passe"}
                {!changePasswordMutation.isPending && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* ── Supprimer ── */}
          {tab === "supprimer" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-base font-semibold text-red-700">Supprimer mon compte</h2>
                  <p className="text-sm text-red-600 mt-1">
                    Cette action est <strong>irréversible</strong>. Tous vos favoris et données
                    seront définitivement supprimés.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmez avec votre mot de passe
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className="text-sm text-slate-700">
                  Je comprends que cette action est définitive et irréversible
                </span>
              </label>

              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending || !deletePassword || !confirmDelete}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? "Suppression…" : "Supprimer définitivement mon compte"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
