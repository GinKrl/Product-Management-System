import React, { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Dashboard — content only.
// The sidebar, navbar, and layout wrapper live in AppShell.jsx
// (PR-03). Do NOT add a sidebar or full-screen flex wrapper here.
// ─────────────────────────────────────────────────────────────

// MOCK DATA — replace with real productService call
const MOCK_PRODUCTS = [
  { id: 1, name: 'Ergonomic Office Chair',      price: 149.99, stock: 34 },
  { id: 2, name: 'Wireless Mechanical Keyboard', price: 89.50,  stock: 7  },
  { id: 3, name: '27-inch 4K Monitor',           price: 320.00, stock: 4  },
  { id: 4, name: 'USB-C Hub (7-in-1)',            price: 24.99,  stock: 62 },
  { id: 5, name: 'Standing Desk Frame',           price: 210.00, stock: 2  },
];

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Simulated fetch — swap with: const { data, error } = await productService.getAllProducts();
    await new Promise(r => setTimeout(r, 800));
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  };

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStock   = products.filter(p => p.stock < 10).length;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      sub: 'items in system',
      accent: '#2563eb',
      lightBg: '#eff6ff',
      sparkline: [40, 55, 50, 70, 65, 80, products.length * 10 || 75],
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      label: 'Low Stock',
      value: lowStock,
      sub: 'need restocking',
      accent: '#d97706',
      lightBg: '#fffbeb',
      sparkline: [20, 30, 25, 40, 35, 50, lowStock * 15 || 45],
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      ),
    },
    {
      label: 'Inventory Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'total worth',
      accent: '#059669',
      lightBg: '#ecfdf5',
      sparkline: [30, 45, 40, 60, 55, 70, 80],
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(185,28,28,0.35)} 50%{box-shadow:0 0 0 6px rgba(185,28,28,0)} }
        @keyframes rowIn    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

        .db-wrap {
          background: linear-gradient(160deg, #f8f9fc 0%, #eef0f5 100%);
          min-height: 100%;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── TOPBAR ── */
        .db-topbar {
          position: sticky; top: 0; z-index: 30;
          background: rgba(248,249,252,0.9);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          padding: 16px 32px;
          display: flex; align-items: center; justify-content: space-between;
          animation: fadeUp .4s ease both;
        }

        .db-brand { display:flex; flex-direction:column; gap:2px; }

        .db-live-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }

        .live-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: #b91c1c;
          background: #fef2f2; border: 1px solid #fecaca;
          padding: 2px 8px 2px 6px; border-radius: 999px;
        }

        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #ef4444;
          animation: pulseRed 1.8s infinite;
        }

        .db-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #0f0a1e;
          margin: 0; letter-spacing: -0.3px; line-height: 1.1;
        }

        .db-subtitle { font-size: 11px; color: #9ca3af; margin: 0; }

        .db-topbar-actions { display:flex; align-items:center; gap:10px; }

        .icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; border: 1px solid #e5e7eb;
          background: #fff; color: #9ca3af;
          cursor: pointer; flex-shrink: 0;
          transition: all .15s ease;
        }
        .icon-btn:hover { color:#b91c1c; border-color:#fca5a5; background:#fef2f2; transform:translateY(-1px); box-shadow:0 3px 10px rgba(185,28,28,0.12); }

        .add-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px; border: none;
          color: #fff; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #e11d48 100%);
          box-shadow: 0 4px 14px rgba(185,28,28,0.35);
          transition: transform .15s, box-shadow .15s;
          white-space: nowrap;
        }
        .add-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(185,28,28,0.45); }
        .add-btn:active { transform:translateY(0); }

        /* ── BODY ── */
        .db-body { padding: 28px 32px; display:flex; flex-direction:column; gap:24px; }

        /* ── STAT CARDS ── */
        .stat-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
        }

        .stat-card {
          background: #fff; border-radius: 16px; padding: 22px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
          position: relative; overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease;
          animation: fadeUp .4s ease both;
        }
        .stat-card:nth-child(1) { animation-delay: .06s; }
        .stat-card:nth-child(2) { animation-delay: .12s; }
        .stat-card:nth-child(3) { animation-delay: .18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,0,0,0.10); }

        .stat-top-bar {
          position: absolute; top:0; left:0; right:0; height:3px;
          border-radius: 16px 16px 0 0;
        }

        .stat-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }

        .stat-icon-box {
          width:40px; height:40px; border-radius:12px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        .stat-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: #9ca3af; margin: 0 0 8px;
        }

        .stat-val {
          font-family: 'DM Serif Display', serif;
          font-size: 32px; line-height: 1; margin:0; letter-spacing:-0.5px;
        }

        .stat-sub { font-size: 11px; color: #9ca3af; margin: 5px 0 0; }

        /* mini sparkline */
        .sparkline { margin-top: 16px; height: 36px; }

        /* ── PANEL ── */
        .panel {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
          overflow: hidden;
          animation: fadeUp .4s ease both .24s;
        }

        .panel-head {
          padding: 18px 24px; border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }

        .panel-title { font-size: 14px; font-weight: 700; color: #0f0a1e; margin:0; }
        .panel-sub-text { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }

        .search-field {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 10px; width: 220px;
          transition: border-color .15s, box-shadow .15s;
        }
        .search-field:focus-within {
          border-color: #fca5a5;
          box-shadow: 0 0 0 3px rgba(185,28,28,0.08);
        }
        .search-field input {
          background: transparent; border: none; outline: none;
          font-size: 12px; color: #374151; width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .search-field input::placeholder { color:#9ca3af; }

        /* ── TABLE ── */
        .db-table { width:100%; border-collapse:collapse; }

        .db-table thead tr {
          background: linear-gradient(90deg,#fafafa,#f7f8fa);
          border-bottom: 1px solid #f0f0f2;
        }

        .db-table th {
          padding: 11px 24px;
          font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #9ca3af;
          white-space: nowrap;
        }

        .db-table tbody tr {
          border-top: 1px solid #f3f4f6;
          transition: background .12s;
          animation: rowIn .3s ease both;
        }
        .db-table tbody tr:nth-child(1) { animation-delay:.05s }
        .db-table tbody tr:nth-child(2) { animation-delay:.10s }
        .db-table tbody tr:nth-child(3) { animation-delay:.15s }
        .db-table tbody tr:nth-child(4) { animation-delay:.20s }
        .db-table tbody tr:nth-child(5) { animation-delay:.25s }

        .db-table tbody tr:hover td { background: #fafbfc; }
        .db-table td { padding: 13px 24px; vertical-align: middle; }

        /* product cell */
        .prod-avatar {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#fef2f2,#fee2e2);
          color: #b91c1c; display:flex; align-items:center; justify-content:center;
          font-size: 13px; font-weight: 700; font-family:'DM Mono',monospace;
          border: 1px solid #fecaca;
        }
        .prod-name { font-size:13px; font-weight:600; color:#0f0a1e; margin:0; }
        .prod-sku  { font-size:10px; color:#9ca3af; margin:1px 0 0; font-family:'DM Mono',monospace; letter-spacing:.04em; }

        /* price */
        .price-val {
          font-family: 'DM Mono', monospace;
          font-size: 13px; font-weight: 500; color: #111827;
        }

        /* stock badge */
        .stock-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600;
          border: 1px solid; white-space: nowrap;
        }
        .stock-dot { width:6px; height:6px; border-radius:50%; display:inline-block; }

        /* action btns */
        .row-actions { display:flex; gap:6px; }
        .row-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; font-size: 12px; font-weight: 600;
          color: #6b7280; background: transparent;
          border: 1px solid #e5e7eb; border-radius: 8px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all .12s ease;
        }
        .row-btn.edit:hover   { color:#b91c1c; background:#fef2f2; border-color:#fca5a5; }
        .row-btn.del:hover    { color:#dc2626; background:#fef2f2; border-color:#fca5a5; }

        /* loading shimmer */
        .shimmer-row td { padding:0; }
        .shimmer-bar {
          height: 14px; border-radius: 6px; margin: 14px 24px;
          background: linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        /* empty */
        .empty-cell { padding:72px 24px; text-align:center; }
        .empty-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
        .empty-icon {
          width:52px; height:52px; border-radius:16px;
          background: linear-gradient(135deg,#fef2f2,#fee2e2);
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 4px 16px rgba(185,28,28,0.10);
        }
        .empty-title { font-size:14px; font-weight:700; color:#4b5563; margin:0; }
        .empty-hint  { font-size:12px; color:#9ca3af; margin:4px 0 0; }

        /* footer */
        .panel-foot {
          padding: 12px 24px; border-top: 1px solid #f3f4f6;
          display: flex; align-items:center; justify-content:space-between;
        }
        .foot-count { font-size:11px; color:#9ca3af; margin:0; }
        .foot-pages { display:flex; gap:4px; }
        .page-btn {
          padding: 5px 13px; font-size:11px; font-weight:600;
          color: #6b7280; background:#fff;
          border: 1px solid #e5e7eb; border-radius:7px;
          cursor:pointer; font-family:'DM Sans',sans-serif;
          transition: all .12s;
        }
        .page-btn:hover { color:#b91c1c; border-color:#fca5a5; background:#fef2f2; }

        /* ── STOCK WARNING BANNER ── */
        .warn-banner {
          background: linear-gradient(135deg,#fffbeb,#fef3c7);
          border: 1px solid #fde68a;
          border-radius: 12px; padding: 12px 18px;
          display: flex; align-items: center; gap: 12px;
          animation: fadeUp .4s ease both .22s;
        }
        .warn-icon {
          width:34px; height:34px; border-radius:10px; flex-shrink:0;
          background:#fef3c7; border:1px solid #fde68a;
          display:flex; align-items:center; justify-content:center; color:#d97706;
        }
        .warn-title { font-size:12px; font-weight:700; color:#92400e; margin:0 0 2px; }
        .warn-text  { font-size:11px; color:#b45309; margin:0; }
        .warn-cta {
          margin-left:auto; padding:6px 14px;
          font-size:11px; font-weight:700; color:#d97706;
          background:#fff; border:1px solid #fde68a; border-radius:8px;
          cursor:pointer; font-family:'DM Sans',sans-serif;
          transition:all .12s; white-space:nowrap;
        }
        .warn-cta:hover { background:#fffbeb; border-color:#f59e0b; }
      `}</style>

      <div className="db-wrap">

        {/* ── TOP BAR ── */}
        <div className="db-topbar">
          <div className="db-brand">
            <div className="db-live-row">
              <span className="live-pill">
                <span className="live-dot" />
                Live
              </span>
            </div>
            <h1 className="db-title">Workspace Overview</h1>
            <p className="db-subtitle">Manage your inventory and product listings.</p>
          </div>

          <div className="db-topbar-actions">
            <button className="icon-btn" onClick={fetchProducts} title="Refresh data">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
            <button className="add-btn">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="db-body">

          {/* ── STAT CARDS ── */}
          <div className="stat-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-top-bar" style={{ background:`linear-gradient(90deg,${s.accent},transparent)` }} />
                <div className="stat-header">
                  <div>
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-val" style={{ color: s.accent }}>{loading ? '—' : s.value}</p>
                    <p className="stat-sub">{s.sub}</p>
                  </div>
                  <div className="stat-icon-box" style={{ background: s.lightBg, color: s.accent }}>
                    {s.icon}
                  </div>
                </div>
                {/* Sparkline SVG */}
                <div className="sparkline">
                  <svg width="100%" height="36" viewBox="0 0 120 36" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.accent} stopOpacity="0.18"/>
                        <stop offset="100%" stopColor={s.accent} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {(() => {
                      const pts = s.sparkline;
                      const max = Math.max(...pts);
                      const xs = pts.map((_, idx) => (idx / (pts.length - 1)) * 120);
                      const ys = pts.map(v => 32 - (v / max) * 28);
                      const lineD = xs.map((x, idx) => `${idx === 0 ? 'M' : 'L'}${x},${ys[idx]}`).join(' ');
                      const fillD = lineD + ` L120,36 L0,36 Z`;
                      return (
                        <>
                          <path d={fillD} fill={`url(#grad${i})`} />
                          <path d={lineD} fill="none" stroke={s.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="3" fill={s.accent}/>
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* ── LOW STOCK BANNER (only when there are low-stock items) ── */}
          {!loading && lowStock > 0 && (
            <div className="warn-banner">
              <div className="warn-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div>
                <p className="warn-title">{lowStock} product{lowStock > 1 ? 's' : ''} running low on stock</p>
                <p className="warn-text">Review inventory levels to avoid stockouts.</p>
              </div>
              <button className="warn-cta">View Low Stock →</button>
            </div>
          )}

          {/* ── PRODUCT TABLE ── */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-title">Product Listings</p>
                <p className="panel-sub-text">
                  {loading ? 'Loading inventory…' : `${filtered.length} of ${products.length} item${products.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <label className="search-field">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2.5" style={{ flexShrink:0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0, lineHeight:1, fontSize:14 }}
                    title="Clear"
                  >×</button>
                )}
              </label>
            </div>

            <table className="db-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Shimmer skeleton rows
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="shimmer-row">
                      {[200, 80, 100, 140].map((w, j) => (
                        <td key={j}><div className="shimmer-bar" style={{ width: `${w}px` }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      <div className="empty-wrap">
                        <div className="empty-icon">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth="1.6">
                            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                          </svg>
                        </div>
                        <div>
                          <p className="empty-title">{search ? 'No results found' : 'No products yet'}</p>
                          <p className="empty-hint">
                            {search
                              ? `Nothing matches "${search}" — try a different term.`
                              : <>Click <strong style={{ color:'#b91c1c' }}>Add Product</strong> to get started.</>
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => {
                    const isLow = product.stock < 10;
                    const isCritical = product.stock < 5;
                    const stockColor = isCritical ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                    const stockBg    = isCritical ? '#fef2f2' : isLow ? '#fffbeb' : '#f0fdf4';
                    const stockBorder= isCritical ? '#fecaca' : isLow ? '#fde68a' : '#bbf7d0';
                    return (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div className="prod-avatar">{product.name[0].toUpperCase()}</div>
                            <div>
                              <p className="prod-name">{product.name}</p>
                              <p className="prod-sku">SKU-{String(product.id).padStart(4,'0')}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="price-val">${product.price.toFixed(2)}</span>
                        </td>
                        <td>
                          <span className="stock-badge" style={{ background:stockBg, color:stockColor, borderColor:stockBorder }}>
                            <span className="stock-dot" style={{ background:stockColor, boxShadow: isCritical ? `0 0 0 0 ${stockColor}` : 'none' }} />
                            {product.stock} in stock
                            {isCritical && <span style={{ fontSize:9, fontWeight:800, letterSpacing:1, textTransform:'uppercase', marginLeft:4 }}>Critical</span>}
                            {!isCritical && isLow && <span style={{ fontSize:9, fontWeight:800, letterSpacing:1, textTransform:'uppercase', marginLeft:4 }}>Low</span>}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="row-btn edit">
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button className="row-btn del">
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
                    );
                  })
                )}
              </tbody>
            </table>

            {!loading && products.length > 0 && (
              <div className="panel-foot">
                <p className="foot-count">
                  Showing <strong style={{ color:'#374151' }}>{filtered.length}</strong> of {products.length} products
                </p>
                <div className="foot-pages">
                  <button className="page-btn">← Prev</button>
                  <button className="page-btn">Next →</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard; 