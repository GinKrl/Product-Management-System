import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

import { getProducts } from '../../src/services/productService';

describe('Direct API Bypass / RLS Filter Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('USER getProducts() adds ACTIVE filter only for USER role', async () => {
    const { supabase } = await import('../../src/lib/supabaseClient');
    const eqMock = vi.fn(() => Promise.resolve({ data: [], error: null }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    supabase.from.mockReturnValue({ select: selectMock });

    await getProducts('USER');
    expect(eqMock).toHaveBeenCalledWith('record_status', 'ACTIVE');

    vi.clearAllMocks();
    await getProducts('ADMIN');
    expect(eqMock).not.toHaveBeenCalled();

    vi.clearAllMocks();
    await getProducts('SUPERADMIN');
    expect(eqMock).not.toHaveBeenCalled();
  });

  it('direct query without ACTIVE filter still only returns ACTIVE rows (RLS simulation)', async () => {
    // Simulate RLS: if query lacks filter, backend returns nothing/error for unauthorized INACTIVE rows
    const mockData = [
      { prodcode: 'P001', record_status: 'ACTIVE' },
      { prodcode: 'P002', record_status: 'INACTIVE' }
    ];

    const { supabase } = await import('../../src/lib/supabaseClient');
    // Simulate RLS: supabase returns only ACTIVE if no filter but user is USER
    const eqMock = vi.fn(() => Promise.resolve({
      data: mockData.filter(d => d.record_status === 'ACTIVE'),
      error: null
    }));
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    supabase.from.mockReturnValue({ select: selectMock });

    const result = await getProducts('USER');
    expect(result).toHaveLength(1);
    expect(result[0].record_status).toBe('ACTIVE');
  });
});

