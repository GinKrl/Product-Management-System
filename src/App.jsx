import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login           from './pages/Login';
import Register        from './pages/Register';
import AppShell         from './components/AppShell';
import ProtectedRoute   from './components/ProtectedRoute';
import AuthCallback     from './pages/AuthCallback';
import ProductListPage  from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';

// 🛑 COMMENTED OUT: M2 has not created these files yet
// import ProductReportPage  from './pages/ProductReportPage';
// import TopSellingPage     from './pages/TopSellingPage';
// import UserManagementPage from './pages/UserManagementPage';

// 💡 TEMPORARY PLACEHOLDERS: Prevents the app from crashing while M2 is working
const PlaceholderListing = () => <div className="p-8"><h1>Product Listing Report (Coming Soon)</h1></div>;
const PlaceholderTopSelling = () => <div className="p-8"><h1>Top Selling Report (Coming Soon)</h1></div>;
const PlaceholderAdmin = () => <div className="p-8"><h1>User Management (Coming Soon)</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* 📦 Product Module */}
        <Route path="/products" element={
          <ProtectedRoute>
            <AppShell><ProductListPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* 🗑️ Deleted Items Panel (Gated by Roles) */}
        <Route path="/deleted-items" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <AppShell><DeletedItemsPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* 📊 Reports Module (Gated by Specific Rights) */}
        <Route path="/reports/products" element={
          <ProtectedRoute requiredRight="REP_001">
            <AppShell><PlaceholderListing /></AppShell>
          </ProtectedRoute>
        } />
        
        <Route path="/reports/top-selling" element={
          <ProtectedRoute requiredRight="REP_002">
            <AppShell><PlaceholderTopSelling /></AppShell>
          </ProtectedRoute>
        } />

        {/* 👥 Admin Module (Gated by Specific Right) */}
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRight="ADM_USER">
            <AppShell><PlaceholderAdmin /></AppShell>
          </ProtectedRoute>
        } />

        {/* Fallbacks */}
        <Route path="/dashboard" element={<Navigate to="/products" replace />} />
        <Route path="/"          element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;