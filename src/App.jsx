import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

// Placeholders for now
const Dashboard = () => <div className="p-8"><h1>🏠 Welcome Dashboard</h1></div>;
const Inventory = () => <div className="p-8"><h1>📦 Inventory (Db2 Protected)</h1></div>;
const Reports = () => <div className="p-8"><h1>📊 Reports (Db2 Protected)</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* New Protected Routes for the Db2 Data */}
          <Route path="/inventory" element={
            <ProtectedRoute requiredModule="Inventory">
              <Inventory />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute requiredModule="Reports">
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
