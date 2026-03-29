import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import AuthCallback  from './pages/AuthCallback'; // Added for PR-04
import AppShell      from './components/AppShell';  // PR-03
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ── Auth Callback Route (PR-04) ── */}
        {/* This must be public to handle the redirect from Supabase/Google */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Protected routes wrapped in AppShell (PR-03) ── */}
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