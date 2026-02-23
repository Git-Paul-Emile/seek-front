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
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import GuestRoute from "@/components/admin/GuestRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import OwnerGuestRoute from "@/components/owner/OwnerGuestRoute";
import OwnerProtectedRoute from "@/components/owner/OwnerProtectedRoute";
import OwnerLayout from "@/components/owner/OwnerLayout";

import Index from "./pages/Index";
import Proprietaires from "./pages/Proprietaires";
import PublicAnnonceDetail from "./pages/public/AnnonceDetail";
import OwnerRegister from "./pages/owner/Register";
import OwnerLogin from "./pages/owner/Login";
import OwnerDashboard from "./pages/owner/Dashboard";
import BiensList from "./pages/owner/biens/BiensList";
import AddBien from "./pages/owner/biens/AddBien";
import BienDetail from "./pages/owner/biens/BienDetail";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import TypesLogement from "./pages/admin/categories/TypesLogement";
import TypesTransaction from "./pages/admin/categories/TypesTransaction";
import StatutsBien from "./pages/admin/categories/StatutsBien";
import MeubleEquipement from "./pages/admin/categories/MeubleEquipement";
import Annonces from "./pages/admin/Annonces";
import AdminAnnonceDetail from "./pages/admin/AnnonceDetail";

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
            <Routes>
              {/* Routes publiques */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/annonce/:id" element={<PublicAnnonceDetail />} />
              </Route>

              {/* Espace propriétaires — layout dédié */}
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
                  <Route path="/owner/biens" element={<BiensList />} />
                  <Route path="/owner/biens/ajouter" element={<AddBien />} />
                  <Route path="/owner/biens/:id" element={<BienDetail />} />
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
                  <Route path="biens/categories"   element={<TypesLogement />} />
                  <Route path="biens/transactions" element={<TypesTransaction />} />
                  <Route path="biens/statuts"           element={<StatutsBien />} />
                  <Route path="biens/meuble-equipement" element={<MeubleEquipement />} />
                  <Route path="annonces" element={<Annonces />} />
                  <Route path="annonces/:id" element={<AdminAnnonceDetail />} />
                </Route>
              </Route>
            </Routes>
          </OwnerAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
