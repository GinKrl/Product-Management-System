import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';

const mockUseAuth = vi.fn();
const mockUseRightsContext = vi.fn();

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: () => mockUseRightsContext()
}));

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
        <Route path="/login"    element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Rights Matrix — 3 User Types × 6 Rights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('USER (per guide Section 2.2 rights matrix)', () => {
    const userType = 'USER';

    it(`${userType} × PRD_ADD → PASS`, () => {
      renderWithRight(userType, { PRD_ADD: 1 }, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_EDIT → PASS`, () => {
      renderWithRight(userType, { PRD_EDIT: 1 }, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_DEL → FAIL`, () => {
      renderWithRight(userType, { PRD_DEL: 0 }, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_001 → PASS`, () => {
      renderWithRight(userType, { REP_001: 1 }, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_002 → FAIL`, () => {
      renderWithRight(userType, { REP_002: 0 }, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × ADM_USER → FAIL`, () => {
      renderWithRight(userType, { ADM_USER: 0 }, 'ADM_USER');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('ADMIN (per guide Section 2.2 rights matrix)', () => {
    const userType = 'ADMIN';

    it(`${userType} × PRD_ADD → PASS`, () => {
      renderWithRight(userType, { PRD_ADD: 1 }, 'PRD_ADD');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_EDIT → PASS`, () => {
      renderWithRight(userType, { PRD_EDIT: 1 }, 'PRD_EDIT');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × PRD_DEL → FAIL`, () => {
      renderWithRight(userType, { PRD_DEL: 0 }, 'PRD_DEL');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_001 → PASS`, () => {
      renderWithRight(userType, { REP_001: 1 }, 'REP_001');
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('products-page')).not.toBeInTheDocument();
    });

    it(`${userType} × REP_002 → FAIL`, () => {
      renderWithRight(userType, { REP_002: 0 }, 'REP_002');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it(`${userType} × ADM_USER → FAIL`, () => {
      renderWithRight(userType, { ADM_USER: 0 }, 'ADM_USER');
      expect(screen.getByTestId('products-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('SUPERADMIN (bypass — all rights granted)', () => {
    const userType = 'SUPERADMIN';
    const rights   = {};

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
