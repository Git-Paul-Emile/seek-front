import React from 'react';
import { Outlet, Route } from 'react-router-dom';
import TenantLayout from '../components/layout/TenantLayout';
import TenantLease from '../pages/TenantLease';
import TenantCharges from '../pages/TenantCharges';
import TenantDashboard from '../pages/TenantDashboard';
import TenantProfile from '../pages/TenantProfile';
import TenantReceipts from '../pages/TenantReceipts';

const TenantLayoutWrapper = () => (
  <TenantLayout>
    <Outlet />
  </TenantLayout>
);

export const TenantRoutes = () => (
  <Route element={<TenantLayoutWrapper />}>
    <Route path="/tenant/dashboard" element={<TenantDashboard />} />
    <Route path="/tenant/room" element={<TenantDashboard />} />
    <Route path="/tenant/lease" element={<TenantLease />} />
    <Route path="/tenant/payments" element={<TenantDashboard />} />
    <Route path="/tenant/charges" element={<TenantCharges />} />
    <Route path="/tenant/flatmates" element={<TenantDashboard />} />
    <Route path="/tenant/notifications" element={<TenantDashboard />} />
    <Route path="/tenant/documents" element={<TenantDashboard />} />
    <Route path="/tenant/receipts" element={<TenantReceipts />} />
    <Route path="/tenant/profile" element={<TenantProfile />} />
  </Route>
);
