import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, recoverProduct } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import { useRightsContext } from '../contexts/UserRightsContext';

const DeletedItemsPage = () => {
  const { currentUser } = useAuth();
  const { userRole: dbRole } = useRightsContext();

  const [deletedProducts, setDeletedProducts] = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [fetchError, setFetchError]           = useState(null); // PR-03
  const [search, setSearch]                   = useState('');
  const [toast, setToast]                     = useState(null);
  const [recoveringCode, setRecoveringCode]   = useState(null);
  const [sortCol, setSortCol]                 = useState(null);
  const [sortDir, setSortDir]                 = useState('asc');

  const userRole = dbRole?.toUpperCase();
  const isAdmin  = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // PR-03: extracted so retry button can call it
  const fetchDeleted = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getProducts('ADMIN');
      setDeletedProducts((data || []).filter(p => p.record_status === 'INACTIVE'));
    } catch (err) {
      console.error('Failed to fetch deleted products:', err);
      setFetchError('Failed to load deleted products. Please try again.'); // PR-03
      showToast('Failed to load deleted products.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchDeleted();
  }, [isAdmin]);

  const handleRecover = async (prodcode) => {
    setRecoveringCode(prodcode);
    try {
      await recoverProduct(prodcode, currentUser?.id);
      showToast(`Product "${prodcode}" restored successfully.`);
      fetchDeleted();
    } catch (err) {
      console.error('Error recovering product:', err);
      showToast('Failed to recover product.', 'error');
    } finally {
      setRecoveringCode(null);
    }
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const visibleProducts = [...deletedProducts]
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.prodcode?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortCol) return 0;
      let av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  // Access guard
  if (!isAdmin) {
    return (
      <div style={{ padding:'100px 20px', textAlign:'center', fontFamily:'DM Sans, sans-serif' }}>
        <h2 style={{ fontFamily:'DM Serif Display', fontSize:'32px' }}>Access Denied</h2>
        <p style={{ color:'#9ca3af' }}>You do not have the required permissions to view this archive.</p>
        <div style={{ marginTop:'20px', fontSize:'11px', fontWeight:700, color:'#b91c1c' }}>
          DETECTED ROLE: {userRole || 'authenticated'}
        </div>
      </div>
    );
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity:.3, marginLeft:4, fontSize:10 }}>⇅</span>;
    return <span style={{ marginLeft:4, fontSize:10, color:'#b91c1c' }}>{sortDir==='asc'?'↑':'↓'}</span>;
  };

  const totalDeleted = deletedProducts.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --red-deep:#7f1d1d;--red-mid:#b91c1c;--red-bright:#e11d48;--red-glow:rgba(185,28,28,0.15);--red-pale:#fef2f2;
          --ink:#0c0a0f;--ink-2:#1f1c28;--ink-3:#374151;--muted:#9ca3af;--border:rgba(0,0,0,0.07);
          --surface:#ffffff;--bg:#f7f7f9;--green-bg:#f0fdf4;--green-text:#15803d;
          --amber-bg:#fffbeb;--amber-text:#b45309;--blue-bg:#eff6ff;--blue-text:#1d4ed8;
          --violet-bg:#f5f3ff;--violet-text:#6d28d9;
        }

        *{box-sizing:border-box;}

        @keyframes fadeUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn {from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes numIn   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barGrow {from{transform:scaleX(0)}to{transform:scaleX(1)}}

        .dip-root{background:var(--bg);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--ink);}

        .dip-topbar{position:sticky;top:0;z-index:30;background:rgba(247,247,249,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 36px;height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px;animation:fadeUp .4s ease both;}
        .dip-title{font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:var(--ink);margin:0;letter-spacing:-.3px;}
        .dip-subtitle{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;}

        .dip-body{padding:28px 36px;display:flex;flex-direction:column;gap:24px;}

        /* PR-03: error banner with retry */
        .err-banner{padding:12px 16px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;font-size:12px;color:#dc2626;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .err-retry{padding:5px 14px;border-radius:7px;border:1px solid #fecaca;background:#fff;color:#dc2626;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;transition:background .15s;}
        .err-retry:hover{background:#fef2f2;}

        .dip-stat-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;animation:fadeUp .4s ease both .07s;}
        .stat-card{border-radius:20px;padding:22px 22px 18px;position:relative;overflow:hidden;cursor:default;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
        .stat-card:hover{transform:translateY(-4px) scale(1.01);}
        .stat-card.s-del{background:#7f1d1d;}
        .stat-card.s-info{background:#fff;border:1px solid rgba(0,0,0,.07);box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .sc-orb{position:absolute;border-radius:50%;pointer-events:none;z-index:0;}
        .s-del .sc-orb-a{width:120px;height:120px;background:rgba(255,255,255,.06);bottom:-40px;right:-28px;}
        .s-del .sc-orb-b{width:60px;height:60px;background:rgba(255,255,255,.05);top:-16px;right:60px;}
        .s-info .sc-orb-a{width:80px;height:80px;background:#fef2f2;bottom:-24px;right:-18px;}
        .stat-card>*:not(.sc-orb){position:relative;z-index:1;}
        .stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
        .stat-icon-wrap{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .s-del .stat-icon-wrap{background:rgba(255,255,255,.15);}
        .s-info .stat-icon-wrap{background:#fef2f2;}
        .stat-icon-wrap svg{width:18px;height:18px;}
        .stat-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:99px;letter-spacing:.2px;}
        .s-del .stat-badge{background:rgba(255,255,255,.15);color:rgba(255,255,255,.85);}
        .s-info .stat-badge{background:#fef2f2;color:var(--red-mid);}
        .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;margin-bottom:4px;}
        .s-del .stat-label{color:rgba(255,255,255,.55);}
        .s-info .stat-label{color:var(--muted);}
        .stat-value{font-family:'DM Serif Display',serif;font-size:36px;line-height:1;font-weight:400;letter-spacing:-0.5px;margin-bottom:2px;animation:numIn .5s ease both;}
        .s-del .stat-value{color:#fff;}
        .s-info .stat-value{color:var(--ink);}
        .stat-sub{font-size:11px;font-weight:500;margin-bottom:16px;}
        .s-del .stat-sub{color:rgba(255,255,255,.4);}
        .s-info .stat-sub{color:var(--muted);}
        .stat-divider{height:1px;margin-bottom:12px;}
        .s-del .stat-divider{background:rgba(255,255,255,.12);}
        .s-info .stat-divider{background:#f3f4f6;}
        .stat-footer{display:flex;align-items:center;justify-content:space-between;}
        .stat-foot-left{display:flex;align-items:center;gap:6px;}
        .stat-foot-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .s-del .stat-foot-dot{background:rgba(255,255,255,.35);}
        .s-info .stat-foot-dot{background:#fca5a5;}
        .stat-foot-text{font-size:11px;font-weight:500;}
        .s-del .stat-foot-text{color:rgba(255,255,255,.45);}
        .s-info .stat-foot-text{color:var(--muted);}
        .stat-bar-track{height:3px;border-radius:99px;margin-top:14px;overflow:hidden;}
        .s-del .stat-bar-track{background:rgba(255,255,255,.12);}
        .s-info .stat-bar-track{background:#fef2f2;}
        .stat-bar-fill{height:100%;border-radius:99px;animation:barGrow 1.1s cubic-bezier(.22,1,.36,1) both .35s;transform-origin:left;}
        .s-del .stat-bar-fill{background:rgba(255,255,255,.45);}
        .s-info .stat-bar-fill{background:#fca5a5;}

        .table-panel{background:var(--surface);border-radius:20px;border:1px solid var(--border);overflow:hidden;animation:fadeUp .4s ease both .14s;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .panel-toolbar{padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
        .toolbar-left{display:flex;align-items:center;gap:12px;}
        .panel-title{font-size:14px;font-weight:700;color:var(--ink-3);}
        .count-chip{background:var(--amber-bg);color:var(--amber-text);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;}
        .toolbar-right{display:flex;align-items:center;gap:8px;}
        .search-wrap{position:relative;display:flex;align-items:center;}
        .search-icon{position:absolute;left:10px;color:var(--muted);font-size:13px;pointer-events:none;}
        .search-input{padding:7px 12px 7px 30px;border:1px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-3);outline:none;width:190px;background:var(--bg);transition:border-color .15s,box-shadow .15s,width .25s;}
        .search-input:focus{border-color:var(--red-mid);box-shadow:0 0 0 3px var(--red-glow);width:230px;background:#fff;}
        .search-input::placeholder{color:#c4c4cc;}

        .dip-table{width:100%;border-collapse:collapse;}
        .dip-table thead{background:#fafafa;}
        .dip-table th{padding:11px 20px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;text-align:left;cursor:pointer;user-select:none;white-space:nowrap;transition:color .15s;}
        .dip-table th:hover{color:var(--ink-3);}
        .dip-table th.th-noclick{cursor:default;}
        .dip-table td{padding:14px 20px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:var(--ink-3);vertical-align:middle;}
        .dip-table tbody tr{transition:background .12s;}
        .dip-table tbody tr:hover td{background:#fafafa;}

        .cell-code{font-family:'DM Mono',monospace;font-size:11.5px;font-weight:500;color:var(--violet-text);background:var(--violet-bg);padding:4px 9px;border-radius:7px;display:inline-block;letter-spacing:.3px;}
        .cell-desc{color:var(--ink-2);font-weight:600;}
        .cell-stamp{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
        .badge-inactive{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.3px;background:var(--amber-bg);color:var(--amber-text);}
        .badge-dot{width:5px;height:5px;border-radius:50%;background:var(--amber-text);}

        .recover-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;cursor:pointer;border:1px solid #bbf7d0;background:var(--green-bg);color:var(--green-text);transition:all .15s;letter-spacing:.2px;}
        .recover-btn:hover{background:#dcfce7;border-color:#86efac;}
        .recover-btn:disabled{opacity:.55;cursor:not-allowed;}
        .recover-btn .btn-spinner{width:10px;height:10px;border:2px solid #bbf7d0;border-top-color:var(--green-text);border-radius:50%;animation:spin .6s linear infinite;}

        /* PR-03: unified table states */
        .table-state{padding:60px 24px;text-align:center;color:var(--muted);}
        .table-state .state-icon{font-size:32px;margin-bottom:8px;}
        .table-state .state-title{font-size:14px;font-weight:700;color:var(--ink-3);margin:0 0 4px;}
        .table-state p{margin:6px 0 0;font-size:13px;}
        .loader{width:28px;height:28px;border:3px solid #f3f4f6;border-top-color:var(--red-mid);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}

        .toast-wrap{position:fixed;bottom:28px;right:28px;z-index:200;animation:toastIn .25s ease;}
        .toast{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:14px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 28px rgba(0,0,0,.14);backdrop-filter:blur(8px);min-width:240px;}
        .toast.t-success{background:#fff;border:1px solid #bbf7d0;color:var(--green-text);}
        .toast.t-error{background:#fff;border:1px solid #fecaca;color:#dc2626;}
        .toast-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .toast.t-success .toast-dot{background:var(--green-text);}
        .toast.t-error .toast-dot{background:#dc2626;}

        .admin-notice{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:var(--amber-bg);border:1px solid #fde68a;font-size:12px;font-weight:600;color:var(--amber-text);animation:fadeUp .4s ease both .05s;}

        @media(max-width:768px){
          .dip-topbar{padding:14px 20px;flex-wrap:wrap;height:auto;gap:12px;}
          .dip-body{padding:16px;}
          .dip-stat-row{grid-template-columns:1fr;}
          .panel-toolbar{flex-direction:column;align-items:flex-start;}
          .toolbar-right{width:100%;}
          .search-input{width:100%;}
          .search-input:focus{width:100%;}
        }
      `}</style>

      <div className="dip-root">
        <div className="dip-topbar">
          <div>
            <h1 className="dip-title">
              Deleted Items
              <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#f59e0b',marginLeft:5,marginBottom:2,verticalAlign:'middle'}} />
            </h1>
            <div className="dip-subtitle">Inventory Management System · Admin View</div>
          </div>
        </div>

        <div className="dip-body">

          <div className="admin-notice">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            This page is restricted to ADMIN and SUPERADMIN accounts. Recovered products will be immediately restored to Active status.
          </div>

          {/* PR-03: error banner with retry — only shown after loading */}
          {fetchError && !isLoading && (
            <div className="err-banner">
              <span>⚠ {fetchError}</span>
              <button className="err-retry" onClick={fetchDeleted}>Try again</button>
            </div>
          )}

          <div className="dip-stat-row">
            <div className="stat-card s-del">
              <div className="sc-orb sc-orb-a" /><div className="sc-orb sc-orb-b" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 17 6"/><path d="M8 6V4h4v2"/><path d="M14 6l-1 10H7L6 6"/>
                  </svg>
                </div>
                <span className="stat-badge">Archive</span>
              </div>
              <div className="stat-label">Deleted Items</div>
              <div className="stat-value">{totalDeleted}</div>
              <div className="stat-sub">Soft-deleted, recoverable</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">INACTIVE status</span></div>
                <span className="stat-badge">Admin only</span>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:'100%'}} /></div>
            </div>

            <div className="stat-card s-info">
              <div className="sc-orb sc-orb-a" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 2v10M5 8l4 4 4-4"/><path d="M3 16h12"/>
                  </svg>
                </div>
                <span className="stat-badge">Action</span>
              </div>
              <div className="stat-label">Awaiting Recovery</div>
              <div className="stat-value">{visibleProducts.length}</div>
              <div className="stat-sub">Matching current filter</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">Click Recover to restore</span></div>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:totalDeleted>0?`${Math.round((visibleProducts.length/totalDeleted)*100)}%`:'0%'}} /></div>
            </div>

            <div className="stat-card s-info">
              <div className="sc-orb sc-orb-a" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="7"/><path d="M6 9l2 2 4-4"/>
                  </svg>
                </div>
                <span className="stat-badge">Info</span>
              </div>
              <div className="stat-label">Recovery Info</div>
              <div className="stat-value" style={{fontSize:22,paddingTop:6}}>Soft Delete</div>
              <div className="stat-sub">Data is never permanently lost</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">Restored to ACTIVE instantly</span></div>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:'100%'}} /></div>
            </div>
          </div>

          <div className="table-panel">
            <div className="panel-toolbar">
              <div className="toolbar-left">
                <span className="panel-title">Deleted Products</span>
                <span className="count-chip">{visibleProducts.length} record{visibleProducts.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="toolbar-right">
                <div className="search-wrap">
                  <span className="search-icon">⌕</span>
                  <input
                    className="search-input"
                    placeholder="Search by code or name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PR-03: loading → error → empty → data */}
            {isLoading ? (
              <div className="table-state">
                <div className="loader" />
                <p>Loading deleted products…</p>
              </div>
            ) : fetchError ? (
              <div className="table-state">
                <div className="state-icon">⚠️</div>
                <p className="state-title">Failed to load</p>
                <p>{fetchError}</p>
                <button onClick={fetchDeleted} style={{marginTop:14,padding:'7px 18px',borderRadius:8,border:'1px solid #fecaca',background:'#fef2f2',color:'#b91c1c',fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  Try again
                </button>
              </div>
            ) : (
              <table className="dip-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('prodcode')}>Code <SortIcon col="prodcode" /></th>
                    <th onClick={() => handleSort('description')}>Description <SortIcon col="description" /></th>
                    <th onClick={() => handleSort('stamp')}>Stamp <SortIcon col="stamp" /></th>
                    <th className="th-noclick">Status</th>
                    <th className="th-noclick">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        {/* PR-03: proper empty state with icon and title */}
                        <div className="table-state">
                          <div className="state-icon">
                            {search ? '🔍' : '🗑️'}
                          </div>
                          <p className="state-title">
                            {search ? 'No results found' : 'Archive is clean'}
                          </p>
                          <p>
                            {search ? 'No deleted products match your search.' : 'No deleted products found.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map(p => (
                      <tr key={p.prodcode}>
                        <td><span className="cell-code">{p.prodcode}</span></td>
                        <td><span className="cell-desc">{p.description}</span></td>
                        <td><span className="cell-stamp">{p.stamp || '—'}</span></td>
                        <td>
                          <span className="badge-inactive">
                            <span className="badge-dot" />INACTIVE
                          </span>
                        </td>
                        <td>
                          <button
                            className="recover-btn"
                            onClick={() => handleRecover(p.prodcode)}
                            disabled={recoveringCode === p.prodcode}
                          >
                            {recoveringCode === p.prodcode
                              ? <><span className="btn-spinner" /> Restoring…</>
                              : <>↩ Recover</>}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-wrap">
          <div className={`toast t-${toast.type}`}><span className="toast-dot" />{toast.msg}</div>
        </div>
      )}
    </>
  );
};

export default DeletedItemsPage;
