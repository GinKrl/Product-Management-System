import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';


// Create mock functions that can have mockReturnValue called on them
const mockUseAuth = vi.fn();
const mockUseRightsContext = vi.fn();


vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));


vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: () => mockUseRightsContext()
}));


import { useAuth } from '../../src/contexts/AuthContext';
import { useRightsContext } from '../../src/contexts/UserRightsContext';


const TestContent  = () => <div data-testid="protected-content">Protected Content</div>;
const ProductsPage = () => <div data-testid="products-page">Products Page</div>;
const LoginPage    = () => <div data-testid="login-page">Login Page</div>;


const renderWithRight = (userType, rights, requiredRight) => {
  mockUseAuth.mockReturnValue({
    session: { user: { id: 'test-user-123' } },
    loading: false,
    currentUser: { id: 'test-user-123', user_type: userType }
  });


  mockUseRightsContext.mockReturnValue({
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
        <Route path="/products-landing" element={<ProductsPage />} />
        <Route path="/login"    element={<LoginPage />} />
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
   * USER — Per guide Section 2.2 rights matrix:
   *   PRD_ADD=1, PRD_EDIT=1, PRD_DEL=0,
   *   REP_001=1, REP_002=0, ADM_USER=0
   * ================================================================
   */
  describe('USER (per guide Section 2.2 rights matrix)', () => {
    const userType = 'USER';


    // FIX: USER has PRD_ADD=1 in DB — should PASS
    it(`${userType} × PRD_ADD → PASS (USER has this right per rights matrix)`, () => {
      renderWithRight(userType, { PRD_ADD: 1 }, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    // FIX: USER has PRD_EDIT=1 in DB — should PASS
    it(`${userType} × PRD_EDIT → PASS (USER has this right per rights matrix)`, () => {
      renderWithRight(userType, { PRD_EDIT: 1 }, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    // USER has PRD_DEL=0 — correctly FAIL
    it(`${userType} × PRD_DEL → FAIL (USER does not have this right)`, () => {
      renderWithRight(userType, { PRD_DEL: 0 }, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });


    // FIX: USER has REP_001=1 in DB — should PASS
    it(`${userType} × REP_001 → PASS (USER has this right per rights matrix)`, () => {
      renderWithRight(userType, { REP_001: 1 }, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    // USER has REP_002=0 — correctly FAIL
    it(`${userType} × REP_002 → FAIL (USER does not have this right)`, () => {
      renderWithRight(userType, { REP_002: 0 }, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });


    // USER has ADM_USER=0 — correctly FAIL
    it(`${userType} × ADM_USER → FAIL (USER does not have this right)`, () => {
      renderWithRight(userType, { ADM_USER: 0 }, 'ADM_USER');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });


  /**
   * ================================================================
   * ADMIN — Per guide Section 2.2 rights matrix:
   *   PRD_ADD=1, PRD_EDIT=1, PRD_DEL=0,
   *   REP_001=1, REP_002=0, ADM_USER=0
   * ================================================================
   */
  describe('ADMIN (per guide Section 2.2 rights matrix)', () => {
    const userType = 'ADMIN';


    it(`${userType} × PRD_ADD → PASS (ADMIN has this right)`, () => {
      renderWithRight(userType, { PRD_ADD: 1 }, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × PRD_EDIT → PASS (ADMIN has this right)`, () => {
      renderWithRight(userType, { PRD_EDIT: 1 }, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    // FIX: pass PRD_DEL=0 (what ADMIN actually has in DB)
    // ProtectedRoute checks rights[requiredRight]===1 which fails → redirect
    // No hardcoded ADMIN check needed
    it(`${userType} × PRD_DEL → FAIL (ADMIN has PRD_DEL=0 in DB)`, () => {
      renderWithRight(userType, { PRD_DEL: 0 }, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });


    it(`${userType} × REP_001 → PASS (ADMIN has this right)`, () => {
      renderWithRight(userType, { REP_001: 1 }, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    // FIX: pass REP_002=0 (what ADMIN actually has in DB)
    it(`${userType} × REP_002 → FAIL (ADMIN has REP_002=0 in DB)`, () => {
      renderWithRight(userType, { REP_002: 0 }, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });


    // ADMIN has ADM_USER=0 — correctly FAIL
    it(`${userType} × ADM_USER → FAIL (ADMIN has ADM_USER=0 in DB)`, () => {
      renderWithRight(userType, { ADM_USER: 0 }, 'ADM_USER');
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
    const rights   = {}; // Empty map — SUPERADMIN bypass in ProtectedRoute handles this


    it(`${userType} × PRD_ADD → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × PRD_EDIT → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × PRD_DEL → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'PRD_DEL');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × REP_001 → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × REP_002 → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'REP_002');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });


    it(`${userType} × ADM_USER → PASS (bypass)`, () => {
      renderWithRight(userType, rights, 'ADM_USER');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });
  });
});