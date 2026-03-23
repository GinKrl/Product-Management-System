import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import your Page Components
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// 2. Simple placeholders for Sprint 1 (M2/M4 will fill these later)
const Register = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <h1 className="text-2xl font-bold text-slate-800">Register Page (Placeholder)</h1>
  </div>
);

const Products = () => (
  <div className="min-h-screen p-10 bg-slate-50">
    <h1 className="text-2xl font-bold text-slate-800">Inventory Dashboard</h1>
    <p className="text-slate-600 mt-2">Welcome to the protected area.</p>
  </div>
);

const Admin = () => (
  <div className="min-h-screen p-10 bg-slate-50">
    <h1 className="text-2xl font-bold text-red-600">Admin Panel</h1>
    <p className="text-slate-600 mt-2">Superadmin access only.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- Protected Routes (Requires Auth) --- */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />

        {/* --- Callback & Redirects --- */}
        {/* This route is for Google OAuth processing */}
        <Route path="/auth/callback" element={<div className="p-10">Loading session...</div>} />
        
        {/* Redirect root (/) to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Catch-all: Redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;