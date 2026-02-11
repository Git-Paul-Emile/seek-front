import React from 'react';
import { Outlet, Route } from 'react-router-dom';
import TenantLayout from '../components/layout/TenantLayout';
import TenantLease from '../pages/TenantLease';
import TenantCharges from '../pages/TenantCharges';
import TenantDashboard from '../pages/TenantDashboard';
import TenantProfile from '../pages/TenantProfile';
import TenantReceipts from '../pages/TenantReceipts';
import TenantNotifications from '../pages/TenantNotifications';
import TenantNotificationSettings from '../pages/TenantNotificationSettings';
import TenantPersonalSettings from '../pages/TenantPersonalSettings';
import TenantProperty from '../pages/TenantProperty';
import TenantCommonSpaces from '../pages/TenantCommonSpaces';

const TenantLayoutWrapper = () => (
  <TenantLayout>
    <Outlet />
  </TenantLayout>
);

export const TenantRoutes = () => (
  <Route element={<TenantLayoutWrapper />}>
    <Route path="/tenant/dashboard" element={<TenantDashboard />} />
    <Route path="/tenant/room" element={<TenantDashboard />} />
    <Route path="/tenant/property" element={<TenantProperty />} />
    <Route path="/tenant/common-spaces" element={<TenantCommonSpaces />} />
    <Route path="/tenant/lease" element={<TenantLease />} />
    <Route path="/tenant/payments" element={<TenantDashboard />} />
    <Route path="/tenant/charges" element={<TenantCharges />} />
    <Route path="/tenant/flatmates" element={<TenantDashboard />} />
    <Route path="/tenant/notifications" element={<TenantNotifications />} />
    <Route path="/tenant/notifications/settings" element={<TenantNotificationSettings />} />
    <Route path="/tenant/documents" element={<TenantDashboard />} />
    <Route path="/tenant/receipts" element={<TenantReceipts />} />
    <Route path="/tenant/profile" element={<TenantProfile />} />
    <Route path="/tenant/personal-settings" element={<TenantPersonalSettings />} />
  </Route>
);
