import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import AppShell       from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback   from './pages/AuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Auth callback for Google OAuth ── */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Protected routes wrapped in AppShell ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Redirect "/" to "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;