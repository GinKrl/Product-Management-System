import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: vi.fn()
}));

import { useAuth } from '../../src/contexts/AuthContext';
import { useRightsContext } from '../../src/contexts/UserRightsContext';

const TestContent = () => <div data-testid="protected-content">Protected Content</div>;
const ProductsPage = () => <div data-testid="products-page">Products Page</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;

const renderWithRight = (userType, rights, requiredRight) => {
  useAuth.mockReturnValue({
    session: { user: { id: 'test-user-123' } },
    loading: false,
    currentUser: { id: 'test-user-123', user_type: userType }
  });

  useRightsContext.mockReturnValue({
    userRole: userType,
    rights,
    loadingRights: false
  });

  return render(
    <MemoryRouter initialEntries={['/test-route']}>
      <Routes>
        <Route
          path="/test-route"
          element={
            <ProtectedRoute requiredRight={requiredRight}>
              <TestContent />
            </ProtectedRoute>
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Rights Matrix — 3 User Types × 6 Rights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * ================================================================
   * USER — No special rights assigned
   * Expected: All 6 rights → FAIL (redirect to /products)
   * ================================================================
   */
  describe('USER (no rights)', () => {
    const userType = 'USER';
    const rights = {};

    it(`${userType} × PRD_ADD → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'PRD_ADD');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_EDIT → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'PRD_EDIT');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_DEL → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_001 → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'REP_001');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_002 → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × ADM_USER → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, rights, 'ADM_USER');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  /**
   * ================================================================
   * ADMIN — Product + Report rights (limited access)
   * Expected: PRD_ADD, PRD_EDIT, REP_001 → PASS
   *           PRD_DEL, REP_002, ADM_USER → FAIL
   * ================================================================
   */
  describe('ADMIN (limited access - cannot delete products or run REP_002)', () => {
    const userType = 'ADMIN';

    it(`${userType} × PRD_ADD → PASS (renders protected content)`, () => {
      renderWithRight(userType, { PRD_ADD: 1 }, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_EDIT → PASS (renders protected content)`, () => {
      renderWithRight(userType, { PRD_EDIT: 1 }, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_DEL → FAIL (redirects to /products) - ADMIN cannot delete products`, () => {
      renderWithRight(userType, { PRD_DEL: 1 }, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_001 → PASS (renders protected content)`, () => {
      renderWithRight(userType, { REP_001: 1 }, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_002 → FAIL (redirects to /products) - ADMIN cannot run REP_002`, () => {
      renderWithRight(userType, { REP_002: 1 }, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × ADM_USER → FAIL (redirects to /products)`, () => {
      renderWithRight(userType, {}, 'ADM_USER');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  /**
   * ================================================================
   * SUPERADMIN — Bypass grants all rights unconditionally
   * Expected: All 6 rights → PASS (even with empty rights map)
   * ================================================================
   */
  describe('SUPERADMIN (bypass — all rights granted)', () => {
    const userType = 'SUPERADMIN';
    const rights = {}; // Empty map — bypass grants all access

    it(`${userType} × PRD_ADD → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_EDIT → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_DEL → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_DEL');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_001 → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_002 → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'REP_002');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × ADM_USER → PASS (renders protected content via bypass)`, () => {
      renderWithRight(userType, rights, 'ADM_USER');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });
  });
});
