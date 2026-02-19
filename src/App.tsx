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
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import GuestRoute from "@/components/admin/GuestRoute";
import AdminLayout from "@/components/admin/AdminLayout";

import Index from "./pages/Index";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import TypesLogement from "./pages/admin/categories/TypesLogement";

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
          <Routes>
            {/* Routes publiques */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
            </Route>

            {/* Auth admin — inaccessible si déjà connecté */}
            <Route element={<GuestRoute />}>
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>

            {/* Routes admin protégées — ProtectedRoute vérifie l'auth, AdminLayout fournit le shell */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="biens/categories" element={<TypesLogement />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
