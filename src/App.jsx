import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login                   from './pages/Login';
import Register                from './pages/Register';
import AppShell                from './components/AppShell';
import ProtectedRoute          from './components/ProtectedRoute';
import AuthCallback            from './pages/AuthCallback';
import ProductListPage         from './pages/ProductListPage';
import DeletedItemsPage        from './pages/DeletedItemsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Product Masterlist ── */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppShell>
                <ProductListPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── PR-03 / PR-04: Deleted Items — ADMIN / SUPERADMIN only ── */}
        <Route
          path="/deleted-items"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
              <AppShell>
                <DeletedItemsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* ── Redirects ── */}
        <Route path="/dashboard" element={<Navigate to="/products" replace />} />
        <Route path="/"          element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
