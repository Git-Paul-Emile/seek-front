import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { OwnerAuthProvider } from "@/context/OwnerAuthContext";
import { LocataireAuthProvider } from "@/context/LocataireAuthContext";
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
import OwnerRegister from "./pages/owner/Register";
import OwnerLogin from "./pages/owner/Login";
import OwnerDashboard from "./pages/owner/Dashboard";
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
import LocatairesList from "./pages/owner/locataires/LocatairesList";
import AddLocataire from "./pages/owner/locataires/AddLocataire";
import LocataireDetail from "./pages/owner/locataires/LocataireDetail";
import LocataireActivate from "./pages/locataire/Activate";
import LocataireLogin from "./pages/locataire/Login";
import LocataireDashboard from "./pages/locataire/Dashboard";
import PaiementsLocatairePage from "./pages/locataire/PaiementsLocatairePage";

const queryClient = new QueryClient();

// Layout pour les pages publiques avec Navbar + Footer
const PublicLayout = () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Outlet />
    </main>
    <Footer />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OwnerAuthProvider>
            <LocataireAuthProvider>
              <Routes>
                {/* Routes publiques */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/annonce/:id" element={<PublicAnnonceDetail />} />
                </Route>

                {/* Espace propriétaires — landing */}
                <Route path="/proprietaires" element={<Proprietaires />} />

                {/* Owner — inaccessible si déjà connecté */}
                <Route element={<OwnerGuestRoute />}>
                  <Route path="/owner/register" element={<OwnerRegister />} />
                  <Route path="/owner/login" element={<OwnerLogin />} />
                </Route>

                {/* Owner — protégées */}
                <Route element={<OwnerProtectedRoute />}>
                  <Route element={<OwnerLayout />}>
                    <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                    <Route path="/owner/profile" element={<Profile />} />
                    <Route path="/owner/biens" element={<BiensList />} />
                    <Route path="/owner/biens/ajouter" element={<AddBien />} />
                    <Route path="/owner/biens/:id" element={<BienDetail />} />
                    <Route path="/owner/biens/:id/paiements" element={<PaiementsPage />} />
                    <Route path="/owner/locataires" element={<LocatairesList />} />
                    <Route path="/owner/locataires/ajouter" element={<AddLocataire />} />
                    <Route path="/owner/locataires/:id" element={<LocataireDetail />} />
                  </Route>
                </Route>

                {/* Locataire — activation (publique, token dans URL) */}
                <Route path="/locataire/activer" element={<LocataireActivate />} />

                {/* Locataire — inaccessible si déjà connecté */}
                <Route element={<LocataireGuestRoute />}>
                  <Route path="/locataire/login" element={<LocataireLogin />} />
                </Route>

                {/* Locataire — protégées */}
                <Route element={<LocataireProtectedRoute />}>
                  <Route element={<LocataireLayout />}>
                    <Route path="/locataire/dashboard" element={<LocataireDashboard />} />
                    <Route path="/locataire/paiements" element={<PaiementsLocatairePage />} />
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
                  </Route>
                </Route>
              </Routes>
            </LocataireAuthProvider>
          </OwnerAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
