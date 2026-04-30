import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute.jsx';

// Import hooks for mocking
import { useAuth } from '../../src/contexts/AuthContext.jsx';
import { useRightsContext } from '../../src/contexts/UserRightsContext.jsx';

// Mock with default returns - but allow override with mockReturnValue
vi.mock('../../src/contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({ session: null, loading: false })),
}));

vi.mock('../../src/contexts/UserRightsContext.jsx', () => ({
  UserRightsProvider: ({ children }) => <div>{children}</div>,
  useRightsContext: vi.fn(() => ({ rights: {}, userRole: null, loadingRights: false })),
}));

const TestDashboard = () => <div data-testid="dashboard-content">Dashboard Content</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const ProductsPage = () => <div data-testid="products-page">Products Page</div>;

const renderProtected = (path = '/', options = {}) => {
  const { 
    allowedRoles = undefined, 
    requiredRight = undefined, 
    session = null, 
    userRole = null, 
    rights = {},
    loadingRights = false,
    loading = false
  } = options;
  
  // Set up mocks before render
  useAuth.mockReturnValue({ session, loading });
  useRightsContext.mockReturnValue({ rights, userRole, loadingRights });
  
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={allowedRoles} requiredRight={requiredRight}>
            <TestDashboard />
          </ProtectedRoute>
        } />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading screen while auth and rights are loading', () => {
    renderProtected('/', { 
      loading: true, 
      loadingRights: true 
    });
    expect(screen.getByText('Verifying Permissions...')).toBeInTheDocument();
  });

  it('redirects to /login when no session (logged out)', () => {
    renderProtected('/dashboard', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /login when session is null (INACTIVE user treated as signed out)', () => {
    // INACTIVE users in AuthContext get session = null and are redirected to /login
    renderProtected('/dashboard', { session: null });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

it('allows access when ACTIVE user has valid session without restrictions', () => {
    // Session exists with userRole and no requiredRight or allowedRoles - should allow
    // Use /dashboard which HAS ProtectedRoute wrapper
    renderProtected('/dashboard', { 
      session: { user: { id: 'active-user-id' } },
      userRole: 'USER' // Need userRole to be set, otherwise ProtectedRoute blocks
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('redirects to /products when user lacks required right (non-SUPERADMIN)', () => {
    renderProtected('/dashboard', { 
      session: { user: { id: 'user-id' } },
      requiredRight: 'PRD_DEL',
      userRole: 'USER',
      rights: {} // No PRD_DEL right
    });
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('allows SUPERADMIN bypass without checking rights', () => {
    renderProtected('/dashboard', { 
      session: { user: { id: 'superadmin-id' } },
      requiredRight: 'PRD_DEL',
      userRole: 'SUPERADMIN',
      rights: {} // Empty - SUPERADMIN bypasses
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('redirects to /products when user role not in allowedRoles', () => {
    renderProtected('/dashboard', { 
      session: { user: { id: 'user-id' } },
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      userRole: 'USER', // Not in allowedRoles
      rights: { PRD_ADD: 1 }
    });
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
  });

  it('allows access when user role matches allowedRoles', () => {
    renderProtected('/dashboard', { 
      session: { user: { id: 'admin-id' } },
      allowedRoles: ['ADMIN', 'SUPERADMIN'],
      userRole: 'ADMIN',
      rights: { PRD_ADD: 1 }
    });
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });
});
