import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import AppShell     from './components/AppShell';  // PR-03
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />




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


        {/* Add more protected pages here:
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <AppShell>
                <Inventory />
              </AppShell>
            </ProtectedRoute>
          }
        />
        */}


        {/* ── Global redirect ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;