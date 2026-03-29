import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

const Products = () => (
  <div className="min-h-screen p-10 bg-slate-50">
    <h1 className="text-2xl font-bold text-slate-800">Inventory Dashboard</h1>
    <p className="text-slate-600 mt-2">Welcome to the protected area.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;