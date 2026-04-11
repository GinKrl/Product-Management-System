import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import Register       from './pages/Register';
import AppShell       from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback   from './pages/AuthCallback';
import ProductListPage from './pages/ProductListPage'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Auth callback for Google OAuth ── */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Product Masterlist Route (Main Landing Area) ── */}
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

        {/* ── Required Sprint 1 Stub Routes (Add components later) ── */}
        {/* <Route path="/reports" element={<ProtectedRoute><AppShell><div>Reports Page</div></AppShell></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AppShell><div>Admin Page</div></AppShell></ProtectedRoute>} />
        <Route path="/deleted-items" element={<ProtectedRoute><AppShell><div>Deleted Items Page</div></AppShell></ProtectedRoute>} />
        */}

        {/* ── Redirects ── */}
        {/* Catch any old dashboard links and send them to products */}
        <Route path="/dashboard" element={<Navigate to="/products" replace />} />
        
        {/* Default route sends users to the main products page */}
        <Route path="/" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;