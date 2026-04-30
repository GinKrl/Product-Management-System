import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login              from './pages/Login';
import Register           from './pages/Register';
import AppShell           from './components/AppShell';
import ProtectedRoute     from './components/ProtectedRoute';
import AuthCallback       from './pages/AuthCallback';
import ProductListPage    from './pages/ProductListPage';
import DeletedItemsPage   from './pages/DeletedItemsPage';
import ProductReportPage  from './pages/ProductReportPage';
import TopSellingPage     from './pages/TopSellingPage';
import UserManagementPage from './pages/UserManagementPage';

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

        {/* 🗑️ Deleted Items Panel */}
        <Route path="/deleted-items" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
            <AppShell><DeletedItemsPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* 📊 Reports Module */}
        <Route path="/reports/products" element={
          <ProtectedRoute requiredRight="REP_001">
            <AppShell><ProductReportPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/reports/top-selling" element={
          <ProtectedRoute requiredRight="REP_002">
            <AppShell><TopSellingPage /></AppShell>
          </ProtectedRoute>
        } />

        {/* 👥 Admin Module */}
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRight="ADM_USER">
            <AppShell><UserManagementPage /></AppShell>
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
