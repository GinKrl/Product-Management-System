import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login            from './pages/Login';
import Register         from './pages/Register';
import AppShell         from './components/AppShell';
import ProtectedRoute   from './components/ProtectedRoute';
import AuthCallback     from './pages/AuthCallback';
import ProductListPage  from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';

// PR-01: Reports Module
import ProductReportPage from './pages/ProductReportPage';
import TopSellingPage    from './pages/TopSellingPage';

// 🛑 COMMENTED OUT: Not yet built
// import UserManagementPage from './pages/UserManagementPage';
const PlaceholderAdmin = () => (
  <div style={{ padding: 40, fontFamily: 'DM Sans, sans-serif', color: '#374151' }}>
    <h1 style={{ fontSize: 22, fontWeight: 700 }}>User Management — Coming Soon</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Product Module */}
        <Route path="/products" element={
          <ProtectedRoute>
            <AppShell><ProductListPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* Deleted Items — ADMIN/SUPERADMIN */}
        <Route path="/deleted-items" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <AppShell><DeletedItemsPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* PR-01: Product Report — requires REP_001 right */}
        <Route path="/reports/products" element={
          <ProtectedRoute requiredRight="REP_001">
            <AppShell><ProductReportPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* PR-01: Top Selling — requires REP_002 right */}
        <Route path="/reports/top-selling" element={
          <ProtectedRoute requiredRight="REP_002">
            <AppShell><TopSellingPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* Admin Module — requires ADM_USER right (PR-02) */}
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
