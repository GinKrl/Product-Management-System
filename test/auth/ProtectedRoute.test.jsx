import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute.jsx';


import { useAuth } from '../../src/contexts/AuthContext.jsx';
import { useRightsContext } from '../../src/contexts/UserRightsContext.jsx';


vi.mock('../../src/contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({ session: null, loading: false })),
}));


vi.mock('../../src/contexts/UserRightsContext.jsx', () => ({
  UserRightsProvider: ({ children }) => <div>{children}</div>,
  useRightsContext: vi.fn(() => ({ rights: {}, userRole: null, loadingRights: false })),
}));


const TestDashboard = () => <div data-testid="dashboard-content">Dashboard Content</div>;
const LoginPage     = () => <div data-testid="login-page">Login Page</div>;
const ProductsPage  = () => <div data-testid="products-page">Products Page</div>;


const renderProtected = (path = '/products', options = {}) => {
  const {
    allowedRoles  = undefined,
    requiredRight = undefined,
    session       = null,
    userRole      = null,
    rights        = {},
    loadingRights = false,
    loading       = false
  } = options;


  useAuth.mockReturnValue({ session, loading });
  useRightsContext.mockReturnValue({ rights, userRole, loadingRights });


  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {/* FIX: removed /dashboard route — does not exist in the app */}
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />
        <Route path="/deleted-items" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/"         element={<ProductsPage />} />
        <Route path="/products-landing" element={<ProductsPage />} />
      </Routes>
    </MemoryRouter>
  );
};


describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('shows loading screen while auth and rights are loading', () => {
    renderProtected('/products', {
      loading: true,
      loadingRights: true
    });
    expect(screen.getByText('Verifying Permissions...')).toBeInTheDocument();
  });


  it('redirects to /login when no session (logged out)', () => {
    renderProtected('/products', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });


  it('redirects to /login when session is null (INACTIVE user signed out by AuthContext)', () => {
    // INACTIVE users are signed out by AuthContext before reaching ProtectedRoute
    // so they arrive here with session: null and are redirected to /login
    renderProtected('/products', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });


  it('allows access when ACTIVE user has valid session and no restrictions', () => {
    renderProtected('/products', {
      session: { user: { id: 'active-user-id' } },
      userRole: 'USER'
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

it('redirects to /products when user lacks required right (non-SUPERADMIN)', () => {
  renderProtected('/products', {
    session: { user: { id: 'user-id' } },
    requiredRight: 'PRD_DEL',
    userRole: 'USER',
    rights: { PRD_DEL: 0 }
  });
  expect(screen.getByTestId('products-page')).toBeInTheDocument();
});

  it('allows SUPERADMIN bypass without checking rights map', () => {
    renderProtected('/products', {
      session: { user: { id: 'superadmin-id' } },
      requiredRight: 'PRD_DEL',
      userRole: 'SUPERADMIN',
      rights: {} // Empty — SUPERADMIN bypasses
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });


  it('redirects to /products when user role not in allowedRoles', () => {
  renderProtected('/deleted-items', {
    session: { user: { id: 'user-id' } },
    allowedRoles: ['ADMIN', 'SUPERADMIN'],
    userRole: 'USER',
    rights: { PRD_ADD: 1 }
  });
  expect(screen.getByTestId('products-page')).toBeInTheDocument();
});


  it('allows access when user role matches allowedRoles', () => {
    renderProtected('/deleted-items', {
      session: { user: { id: 'admin-id' } },
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      userRole: 'ADMIN',
      rights: { PRD_ADD: 1 }
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });
});