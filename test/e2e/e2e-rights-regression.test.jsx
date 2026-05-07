/**
 * PR-03 | test/e2e/e2e-rights-regression.test.jsx
 * ─────────────────────────────────────────────────
 * M4 — Rights & Authentication Specialist
 * End-to-End Rights Regression Test Log
 *
 * Coverage:
 *   Suite 1 — Auth edge cases          (3 tests)
 *   Suite 2 — USER rights matrix       (6 tests)
 *   Suite 3 — ADMIN rights matrix      (6 tests)
 *   Suite 4 — SUPERADMIN bypass        (6 tests)
 *   Suite 5 — Role-gated routes        (3 tests)
 *   ─────────────────────────────────────────────
 *   TOTAL                              24 tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUseAuth          = vi.fn();
const mockUseRightsContext = vi.fn();

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: () => mockUseRightsContext(),
}));

// ─── Stub Pages ───────────────────────────────────────────────────────────────

const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;
const ProductsPage     = () => <div data-testid="products-page">Products Page</div>;
const LoginPage        = () => <div data-testid="login-page">Login Page</div>;

// ─── Render Helpers ───────────────────────────────────────────────────────────

const renderWithRight = (userType, rights, requiredRight) => {
  mockUseAuth.mockReturnValue({
    session    : { user: { id: 'test-user-e2e' } },
    loading    : false,
    currentUser: { id: 'test-user-e2e', user_type: userType },
  });
  mockUseRightsContext.mockReturnValue({
    userRole     : userType,
    rights,
    loadingRights: false,
  });
  return render(
    <MemoryRouter initialEntries={['/test']}>
      <Routes>
        <Route
          path="/test"
          element={
            <ProtectedRoute requiredRight={requiredRight}>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login"    element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

const renderWithRole = (userType, rights, allowedRoles) => {
  mockUseAuth.mockReturnValue({
    session    : { user: { id: 'test-user-e2e' } },
    loading    : false,
    currentUser: { id: 'test-user-e2e', user_type: userType },
  });
  mockUseRightsContext.mockReturnValue({
    userRole     : userType,
    rights,
    loadingRights: false,
  });
  return render(
    <MemoryRouter initialEntries={['/test']}>
      <Routes>
        <Route
          path="/test"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login"    element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

// ─── Rights Reference Matrix ──────────────────────────────────────────────────
//
//  Right    | USER | ADMIN | SUPERADMIN
//  ---------+------+-------+-----------
//  PRD_ADD  |  ✓   |   ✓   |  ✓ bypass
//  PRD_EDIT |  ✓   |   ✓   |  ✓ bypass
//  PRD_DEL  |  ✗   |   ✗   |  ✓ bypass
//  REP_001  |  ✓   |   ✓   |  ✓ bypass
//  REP_002  |  ✗   |   ✗   |  ✓ bypass
//  ADM_USER |  ✗   |   ✗   |  ✓ bypass

// =============================================================================
//  SUITE 1 — AUTH EDGE CASES
// =============================================================================

describe('[E2E-AUTH] Authentication Edge Cases', () => {
  beforeEach(() => vi.clearAllMocks());

  it('[AUTH-01] Shows loading screen while auth + rights are resolving', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true });
    mockUseRightsContext.mockReturnValue({ rights: {}, userRole: null, loadingRights: true });

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying Permissions...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[AUTH-02] Redirects to /login when session is null', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });
    mockUseRightsContext.mockReturnValue({ rights: {}, userRole: null, loadingRights: false });

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[AUTH-03] Grants access when authenticated with no restrictions', () => {
    mockUseAuth.mockReturnValue({
      session    : { user: { id: 'active-user' } },
      loading    : false,
      currentUser: { id: 'active-user', user_type: 'USER' },
    });
    mockUseRightsContext.mockReturnValue({
      userRole     : 'USER',
      rights       : {},
      loadingRights: false,
    });

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});

// =============================================================================
//  SUITE 2 — USER RIGHTS MATRIX (3 PASS / 3 FAIL)
// =============================================================================

describe('[E2E-MATRIX-USER] USER — Rights Matrix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('[USER-PRD_ADD]  PASS — PRD_ADD=1 grants access', () => {
    renderWithRight('USER', { PRD_ADD: 1 }, 'PRD_ADD');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[USER-PRD_EDIT] PASS — PRD_EDIT=1 grants access', () => {
    renderWithRight('USER', { PRD_EDIT: 1 }, 'PRD_EDIT');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[USER-REP_001]  PASS — REP_001=1 grants access', () => {
    renderWithRight('USER', { REP_001: 1 }, 'REP_001');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[USER-PRD_DEL]  FAIL — PRD_DEL=0 redirects to /products', () => {
    renderWithRight('USER', { PRD_DEL: 0 }, 'PRD_DEL');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[USER-REP_002]  FAIL — REP_002=0 redirects to /products', () => {
    renderWithRight('USER', { REP_002: 0 }, 'REP_002');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[USER-ADM_USER] FAIL — ADM_USER=0 redirects to /products', () => {
    renderWithRight('USER', { ADM_USER: 0 }, 'ADM_USER');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

// =============================================================================
//  SUITE 3 — ADMIN RIGHTS MATRIX (3 PASS / 3 FAIL)
// =============================================================================

describe('[E2E-MATRIX-ADMIN] ADMIN — Rights Matrix', () => {
  beforeEach(() => vi.clearAllMocks());

  it('[ADMIN-PRD_ADD]  PASS — PRD_ADD=1 grants access', () => {
    renderWithRight('ADMIN', { PRD_ADD: 1 }, 'PRD_ADD');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[ADMIN-PRD_EDIT] PASS — PRD_EDIT=1 grants access', () => {
    renderWithRight('ADMIN', { PRD_EDIT: 1 }, 'PRD_EDIT');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[ADMIN-REP_001]  PASS — REP_001=1 grants access', () => {
    renderWithRight('ADMIN', { REP_001: 1 }, 'REP_001');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[ADMIN-PRD_DEL]  FAIL — PRD_DEL=0 redirects to /products', () => {
    renderWithRight('ADMIN', { PRD_DEL: 0 }, 'PRD_DEL');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[ADMIN-REP_002]  FAIL — REP_002=0 redirects to /products', () => {
    renderWithRight('ADMIN', { REP_002: 0 }, 'REP_002');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[ADMIN-ADM_USER] FAIL — ADM_USER=0 redirects to /products', () => {
    renderWithRight('ADMIN', { ADM_USER: 0 }, 'ADM_USER');
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

// =============================================================================
//  SUITE 4 — SUPERADMIN BYPASS (6/6 PASS)
// =============================================================================

describe('[E2E-MATRIX-SUPERADMIN] SUPERADMIN — Full Bypass', () => {
  beforeEach(() => vi.clearAllMocks());

  it('[SA-PRD_ADD]  PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'PRD_ADD');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[SA-PRD_EDIT] PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'PRD_EDIT');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[SA-PRD_DEL]  PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'PRD_DEL');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[SA-REP_001]  PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'REP_001');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[SA-REP_002]  PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'REP_002');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[SA-ADM_USER] PASS (bypass) — no rights map needed', () => {
    renderWithRight('SUPERADMIN', {}, 'ADM_USER');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });
});

// =============================================================================
//  SUITE 5 — ROLE-GATED ROUTES
// =============================================================================

describe('[E2E-ROLES] Role-Gated Route Access', () => {
  beforeEach(() => vi.clearAllMocks());

  it('[ROLE-01] USER blocked from ADMIN+SUPERADMIN-only route', () => {
    renderWithRole('USER', { PRD_ADD: 1 }, ['ADMIN', 'SUPERADMIN']);
    expect(screen.getByTestId('products-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('[ROLE-02] ADMIN granted access to ADMIN+SUPERADMIN-only route', () => {
    renderWithRole('ADMIN', { PRD_ADD: 1 }, ['ADMIN', 'SUPERADMIN']);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });

  it('[ROLE-03] SUPERADMIN granted access to ADMIN+SUPERADMIN-only route', () => {
    renderWithRole('SUPERADMIN', {}, ['ADMIN', 'SUPERADMIN']);
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
  });
});