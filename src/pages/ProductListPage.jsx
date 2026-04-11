import React, { useState } from 'react';

// --- DUMMY DATA ---
const DUMMY_PRODUCTS = [
  { id: 1, prodCode: 'ITM-1001', description: 'Ergonomic Office Chair',       unit: 'pcs', currentPrice: 149.99, status: 'ACTIVE',   stamp: 'Updated 2 hrs ago' },
  { id: 2, prodCode: 'ITM-1002', description: 'Wireless Mechanical Keyboard',  unit: 'pcs', currentPrice: 89.50,  status: 'ACTIVE',   stamp: 'Updated yesterday' },
  { id: 3, prodCode: 'ITM-1003', description: '27-inch 4K Monitor',            unit: 'pcs', currentPrice: 320.00, status: 'INACTIVE', stamp: 'Discontinued' },
  { id: 4, prodCode: 'ITM-1004', description: 'USB-C Hub (7-in-1)',             unit: 'pcs', currentPrice: 24.99,  status: 'ACTIVE',   stamp: 'Updated last week' },
  { id: 5, prodCode: 'ITM-1005', description: 'Standing Desk Frame',            unit: 'set', currentPrice: 210.00, status: 'INACTIVE', stamp: 'Out of stock' },
];

const ProductListPage = () => {
  const [currentUserRole, setCurrentUserRole] = useState('ADMIN');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const isAdmin = currentUserRole === 'ADMIN';

  const visibleProducts = DUMMY_PRODUCTS.filter(p => {
    if (!isAdmin && p.status !== 'ACTIVE') return false;
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.description.toLowerCase().includes(q) || p.prodCode.toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = DUMMY_PRODUCTS.filter(p => p.status === 'ACTIVE').length;
  const totalCount  = isAdmin ? DUMMY_PRODUCTS.length : activeCount;
  const totalValue  = DUMMY_PRODUCTS
    .filter(p => isAdmin || p.status === 'ACTIVE')
    .reduce((s, p) => s + p.currentPrice, 0)
    .toFixed(2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

        .plp-bg {
          background: linear-gradient(160deg, #f8f9fc 0%, #f0f2f5 100%);
          min-height: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        /* TOP BAR */
        .plp-topbar {
          position: sticky; top: 0; z-index: 20;
          background: rgba(248,249,252,0.88);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 18px 32px;
          display: flex; align-items: center; justify-content: space-between;
          animation: fadeUp .38s ease both .04s;
        }
        .plp-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
        .dev-badge {
          font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #7c3aed; background: #f5f3ff; padding: 2px 8px; border-radius: 999px;
        }
        .plp-title {
          font-family: 'DM Serif Display', serif;
          font-size: 25px; color: #0f0a1e; margin: 0; letter-spacing: -0.4px;
        }
        .plp-subtitle { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }

        .role-switcher {
          display: flex; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 10px; padding: 3px; gap: 2px;
        }
        .role-btn {
          padding: 6px 16px; border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .18s ease;
          background: transparent; color: #9ca3af;
        }
        .role-btn.active {
          background: linear-gradient(135deg, #7f1d1d, #b91c1c 55%, #e11d48);
          color: #fff; box-shadow: 0 2px 8px rgba(185,28,28,0.25);
        }
        .role-btn:not(.active):hover { color: #374151; background: #f9fafb; }

        .plp-actions { display: flex; align-items: center; gap: 10px; }

        .add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 12px; border: none;
          color: #fff; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #7f1d1d, #b91c1c 55%, #e11d48);
          box-shadow: 0 4px 16px rgba(185,28,28,0.32);
          transition: transform .15s, box-shadow .15s;
        }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(185,28,28,0.40); }
        .add-btn:active { transform: translateY(0); }

        /* BODY */
        .plp-body { padding: 24px 32px; display: flex; flex-direction: column; gap: 22px; }

        /* STAT CARDS */
        .stat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
          animation: fadeUp .38s ease both .08s;
        }
        .stat-card {
          background: #fff; border-radius: 18px; padding: 20px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          position: relative; overflow: hidden;
          transition: transform .2s, box-shadow .2s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.09); }
        .stat-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 18px 18px 0 0;
        }
        .stat-inner { display: flex; align-items: flex-start; justify-content: space-between; }
        .stat-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #9ca3af; margin: 0 0 10px; }
        .stat-value { font-size: 30px; font-weight: 700; margin: 0; letter-spacing: -1px; }
        .stat-trend { font-size: 11px; color: #d1d5db; margin: 6px 0 0; }
        .stat-icon  { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* TABLE PANEL */
        .table-panel {
          background: #fff; border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          overflow: hidden; animation: fadeUp .38s ease both .16s;
        }
        .panel-toolbar {
          padding: 16px 24px; border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .panel-title { font-size: 13px; font-weight: 700; color: #0f0a1e; margin: 0; }
        .panel-sub   { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }
        .toolbar-right { display: flex; align-items: center; gap: 8px; }

        .filter-chip {
          padding: 5px 13px; border-radius: 20px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.04em; cursor: pointer; border: 1px solid #e5e7eb;
          background: transparent; color: #9ca3af; font-family: 'DM Sans', sans-serif;
          transition: all .15s;
        }
        .filter-chip:hover { border-color: #d1d5db; color: #374151; }
        .filter-chip.f-all      { border-color: #b91c1c; background: #fef2f2; color: #b91c1c; }
        .filter-chip.f-active   { border-color: #bbf7d0; background: #f0fdf4; color: #16a34a; }
        .filter-chip.f-inactive { border-color: #fde68a; background: #fffbeb; color: #d97706; }

        .search-wrap {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; background: #f9fafb;
          border: 1px solid #e5e7eb; border-radius: 12px; width: 200px;
          cursor: text; transition: border-color .15s;
        }
        .search-wrap:focus-within { border-color: #fca5a5; }
        .search-input {
          background: transparent; border: none; outline: none;
          font-size: 12px; color: #374151; width: 100%; font-family: 'DM Sans', sans-serif;
        }
        .search-input::placeholder { color: #9ca3af; }

        /* table */
        .plp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .plp-table thead tr { background: linear-gradient(90deg, #fafafa, #f7f8fa); }
        .plp-table th {
          padding: 12px 24px; font-size: 10px; font-weight: 700;
          color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;
        }
        .plp-table th.right  { text-align: right; }
        .plp-table th.center { text-align: center; }
        .plp-table tbody tr  { border-top: 1px solid #f3f4f6; transition: background .12s; }
        .plp-table tbody tr:hover td { background: #fafbfc; }
        .plp-table td { padding: 14px 24px; vertical-align: middle; }

        .prod-code {
          font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
          letter-spacing: 0.06em; color: #6b7280;
          background: #f3f4f6; border: 1px solid #e5e7eb;
          padding: 3px 8px; border-radius: 6px; display: inline-block;
        }
        .desc-text  { font-size: 13px; font-weight: 600; color: #0f0a1e; }
        .unit-text  { font-family: 'DM Mono', monospace; font-size: 11px; color: #9ca3af; }

        .price-cell { text-align: right; }
        .price-val  { font-size: 14px; font-weight: 700; color: #111827; }

        .status-cell { text-align: center; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 700; border: 1px solid;
        }
        .status-badge.active   { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .status-badge.inactive { background: #fffbeb; color: #d97706; border-color: #fde68a; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; background: currentColor; }
        .status-badge.active .status-dot { animation: livePulse 2s infinite; }

        .stamp-text { font-family: 'DM Mono', monospace; font-size: 11px; color: #9ca3af; font-style: italic; }

        .actions-cell { text-align: right; }
        .action-group { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .act-btn {
          display: flex; align-items: center; gap: 5px; padding: 6px 12px;
          font-size: 12px; font-weight: 600; color: #6b7280;
          background: transparent; border: 1px solid #e5e7eb; border-radius: 8px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: color .12s, background .12s, border-color .12s;
        }
        .act-btn.edit:hover   { color: #b91c1c; background: #fef2f2; border-color: #fca5a5; }
        .act-btn.delete:hover { color: #dc2626; background: #fef2f2; border-color: #fca5a5; }

        /* empty */
        .empty-cell  { padding: 72px 24px; text-align: center; }
        .empty-inner { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .empty-icon-wrap {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(185,28,28,0.10);
        }
        .empty-title { font-size: 14px; font-weight: 700; color: #4b5563; margin: 0; }
        .empty-sub   { font-size: 12px; color: #9ca3af; margin: 4px 0 0; }

        /* panel footer */
        .panel-footer {
          padding: 12px 24px; border-top: 1px solid #f3f4f6;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-count { font-size: 11px; color: #9ca3af; margin: 0; }
        .footer-note  { font-size: 11px; color: #9ca3af; margin: 0; font-style: italic; }
      `}</style>

      <div className="plp-bg">

        {/* TOP BAR */}
        <div className="plp-topbar">
          <div>
            <div className="plp-eyebrow">
              <span className="dev-badge">Dev Tools</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Role visibility tester</span>
            </div>
            <h1 className="plp-title">Product Masterlist</h1>
            <p className="plp-subtitle">Manage your product catalog, pricing, and inventory statuses.</p>
          </div>

          <div className="plp-actions">
            <div className="role-switcher">
              <button className={`role-btn ${currentUserRole === 'USER' ? 'active' : ''}`} onClick={() => setCurrentUserRole('USER')}>
                Standard User
              </button>
              <button className={`role-btn ${currentUserRole === 'ADMIN' ? 'active' : ''}`} onClick={() => setCurrentUserRole('ADMIN')}>
                Admin
              </button>
            </div>
            {isAdmin && (
              <button className="add-btn">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="plp-body">

          {/* Stat cards */}
          <div className="stat-grid">
            {[
              { label: 'Total Items',   value: totalCount,  trend: 'In this catalog',     accent: '#2563eb', bg: '#eff6ff',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
              { label: 'Active Items',  value: activeCount, trend: 'Visible to all users', accent: '#16a34a', bg: '#f0fdf4',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> },
              { label: 'Catalog Value', value: `$${Number(totalValue).toLocaleString()}`, trend: 'Combined price total', accent: '#b91c1c', bg: '#fef2f2',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-bar" style={{ background: `linear-gradient(90deg,${s.accent},transparent)` }} />
                <div className="stat-inner">
                  <div>
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-value" style={{ color: s.accent }}>{s.value}</p>
                    <p className="stat-trend">{s.trend}</p>
                  </div>
                  <div className="stat-icon" style={{ background: s.bg, color: s.accent }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table panel */}
          <div className="table-panel">
            <div className="panel-toolbar">
              <div>
                <p className="panel-title">Product Listings</p>
                <p className="panel-sub">{visibleProducts.length} item{visibleProducts.length !== 1 ? 's' : ''} shown</p>
              </div>
              <div className="toolbar-right">
                <button className={`filter-chip ${filter === 'ALL'      ? 'f-all'      : ''}`} onClick={() => setFilter('ALL')}>All</button>
                <button className={`filter-chip ${filter === 'ACTIVE'   ? 'f-active'   : ''}`} onClick={() => setFilter('ACTIVE')}>Active</button>
                {isAdmin && (
                  <button className={`filter-chip ${filter === 'INACTIVE' ? 'f-inactive' : ''}`} onClick={() => setFilter('INACTIVE')}>Inactive</button>
                )}
                <label className="search-wrap">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text" placeholder="Search products…"
                    className="search-input"
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <table className="plp-table">
              <thead>
                <tr>
                  <th>Prod Code</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th className="right">Price</th>
                  <th className="center">Status</th>
                  {isAdmin && <th>Stamp</th>}
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.length > 0 ? visibleProducts.map((p) => (
                  <tr key={p.id}>
                    <td><span className="prod-code">{p.prodCode}</span></td>
                    <td><span className="desc-text">{p.description}</span></td>
                    <td><span className="unit-text">{p.unit}</span></td>
                    <td className="price-cell"><span className="price-val">${p.currentPrice.toFixed(2)}</span></td>
                    <td className="status-cell">
                      <span className={`status-badge ${p.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />{p.status}
                      </span>
                    </td>
                    {isAdmin && <td><span className="stamp-text">{p.stamp}</span></td>}
                    <td className="actions-cell">
                      <div className="action-group">
                        <button className="act-btn edit">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button className="act-btn delete">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="empty-cell">
                      <div className="empty-inner">
                        <div className="empty-icon-wrap">
                          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth="1.6">
                            <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                          </svg>
                        </div>
                        <div>
                          <p className="empty-title">No products found</p>
                          <p className="empty-sub">Try adjusting your filters or search query.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {visibleProducts.length > 0 && (
              <div className="panel-footer">
                <p className="footer-count">Showing {visibleProducts.length} of {totalCount} products</p>
                <p className="footer-note">{isAdmin ? 'Admin view — all records visible' : 'Standard view — active items only'}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ProductListPage;