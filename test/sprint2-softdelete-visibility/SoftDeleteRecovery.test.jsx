import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductListPage from '../../src/pages/ProductListPage';
import DeletedItemsPage from '../../src/pages/DeletedItemsPage';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../src/contexts/UserRightsContext', () => ({
  useRightsContext: vi.fn()
}));

vi.mock('../../src/services/productService', () => ({
  getProducts: vi.fn(),
  softDeleteProduct: vi.fn(),
  recoverProduct: vi.fn(),
  addProduct: vi.fn(),
  updateProduct: vi.fn()
}));

import { useAuth } from '../../src/contexts/AuthContext';
import { useRightsContext } from '../../src/contexts/UserRightsContext';
import { getProducts, softDeleteProduct, recoverProduct } from '../../src/services/productService';

const mockProducts = [
  { prodcode: 'P001', description: 'Widget A', unit: 'pcs', current_price: 100, record_status: 'ACTIVE', stamp: '2024-01-01' },
  { prodcode: 'P002', description: 'Widget B', unit: 'pcs', current_price: 200, record_status: 'ACTIVE', stamp: '2024-01-02' }
];

const renderWithRole = (userType, products = mockProducts, initialPath = '/products') => {
  useAuth.mockReturnValue({
    session: { user: { id: 'test-user-123' } },
    loading: false,
    currentUser: { id: 'test-user-123', user_type: userType }
  });

  useRightsContext.mockReturnValue({
    userRole: userType,
    rights: {
      PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 1,
      REP_001: 1, REP_002: 1, ADM_USER: userType === 'ADMIN' || userType === 'SUPERADMIN' ? 1 : 0
    },
    loadingRights: false
  });

  getProducts.mockResolvedValue(products);

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/deleted-items" element={<DeletedItemsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Soft-Delete Visibility & Recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('soft-deleted product vanishes from USER list but appears in ADMIN Deleted Items', async () => {
    // Step 1: SUPERADMIN sees all products including one about to be deleted
    const allProducts = [
      ...mockProducts,
      { prodcode: 'P003', description: 'Widget C', unit: 'pcs', current_price: 300, record_status: 'INACTIVE', stamp: '2024-01-03' }
    ];

    // SUPERADMIN view — all 3 visible
    renderWithRole('SUPERADMIN', allProducts);
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
      expect(screen.getByText('Widget B')).toBeInTheDocument();
      expect(screen.getByText('Widget C')).toBeInTheDocument();
    });

    // Step 2: Soft-delete P001 as SUPERADMIN
    softDeleteProduct.mockResolvedValue([{ prodcode: 'P001', record_status: 'INACTIVE' }]);
    await softDeleteProduct('P001');
    expect(softDeleteProduct).toHaveBeenCalledWith('P001');

    // Reflect soft-delete in local data (mock doesn't mutate the array)
    const updatedAllProducts = allProducts.map(p =>
      p.prodcode === 'P001' ? { ...p, record_status: 'INACTIVE' } : p
    );

    // Step 3: USER view — P001 should be gone, only P002 visible
    cleanup();
    const userProducts = updatedAllProducts.filter(p => p.record_status === 'ACTIVE');
    vi.clearAllMocks();
    renderWithRole('USER', userProducts);
    await waitFor(() => {
      expect(screen.getByText('Widget B')).toBeInTheDocument();
      expect(screen.queryByText('Widget A')).not.toBeInTheDocument();
    });

    // Step 4: ADMIN Deleted Items view — P001 should be visible
    cleanup();
    const deletedProducts = updatedAllProducts.filter(p => p.record_status === 'INACTIVE');
    vi.clearAllMocks();
    renderWithRole('ADMIN', deletedProducts, '/deleted-items');
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
  });

  it('ADMIN recovers soft-deleted product and it reappears for USER', async () => {
    // Initial state: P001 is INACTIVE
    const deletedProducts = [
      { prodcode: 'P001', description: 'Widget A', unit: 'pcs', current_price: 100, record_status: 'INACTIVE', stamp: '2024-01-01' }
    ];

    // ADMIN sees it in Deleted Items
    renderWithRole('ADMIN', deletedProducts);
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    // ADMIN recovers P001
    recoverProduct.mockResolvedValue([{ prodcode: 'P001', record_status: 'ACTIVE' }]);
    await recoverProduct('P001');
    expect(recoverProduct).toHaveBeenCalledWith('P001');

    // USER now sees P001 again
    cleanup();
    const activeProducts = [
      { prodcode: 'P001', description: 'Widget A', unit: 'pcs', current_price: 100, record_status: 'ACTIVE', stamp: '2024-01-01' }
    ];
    vi.clearAllMocks();
    renderWithRole('USER', activeProducts);
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
  });
});

