import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRightsContext } from '../contexts/UserRightsContext';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const downloadCSV = (rows) => {
  const headers = ['Product Code', 'Description', 'Unit', 'Current Price', 'Status', 'Last Updated'];
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      [r.prodcode, `"${r.description}"`, r.unit, r.current_price ?? '', r.record_status, r.stamp ?? ''].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `product-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const fetchProductReport = async () => {
  const { data: products, error: pErr } = await supabase
    .from('product')
    .select('*')
    .order('prodcode', { ascending: true });
  if (pErr) throw pErr;

  const { data: prices, error: hErr } = await supabase
    .from('pricehist')
    .select('prodcode, unitprice, effdate')
    .order('effdate', { ascending: false });
  if (hErr) throw hErr;

  const latestPrice = {};
  for (const row of prices || []) {
    if (!latestPrice[row.prodcode]) latestPrice[row.prodcode] = row.unitprice;
  }

  return (products || []).map(p => ({
    ...p,
    current_price: latestPrice[p.prodcode] ?? null,
  }));
};

const ProductReportPage = () => {
  const [rows, setRows]       = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('ACTIVE');
  const [sortCol, setSortCol] = useState('prodcode');
  const [sortDir, setSortDir] = useState('asc');

  const { userRole } = useRightsContext();
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  // PR-03: extracted so the retry button can call it
  const loadReport = () => {
    setLoading(true);
    setError(null);
    fetchProductReport()
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(); }, []);

  const handleSort = (col) => {
    setSortCol(c => {
      if (c === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return c; }
      setSortDir('asc'); return col;
    });
  };

  const visible = useMemo(() => {
    return [...rows]
      .filter(r => {
        if (!isAdmin && r.record_status === 'INACTIVE') return false;
        if (filter !== 'ALL' && r.record_status !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          return r.prodcode?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        let av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
        if (sortCol === 'current_price') { av = Number(av || 0); bv = Number(bv || 0); }
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
  }, [rows, filter, search, sortCol, sortDir, isAdmin]);

  const stats = useMemo(() => {
    const active    = rows.filter(r => r.record_status === 'ACTIVE');
    const withPrice = active.filter(r => r.current_price);
    const totalVal  = withPrice.reduce((s, r) => s + Number(r.current_price), 0);
    const avgPrice  = withPrice.length ? totalVal / withPrice.length : 0;
    return { total: rows.length, active: active.length, totalVal, avgPrice };
  }, [rows]);

  const SortIcon = ({ col }) =>
    sortCol !== col
      ? <span style={{ opacity: .3, marginLeft: 4, fontSize: 10 }}>⇅</span>
      : <span style={{ marginLeft: 4, fontSize: 10, color: '#b91c1c' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --red-deep:#7f1d1d;--red-mid:#b91c1c;--red-bright:#e11d48;--red-glow:rgba(185,28,28,.15);--red-pale:#fef2f2;
          --ink:#0c0a0f;--ink-2:#1f1c28;--ink-3:#374151;--muted:#9ca3af;--border:rgba(0,0,0,.07);
          --surface:#fff;--bg:#f7f7f9;--green-bg:#f0fdf4;--green-text:#15803d;
          --amber-bg:#fffbeb;--amber-text:#b45309;--blue-bg:#eff6ff;--blue-text:#1d4ed8;--violet-bg:#f5f3ff;--violet-text:#6d28d9;
        }
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes numIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .rp-root{font-family:'DM Sans',sans-serif;color:var(--ink);}
        .rp-topbar{position:sticky;top:0;z-index:30;background:rgba(247,247,249,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 36px;height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px;animation:fadeUp .4s ease both;}
        .rp-title{font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:var(--ink);margin:0;letter-spacing:-.3px;}
        .rp-subtitle{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;}
        .csv-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--red-deep),var(--red-mid) 55%,var(--red-bright));color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 18px var(--red-glow);transition:transform .15s,box-shadow .15s;letter-spacing:.2px;}
        .csv-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(185,28,28,.35);}
        .csv-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}

        .rp-body{padding:28px 36px;display:flex;flex-direction:column;gap:24px;}

        .stat-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;animation:fadeUp .4s ease both .07s;}
        .sc{border-radius:18px;padding:20px 20px 16px;position:relative;overflow:hidden;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
        .sc:hover{transform:translateY(-3px) scale(1.01);}
        .sc-dark{background:#7f1d1d;}
        .sc-light{background:#fff;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .sc-orb{position:absolute;border-radius:50%;pointer-events:none;}
        .sc-dark .sc-orb-a{width:100px;height:100px;background:rgba(255,255,255,.06);bottom:-30px;right:-20px;}
        .sc-light .sc-orb-a{width:70px;height:70px;bottom:-20px;right:-14px;}
        .sc>*:not(.sc-orb){position:relative;z-index:1;}
        .sc-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
        .sc-dark .sc-icon{background:rgba(255,255,255,.15);}
        .sc-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
        .sc-dark .sc-lbl{color:rgba(255,255,255,.5);}
        .sc-light .sc-lbl{color:var(--muted);}
        .sc-val{font-family:'DM Serif Display',serif;font-size:30px;line-height:1;letter-spacing:-.5px;animation:numIn .5s ease both;}
        .sc-dark .sc-val{color:#fff;}
        .sc-light .sc-val{color:var(--ink);}
        .sc-bar{height:3px;border-radius:99px;margin-top:14px;overflow:hidden;}
        .sc-dark .sc-bar{background:rgba(255,255,255,.12);}
        .sc-bar-fill{height:100%;border-radius:99px;animation:barGrow 1.1s cubic-bezier(.22,1,.36,1) both .3s;transform-origin:left;}
        .sc-dark .sc-bar-fill{background:rgba(255,255,255,.4);}

        .panel{background:var(--surface);border-radius:20px;border:1px solid var(--border);overflow:hidden;animation:fadeUp .4s ease both .14s;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .toolbar{padding:16px 22px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
        .toolbar-l{display:flex;align-items:center;gap:10px;}
        .panel-title{font-size:14px;font-weight:700;color:var(--ink-3);}
        .chip{border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;}
        .chip-red{background:var(--red-pale);color:var(--red-mid);}
        .toolbar-r{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .srch-wrap{position:relative;display:flex;align-items:center;}
        .srch-icon{position:absolute;left:10px;color:var(--muted);font-size:13px;pointer-events:none;}
        .srch{padding:7px 12px 7px 30px;border:1px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-3);outline:none;width:190px;background:var(--bg);transition:border-color .15s,box-shadow .15s,width .25s;}
        .srch:focus{border-color:var(--red-mid);box-shadow:0 0 0 3px var(--red-glow);width:230px;background:#fff;}
        .srch::placeholder{color:#c4c4cc;}
        .f-chips{display:flex;gap:5px;}
        .f-chip{padding:5px 13px;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .15s;}
        .f-chip:hover{border-color:#d1d5db;color:var(--ink-3);}
        .f-chip.fc-all{border-color:var(--red-mid);background:var(--red-pale);color:var(--red-mid);}
        .f-chip.fc-active{border-color:#bbf7d0;background:var(--green-bg);color:var(--green-text);}
        .f-chip.fc-inact{border-color:#fde68a;background:var(--amber-bg);color:var(--amber-text);}

        .rp-table{width:100%;border-collapse:collapse;}
        .rp-table thead{background:#fafafa;}
        .rp-table th{padding:10px 18px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;text-align:left;cursor:pointer;user-select:none;white-space:nowrap;transition:color .15s;}
        .rp-table th:hover{color:var(--ink-3);}
        .rp-table th.no-sort{cursor:default;}
        .rp-table td{padding:13px 18px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:var(--ink-3);vertical-align:middle;}
        .rp-table tbody tr{transition:background .12s;}
        .rp-table tbody tr:hover td{background:#fafafa;}
        .cell-code{font-family:'DM Mono',monospace;font-size:11.5px;font-weight:500;color:var(--violet-text);background:var(--violet-bg);padding:4px 9px;border-radius:7px;display:inline-block;letter-spacing:.3px;}
        .cell-desc{color:var(--ink-2);font-weight:600;}
        .cell-unit{font-size:11px;font-weight:600;color:var(--muted);background:#f3f4f6;border-radius:6px;padding:3px 8px;display:inline-block;text-transform:uppercase;letter-spacing:.5px;}
        .cell-price{font-family:'DM Mono',monospace;font-size:13px;font-weight:600;color:var(--blue-text);}
        .cell-na{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;}
        .badge-dot{width:5px;height:5px;border-radius:50%;}
        .b-active{background:var(--green-bg);color:var(--green-text);}
        .b-active .badge-dot{background:var(--green-text);}
        .b-inactive{background:var(--amber-bg);color:var(--amber-text);}
        .b-inactive .badge-dot{background:var(--amber-text);}

        /* PR-03: unified states */
        .tbl-state{padding:56px 24px;text-align:center;color:var(--muted);}
        .tbl-state p{margin:8px 0 0;font-size:13px;}
        .loader{width:26px;height:26px;border:3px solid #f3f4f6;border-top-color:var(--red-mid);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}

        /* PR-03: error banner with retry */
        .err-banner{margin:0 0 4px;padding:12px 16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;font-size:12px;color:#dc2626;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .err-retry{padding:5px 14px;border-radius:7px;border:1px solid #fecaca;background:#fff;color:#dc2626;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;transition:background .15s;}
        .err-retry:hover{background:#fef2f2;}

        @media(max-width:768px){
          .rp-topbar{padding:14px 20px;flex-wrap:wrap;height:auto;gap:12px;}
          .rp-body{padding:16px;}
          .stat-row{grid-template-columns:1fr 1fr;}
          .toolbar{flex-direction:column;align-items:flex-start;}
          .toolbar-r{width:100%;}
          .srch{width:100%;}
          .srch:focus{width:100%;}
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-topbar">
          <div>
            <h1 className="rp-title">
              Product Report
              <span style={{ display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#e11d48',marginLeft:5,marginBottom:2,verticalAlign:'middle' }} />
            </h1>
            <div className="rp-subtitle">REP_001 · Product Catalog with Current Pricing</div>
          </div>
          <button className="csv-btn" onClick={() => downloadCSV(visible)} disabled={isLoading || visible.length === 0}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>

        <div className="rp-body">

          {/* PR-03: error banner — only shown after loading completes */}
          {error && !isLoading && (
            <div className="err-banner">
              <span>⚠ Failed to load: {error}</span>
              <button className="err-retry" onClick={loadReport}>Try again</button>
            </div>
          )}

          <div className="stat-row">
            <div className="sc sc-dark">
              <div className="sc-orb sc-orb-a" />
              <div className="sc-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,.9)" strokeWidth="1.8">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                </svg>
              </div>
              <div className="sc-lbl">Total Products</div>
              <div className="sc-val">{stats.total}</div>
              <div className="sc-bar"><div className="sc-bar-fill" style={{ width: '100%' }} /></div>
            </div>

            <div className="sc sc-light">
              <div className="sc-orb sc-orb-a" style={{ background: '#dcfce7' }} />
              <div className="sc-icon" style={{ background: '#dcfce7' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#15803d" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/>
                </svg>
              </div>
              <div className="sc-lbl" style={{ color: 'var(--muted)' }}>Active</div>
              <div className="sc-val">{stats.active}</div>
              <div className="sc-bar" style={{ background: '#dcfce7' }}><div className="sc-bar-fill" style={{ width: stats.total ? `${(stats.active/stats.total)*100}%` : '0%', background: '#4ade80' }} /></div>
            </div>

            <div className="sc sc-light">
              <div className="sc-orb sc-orb-a" style={{ background: '#dbeafe' }} />
              <div className="sc-icon" style={{ background: '#dbeafe' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v1.5M12 16.5V18M8.5 9.5C8.5 8.67 9.17 8 10 8h3a2 2 0 010 4h-2a2 2 0 000 4h3c.83 0 1.5-.67 1.5-1.5"/>
                </svg>
              </div>
              <div className="sc-lbl" style={{ color: 'var(--muted)' }}>Avg Price</div>
              <div className="sc-val" style={{ fontSize: 22, paddingTop: 4 }}>{fmt(stats.avgPrice)}</div>
              <div className="sc-bar" style={{ background: '#dbeafe' }}><div className="sc-bar-fill" style={{ width: '68%', background: '#60a5fa' }} /></div>
            </div>

            <div className="sc sc-light">
              <div className="sc-orb sc-orb-a" style={{ background: '#ede9fe' }} />
              <div className="sc-icon" style={{ background: '#ede9fe' }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6d28d9" strokeWidth="1.8">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="sc-lbl" style={{ color: 'var(--muted)' }}>Catalog Value</div>
              <div className="sc-val" style={{ fontSize: 20, paddingTop: 6 }}>{fmt(stats.totalVal)}</div>
              <div className="sc-bar" style={{ background: '#ede9fe' }}><div className="sc-bar-fill" style={{ width: '80%', background: '#a78bfa' }} /></div>
            </div>
          </div>

          <div className="panel">
            <div className="toolbar">
              <div className="toolbar-l">
                <span className="panel-title">Product Listings</span>
                <span className="chip chip-red">{visible.length} shown</span>
              </div>
              <div className="toolbar-r">
                <div className="srch-wrap">
                  <span className="srch-icon">⌕</span>
                  <input className="srch" placeholder="Search code or name…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="f-chips">
                  {isAdmin && <button className={`f-chip ${filter==='ALL'?'fc-all':''}`} onClick={() => setFilter('ALL')}>All</button>}
                  <button className={`f-chip ${filter==='ACTIVE'?'fc-active':''}`} onClick={() => setFilter('ACTIVE')}>Active</button>
                  {isAdmin && <button className={`f-chip ${filter==='INACTIVE'?'fc-inact':''}`} onClick={() => setFilter('INACTIVE')}>Inactive</button>}
                </div>
              </div>
            </div>

            {/* PR-03: loading → empty → data */}
            {isLoading ? (
              <div className="tbl-state">
                <div className="loader" />
                <p>Loading report…</p>
              </div>
            ) : (
              <table className="rp-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('prodcode')}>Code <SortIcon col="prodcode" /></th>
                    <th onClick={() => handleSort('description')}>Description <SortIcon col="description" /></th>
                    <th className="no-sort">Unit</th>
                    <th onClick={() => handleSort('current_price')}>Current Price <SortIcon col="current_price" /></th>
                    <th onClick={() => handleSort('record_status')}>Status <SortIcon col="record_status" /></th>
                    {isAdmin && <th onClick={() => handleSort('stamp')}>Last Updated <SortIcon col="stamp" /></th>}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5}>
                        <div className="tbl-state">
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                          <p style={{ fontWeight: 600, color: 'var(--ink-3)', marginBottom: 4 }}>No products found</p>
                          <p>Try adjusting your search or filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : visible.map(r => (
                    <tr key={r.prodcode}>
                      <td><span className="cell-code">{r.prodcode}</span></td>
                      <td><span className="cell-desc">{r.description}</span></td>
                      <td><span className="cell-unit">{r.unit}</span></td>
                      <td>
                        {r.current_price != null
                          ? <span className="cell-price">{fmt(r.current_price)}</span>
                          : <span className="cell-na">— no price</span>}
                      </td>
                      <td>
                        <span className={`badge ${r.record_status === 'ACTIVE' ? 'b-active' : 'b-inactive'}`}>
                          <span className="badge-dot" />{r.record_status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>
                          {r.stamp || '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductReportPage;