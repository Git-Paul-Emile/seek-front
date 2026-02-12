import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AdminLayout } from "@/components/layout/AdminSidebar";
import TenantLayout from "@/components/layout/TenantLayout";
import AgencyLayout from "@/components/layout/AgencyLayout";

import Index from "./pages/Index";
import Guide from "./pages/Guide";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Dashboard from "./pages/Dashboard";
import AdminProperties from "./pages/AdminProperties";
import PropertyManagement from "./pages/PropertyManagement";
import AdminStats from "./pages/AdminStats";
import AdminClients from "./pages/AdminClients";
import AdminSettings from "./pages/AdminSettings";
import AdminTenants from "./pages/AdminTenants";
import NotFound from "./pages/NotFound";
import OwnerRegister from "./pages/OwnerRegister";
import OwnerOnboarding from "./pages/OwnerOnboarding";
import OwnerDashboard from "./pages/OwnerDashboard";
import { LeaseContracts } from "./pages/LeaseContracts";
import { RentPayments } from "./pages/RentPayments";
import ReceiptsPage from "./pages/Receipts";
import ChargesPage from "./pages/Charges";
import { ReminderSettings } from "./pages/ReminderSettings";
import { ReminderHistory } from "./pages/ReminderHistory";
import { Documents } from "./pages/Documents";
import TenantLogin from "./pages/TenantLogin";
import TenantDashboard from "./pages/TenantDashboard";
import TenantProfile from "./pages/TenantProfile";
import TenantRoom from "./pages/TenantRoom";
import TenantProperty from "./pages/TenantProperty";
import TenantCommonSpaces from "./pages/TenantCommonSpaces";
import TenantLease from "./pages/TenantLease";
import TenantPayments from "./pages/TenantPayments";
import TenantCharges from "./pages/TenantCharges";
import TenantFlatmates from "./pages/TenantFlatmates";
import TenantNotifications from "./pages/TenantNotifications";
import TenantNotificationSettings from "./pages/TenantNotificationSettings";
import TenantPersonalSettings from "./pages/TenantPersonalSettings";
import TenantDocuments from "./pages/TenantDocuments";
import TenantReceipts from "./pages/TenantReceipts";

// Pages Agence
import AgencyLogin from "./pages/AgencyLogin";
import AgencyRegister from "./pages/AgencyRegister";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyTeam from "./pages/AgencyTeam";
import AgencyOwners from "./pages/AgencyOwners";
import AgencyProperties from "./pages/AgencyProperties";
import AgencyProfile from "./pages/AgencyProfile";
import AgencySettings from "./pages/AgencySettings";
import AgencyTenants from "./pages/AgencyTenants";
import { AgencyAlerts } from "./pages/AgencyAlerts";
import { AgencyManagementMandates } from "./pages/AgencyManagementMandates";
import AgencyRentManagement from "./pages/AgencyRentManagement";
import AgencyPayments from "./pages/AgencyPayments";
import AgencyChargesPage from "./pages/AgencyCharges";
import AgencyAccounting from "./pages/AgencyAccounting";
import AgencyDocuments from "./pages/AgencyDocuments";
import AgencyMessages from "./pages/AgencyMessages";
import AgencyReports from "./pages/AgencyReports";

const queryClient = new QueryClient();

// Layout pour les pages publiques avec Footer
const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

// Wrapper pour AdminLayout avec Outlet
const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

// Layout pour l'espace propriétaire sans Navbar ni Footer
const OwnerLayout = () => (
  <Outlet />
);

// Layout pour l'espace locataire (colocataire)
const TenantLayoutWrapper = () => (
  <TenantLayout>
    <Outlet />
  </TenantLayout>
);

// Layout pour l'espace agence
const AgencyLayoutWrapper = () => (
  <AgencyLayout />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/annonces" element={<Properties />} />
            <Route path="/annonce/:id" element={<PropertyDetail />} />
            <Route path="/guide" element={<Guide />} />
          </Route>
          
          {/* Routes admin */}
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/property-management" element={<PropertyManagement />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/tenants" element={<AdminTenants />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/leases" element={<LeaseContracts />} />
            <Route path="/admin/rent-payments" element={<RentPayments />} />
            <Route path="/admin/receipts" element={<ReceiptsPage />} />
            <Route path="/admin/charges" element={<ChargesPage />} />
            <Route path="/admin/reminders/settings" element={<ReminderSettings />} />
            <Route path="/admin/reminders/history" element={<ReminderHistory />} />
            <Route path="/admin/documents" element={<Documents />} />
          </Route>
          
          {/* Routes espace propriétaire */}
          <Route element={<OwnerLayout />}>
            <Route path="/owner/register" element={<OwnerRegister />} />
            <Route path="/owner/login" element={<OwnerRegister />} />
            <Route path="/owner/onboarding" element={<OwnerOnboarding />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/properties/new" element={<OwnerDashboard />} />
          </Route>
          
          {/* Routes espace locataire (colocataire) */}
          <Route element={<TenantLayoutWrapper />}>
            <Route path="/tenant/login" element={<TenantLogin />} />
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/room" element={<TenantRoom />} />
            <Route path="/tenant/property" element={<TenantProperty />} />
            <Route path="/tenant/common-spaces" element={<TenantCommonSpaces />} />
            <Route path="/tenant/lease" element={<TenantLease />} />
            <Route path="/tenant/payments" element={<TenantPayments />} />
            <Route path="/tenant/charges" element={<TenantCharges />} />
            <Route path="/tenant/flatmates" element={<TenantFlatmates />} />
            <Route path="/tenant/notifications" element={<TenantNotifications />} />
            <Route path="/tenant/notifications/settings" element={<TenantNotificationSettings />} />
            <Route path="/tenant/documents" element={<TenantDocuments />} />
            <Route path="/tenant/receipts" element={<TenantReceipts />} />
            <Route path="/tenant/profile" element={<TenantProfile />} />
            <Route path="/tenant/personal-settings" element={<TenantPersonalSettings />} />
          </Route>
          
          {/* Routes espace agence */}
          <Route path="/agency/login" element={<AgencyLogin />} />
          <Route path="/agency/register" element={<AgencyRegister />} />
          
          <Route element={<AgencyLayoutWrapper />}>
            <Route path="/agency/dashboard" element={<AgencyDashboard />} />
            <Route path="/agency/team" element={<AgencyTeam />} />
            <Route path="/agency/owners" element={<AgencyOwners />} />
            <Route path="/agency/tenants" element={<AgencyTenants />} />
            <Route path="/agency/properties" element={<AgencyProperties />} />
            <Route path="/agency/property-management" element={<PropertyManagement />} />
            <Route path="/agency/leases" element={<LeaseContracts />} />
            <Route path="/agency/mandates" element={<AgencyManagementMandates />} />
            <Route path="/agency/payments" element={<AgencyPayments />} />
            <Route path="/agency/rent-management" element={<AgencyRentManagement />} />
            <Route path="/agency/receipts" element={<ReceiptsPage />} />
            <Route path="/agency/charges" element={<AgencyChargesPage />} />
            <Route path="/agency/alerts" element={<AgencyAlerts />} />
            <Route path="/agency/reminders/settings" element={<ReminderSettings />} />
            <Route path="/agency/reminders/history" element={<ReminderHistory />} />
            <Route path="/agency/profile" element={<AgencyProfile />} />
            <Route path="/agency/settings" element={<AgencySettings />} />
            <Route path="/agency/accounting" element={<AgencyAccounting />} />
            <Route path="/agency/documents" element={<AgencyDocuments />} />
            <Route path="/agency/messages" element={<AgencyMessages />} />
            <Route path="/agency/reports" element={<AgencyReports />} />
            <Route path="/agency/billing" element={<AgencyDashboard />} />
            <Route path="/agency/notifications" element={<AgencyDashboard />} />
          </Route>
          
          {/* Route legacy - redirect vers admin */}
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
