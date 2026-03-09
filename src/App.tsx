import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { OwnerAuthProvider } from "@/context/OwnerAuthContext";
import { LocataireAuthProvider } from "@/context/LocataireAuthContext";
import { ComptePublicAuthProvider } from "@/context/ComptePublicAuthContext";
import { FavorisAuthModalProvider } from "@/context/FavorisAuthModalContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import GuestRoute from "@/components/admin/GuestRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import OwnerGuestRoute from "@/components/owner/OwnerGuestRoute";
import OwnerProtectedRoute from "@/components/owner/OwnerProtectedRoute";
import OwnerLayout from "@/components/owner/OwnerLayout";
import LocataireGuestRoute from "@/components/locataire/LocataireGuestRoute";
import LocataireProtectedRoute from "@/components/locataire/LocataireProtectedRoute";
import LocataireLayout from "@/components/locataire/LocataireLayout";

import Index from "./pages/Index";
import Proprietaires from "./pages/Proprietaires";
import PublicAnnonceDetail from "./pages/public/AnnonceDetail";
import RecherchePage from "./pages/public/Recherche";
import OwnerRegister from "./pages/owner/Register";
import OwnerLogin from "./pages/owner/Login";
import OwnerDashboard from "./pages/owner/Dashboard";
import OwnerVerification from "./pages/owner/Verification";
import HistoriquePaiements from "./pages/owner/HistoriquePaiements";
import Profile from "./pages/owner/Profile";
import BiensList from "./pages/owner/biens/BiensList";
import AddBien from "./pages/owner/biens/AddBien";
import BienDetail from "./pages/owner/biens/BienDetail";
import PaiementsPage from "./pages/owner/biens/PaiementsPage";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import TypesLogement from "./pages/admin/categories/TypesLogement";
import TypesTransaction from "./pages/admin/categories/TypesTransaction";
import StatutsBien from "./pages/admin/categories/StatutsBien";
import MeubleEquipement from "./pages/admin/categories/MeubleEquipement";
import Annonces from "./pages/admin/Annonces";
import AdminAnnonceDetail from "./pages/admin/AnnonceDetail";
import AdminVerificationsPage from "./pages/admin/Verifications";
import ProprietairesStats from "./pages/admin/ProprietairesStats";
import PaysPage from "./pages/admin/geo/PaysPage";
import VillesPage from "./pages/admin/geo/VillesPage";
import QuartiersPage from "./pages/admin/geo/QuartiersPage";
import SuspensionsPage from "./pages/admin/Suspensions";
import UtilisateursPage from "./pages/admin/Utilisateurs";
import LocatairesList from "./pages/owner/locataires/LocatairesList";
import AddLocataire from "./pages/owner/locataires/AddLocataire";
import LocataireDetail from "./pages/owner/locataires/LocataireDetail";
import LocataireActivate from "./pages/locataire/Activate";
import LocataireLogin from "./pages/locataire/Login";
import LocataireForgotPassword from "./pages/locataire/ForgotPassword";
import LocataireResetPassword from "./pages/locataire/ResetPassword";
import LocataireDashboard from "./pages/locataire/Dashboard";
import LocataireProfil from "./pages/locataire/Profil";
import PaiementsLocatairePage from "./pages/locataire/PaiementsLocatairePage";
import ProprietaireLocatairePage from "./pages/locataire/Proprietaire";
import HistoriqueLogement from "./pages/locataire/HistoriqueLogement";
import DocumentsBien from "./pages/locataire/DocumentsBien";
import EtatsDesLieux from "./pages/locataire/EtatsDesLieux";
import OwnerForgotPassword from "./pages/owner/ForgotPassword";
import OwnerResetPassword from "./pages/owner/ResetPassword";
import AdminSignalements from "./pages/admin/Signalements";
import AdminSignalementDetail from "./pages/admin/SignalementDetail";
import AdminTransactions from "./pages/admin/TransactionsAdmin";
import AdminPromotions from "./pages/admin/PromotionsAdmin";
import AdminFormulesPremium from "./pages/admin/FormulesPremium";
import AdminLocataireDocuments from "./pages/admin/LocataireDocuments";
import AdminStatsRevenus from "./pages/admin/StatsRevenus";
import ModelesContratPage from "./pages/admin/contrats/ModelesContratPage";
import StatsVues from "./pages/owner/StatsVues";
import ContratLocataire from "./pages/locataire/Contrat";
import FavorisPage from "./pages/public/Favoris";

const queryClient = new QueryClient();

// Layout pour les pages publiques avec Navbar + Footer
const PublicLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="overflow-x-clip">
      <Navbar />
      <main className={`min-h-screen ${isHome ? "" : "pt-16"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ComptePublicAuthProvider>
          <FavorisAuthModalProvider>
          <OwnerAuthProvider>
            <LocataireAuthProvider>
              <Routes>
                {/* Routes publiques */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/annonces" element={<RecherchePage />} />
                  <Route path="/recherche" element={<RecherchePage />} />
                  <Route path="/annonce/:id" element={<PublicAnnonceDetail />} />
                  <Route path="/favoris" element={<FavorisPage />} />
                </Route>

                {/* Espace propriétaires — landing */}
                <Route path="/proprietaires" element={<Proprietaires />} />

                {/* Owner — inaccessible si déjà connecté */}
                <Route element={<OwnerGuestRoute />}>
                  <Route path="/owner/register" element={<OwnerRegister />} />
                  <Route path="/owner/login" element={<OwnerLogin />} />
                </Route>

                {/* Owner — mot de passe (public) */}
                <Route path="/owner/forgot-password" element={<OwnerForgotPassword />} />
                <Route path="/owner/reset-password" element={<OwnerResetPassword />} />

                {/* Owner — protégées */}
                <Route element={<OwnerProtectedRoute />}>
                  <Route element={<OwnerLayout />}>
                    <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                    <Route path="/owner/verification" element={<OwnerVerification />} />
                    <Route path="/owner/profile" element={<Profile />} />
                    <Route path="/owner/paiements" element={<HistoriquePaiements />} />
                    <Route path="/owner/biens" element={<BiensList />} />
                    <Route path="/owner/biens/ajouter" element={<AddBien />} />
                    <Route path="/owner/biens/:id" element={<BienDetail />} />
                    <Route path="/owner/biens/:id/paiements" element={<PaiementsPage />} />
                    <Route path="/owner/locataires" element={<LocatairesList />} />
                    <Route path="/owner/locataires/ajouter" element={<AddLocataire />} />
                    <Route path="/owner/locataires/:id" element={<LocataireDetail />} />
                    <Route path="/owner/stats/vues" element={<StatsVues />} />
                  </Route>
                </Route>

                {/* Locataire — pages publiques */}
                <Route path="/locataire/activer" element={<LocataireActivate />} />
                <Route path="/locataire/reset-password" element={<LocataireResetPassword />} />

                {/* Locataire — inaccessible si déjà connecté */}
                <Route element={<LocataireGuestRoute />}>
                  <Route path="/locataire/login" element={<LocataireLogin />} />
                  <Route path="/locataire/forgot-password" element={<LocataireForgotPassword />} />
                </Route>

                {/* Locataire — protégées */}
                <Route element={<LocataireProtectedRoute />}>
                  <Route element={<LocataireLayout />}>
                    <Route path="/locataire/dashboard" element={<LocataireDashboard />} />
                    <Route path="/locataire/profil" element={<LocataireProfil />} />
                    <Route path="/locataire/paiements" element={<PaiementsLocatairePage />} />
                    <Route path="/locataire/proprietaire" element={<ProprietaireLocatairePage />} />
                    <Route path="/locataire/historique" element={<HistoriqueLogement />} />
                    <Route path="/locataire/documents" element={<DocumentsBien />} />
                    <Route path="/locataire/etat-des-lieux" element={<EtatsDesLieux />} />
                    <Route path="/locataire/contrat" element={<ContratLocataire />} />
                  </Route>
                </Route>

                {/* Auth admin — inaccessible si déjà connecté */}
                <Route element={<GuestRoute />}>
                  <Route path="/admin/login" element={<AdminLogin />} />
                </Route>

                {/* Routes admin protégées */}
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="biens/categories"        element={<TypesLogement />} />
                    <Route path="biens/transactions"      element={<TypesTransaction />} />
                    <Route path="biens/statuts"           element={<StatutsBien />} />
                    <Route path="biens/meuble-equipement" element={<MeubleEquipement />} />
                    <Route path="annonces"                element={<Annonces />} />
                    <Route path="annonces/:id"            element={<AdminAnnonceDetail />} />
                    <Route path="verifications"             element={<AdminVerificationsPage />} />
                    <Route path="proprietaires"          element={<ProprietairesStats />} />
                    <Route path="utilisateurs/:type" element={<UtilisateursPage />} />
                    <Route path="suspensions"           element={<SuspensionsPage />} />
                    <Route path="geo/pays"                element={<PaysPage />} />
                    <Route path="geo/villes"              element={<VillesPage />} />
                    <Route path="geo/quartiers"           element={<QuartiersPage />} />
                    <Route path="signalements"            element={<AdminSignalements />} />
                    <Route path="signalements/:id"        element={<AdminSignalementDetail />} />
                    <Route path="transactions"            element={<AdminTransactions />} />
                    <Route path="premium/historique"      element={<AdminPromotions />} />
                    <Route path="premium/formules"        element={<AdminFormulesPremium />} />
                    <Route path="locataires/:id/documents" element={<AdminLocataireDocuments />} />
                    <Route path="stats/revenus"            element={<AdminStatsRevenus />} />
                    <Route path="contrats/modeles"         element={<ModelesContratPage />} />
                  </Route>
                </Route>
              </Routes>
            </LocataireAuthProvider>
          </OwnerAuthProvider>
          </FavorisAuthModalProvider>
          </ComptePublicAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
