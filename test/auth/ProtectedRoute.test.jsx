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

// FIXED: /products is now a plain route with NO ProtectedRoute wrapper
// so redirects land there cleanly without triggering another auth check
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
        {/* FIXED: /products has NO ProtectedRoute — it is only a redirect target */}
        <Route path="/products" element={<ProductsPage />} />

        {/* This is the page being tested with protection */}
        <Route path="/deleted-items" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />

        {/* Also test /products as a protected starting point */}
        <Route path="/products-protected" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<ProductsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading screen while auth and rights are loading', () => {
    useAuth.mockReturnValue({ session: null, loading: true });
    useRightsContext.mockReturnValue({ rights: {}, userRole: null, loadingRights: true });

    render(
      <MemoryRouter initialEntries={['/products-protected']}>
        <Routes>
          <Route path="/products-protected" element={
            <ProtectedRoute>
              <TestDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Verifying Permissions...')).toBeInTheDocument();
  });

  it('redirects to /login when no session (logged out)', () => {
    renderProtected('/deleted-items', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /login when session is null (INACTIVE user signed out by AuthContext)', () => {
    renderProtected('/deleted-items', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('allows access when ACTIVE user has valid session and no restrictions', () => {
    renderProtected('/deleted-items', {
      session: { user: { id: 'active-user-id' } },
      userRole: 'USER'
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('redirects to /products when user lacks required right (non-SUPERADMIN)', () => {
    renderProtected('/deleted-items', {
      session: { user: { id: 'user-id' } },
      requiredRight: 'PRD_DEL',
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      userRole: 'USER',
      rights: { PRD_DEL: 0 }
    });
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('allows SUPERADMIN bypass without checking rights map', () => {
    renderProtected('/deleted-items', {
      session: { user: { id: 'superadmin-id' } },
      requiredRight: 'PRD_DEL',
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      userRole: 'SUPERADMIN',
      rights: {}
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
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
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
