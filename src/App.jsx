import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';

// Placeholders for now (Felix: These will stay public until PR-02)
const Dashboard = () => <div className="p-8"><h1>🏠 Welcome Dashboard</h1></div>;
const Inventory = () => <div className="p-8"><h1>📦 Inventory (Protection coming in PR-02)</h1></div>;
const Reports = () => <div className="p-8"><h1>📊 Reports (Protection coming in PR-02)</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* PR-01 Status: Routes are defined but NOT yet protected */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
