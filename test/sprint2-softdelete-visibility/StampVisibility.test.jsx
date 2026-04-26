import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductListPage from '../../src/pages/ProductListPage';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: vi.fn()
}));

vi.mock('../../src/services/productService', () => ({
  getProducts: vi.fn(),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  softDeleteProduct: vi.fn()
}));

import { useAuth } from '../../src/contexts/AuthContext';
import { useRightsContext } from '../../src/contexts/UserRightsContext';
import { getProducts } from '../../src/services/productService';

const renderWithRole = (userType) => {
  useAuth.mockReturnValue({
    session: { user: { id: 'test-user-123' } },
    loading: false,
    currentUser: { id: 'test-user-123', user_type: userType }
  });

  useRightsContext.mockReturnValue({
    userRole: userType,
    rights: {
      PRD_ADD: userType !== 'USER' ? 1 : 0,
      PRD_EDIT: userType !== 'USER' ? 1 : 0,
      PRD_DEL: userType !== 'USER' ? 1 : 0,
      REP_001: 1, REP_002: 1,
      ADM_USER: userType === 'ADMIN' || userType === 'SUPERADMIN' ? 1 : 0
    },
    loadingRights: false
  });

  getProducts.mockResolvedValue([
    { prodcode: 'P001', description: 'Widget A', unit: 'pcs', current_price: 100, record_status: 'ACTIVE', stamp: '2024-01-01 10:00' }
  ]);

  return render(
    <MemoryRouter initialEntries={['/products']}>
      <Routes>
        <Route path="/products" element={<ProductListPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Stamp Column Visibility by Role', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides stamp column when logged in as USER', async () => {
    renderWithRole('USER');
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
    expect(screen.queryByText('Last Updated')).not.toBeInTheDocument();
  });

  it('shows stamp column when logged in as ADMIN', async () => {
    renderWithRole('ADMIN');
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
  });
});

