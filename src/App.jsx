import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRightsProvider } from './contexts/UserRightsContext'; // Import from PR-01
import Login           from './pages/Login';
import Register        from './pages/Register';
import AppShell         from './components/AppShell';
import ProtectedRoute  from './components/ProtectedRoute';
import AuthCallback    from './pages/AuthCallback';
import ProductListPage from './pages/ProductListPage';
import DeletedItemsPage from './pages/DeletedItemsPage';

function App() {
  return (
    <BrowserRouter>
      {/* We wrap the Provider here. 
        Everything inside <Routes> can now use useRights() 
      */}
      <UserRightsProvider>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

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

          <Route path="/dashboard" element={<Navigate to="/products" replace />} />
          <Route path="/"          element={<Navigate to="/products" replace />} />
        </Routes>
      </UserRightsProvider>
    </BrowserRouter>
  );
}

export default App;