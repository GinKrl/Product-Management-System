import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

const fetchTopSelling = async () => {
  const { data, error } = await supabase
    .from('salesdetail')
    .select('prodcode, quantity, product(description, unit, record_status)');
  if (error) throw error;

  const totals = {};
  for (const row of data || []) {
    if (!totals[row.prodcode]) {
      totals[row.prodcode] = {
        prodcode: row.prodcode,
        description: row.product?.description ?? row.prodcode,
        unit: row.product?.unit ?? '',
        record_status: row.product?.record_status ?? 'ACTIVE',
        total_qty: 0,
      };
    }
    totals[row.prodcode].total_qty += Number(row.quantity || 0);
  }
  return Object.values(totals)
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 10);
};

const BAR_COLORS = [
  '#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171',
  '#fca5a5', '#fcd34d', '#6ee7b7', '#93c5fd', '#c4b5fd',
];
const MEDALS = ['🥇', '🥈', '🥉'];

/* PR-03: skeleton summary card — prevents "—" flash during load */
const SummarySkeleton = ({ iconBg }) => (
  <div style={{
    background: '#fff', border: '1px solid rgba(0,0,0,.07)',
    borderRadius: 16, padding: '18px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,.04)',
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg || '#f3f4f6', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{
        height: 9, width: '48%', borderRadius: 4, marginBottom: 8,
        background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)',
        backgroundSize: '200% 100%', animation: 'ts-shimmer 1.4s infinite',
      }} />
      <div style={{
        height: 20, width: '65%', borderRadius: 5,
        background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)',
        backgroundSize: '200% 100%', animation: 'ts-shimmer 1.4s infinite',
      }} />
    </div>
  </div>
);

const TopSellingPage = () => {
  const [rows, setRows]         = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [view, setView]         = useState('chart');

  /* PR-03: named function so retry button can call it */
  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchTopSelling()
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const maxQty    = useMemo(() => Math.max(...rows.map(r => r.total_qty), 1), [rows]);
  const totalSold = useMemo(() => rows.reduce((s, r) => s + r.total_qty, 0), [rows]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        :root{
          --red-deep:#7f1d1d;--red-mid:#b91c1c;--red-bright:#e11d48;--red-glow:rgba(185,28,28,.15);--red-pale:#fef2f2;
          --ink:#0c0a0f;--ink-2:#1f1c28;--ink-3:#374151;--muted:#9ca3af;--border:rgba(0,0,0,.07);
          --surface:#fff;--bg:#f7f7f9;--green-bg:#f0fdf4;--green-text:#15803d;
          --amber-bg:#fffbeb;--amber-text:#b45309;--blue-bg:#eff6ff;--blue-text:#1d4ed8;--violet-bg:#f5f3ff;--violet-text:#6d28d9;
        }
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes rowIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes numIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ts-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        .ts-root{font-family:'DM Sans',sans-serif;color:var(--ink);}
        .ts-topbar{position:sticky;top:0;z-index:30;background:rgba(247,247,249,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 36px;height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px;animation:fadeUp .4s ease both;}
        .ts-title{font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:var(--ink);margin:0;letter-spacing:-.3px;}
        .ts-subtitle{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;}
        .view-toggle{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:3px;gap:2px;}
        .vt-btn{padding:6px 14px;border:none;border-radius:7px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;background:transparent;color:var(--muted);}
        .vt-btn.active{background:linear-gradient(135deg,var(--red-deep),var(--red-mid) 55%,var(--red-bright));color:#fff;box-shadow:0 2px 8px var(--red-glow);}

        .ts-body{padding:28px 36px;display:flex;flex-direction:column;gap:24px;}

        .summary-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;animation:fadeUp .4s ease both .07s;}
        .ss-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 4px rgba(0,0,0,.04);transition:transform .2s;}
        .ss-card:hover{transform:translateY(-2px);}
        .ss-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ss-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:2px;}
        .ss-val{font-family:'DM Serif Display',serif;font-size:26px;line-height:1;color:var(--ink);animation:numIn .5s ease both;}

        /* PR-03: consistent error banner with retry */
        .err-banner{padding:14px 18px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .err-retry-btn{padding:7px 16px;border-radius:8px;border:1px solid #fecaca;background:#fff;color:#b91c1c;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0;}
        .err-retry-btn:hover{background:#fef2f2;}

        .chart-panel{background:var(--surface);border-radius:20px;border:1px solid var(--border);overflow:hidden;animation:fadeUp .4s ease both .14s;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .chart-header{padding:20px 24px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;}
        .chart-title{font-size:14px;font-weight:700;color:var(--ink-3);}
        .chart-sub{font-size:11px;color:var(--muted);margin-top:2px;}
        .chart-area{padding:24px 28px 28px;}

        .bar-row{display:flex;align-items:center;gap:14px;margin-bottom:14px;animation:rowIn .4s ease both;}
        .bar-rank{width:28px;text-align:center;font-size:11px;font-weight:800;color:var(--muted);flex-shrink:0;}
        /* PR-03: bar-info fixed width desktop, narrowed on mobile without collapsing text */
        .bar-info{width:160px;min-width:0;flex-shrink:0;}
        .bar-code{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:var(--violet-text);background:var(--violet-bg);padding:2px 7px;border-radius:5px;display:inline-block;letter-spacing:.3px;margin-bottom:3px;}
        .bar-desc{font-size:12px;font-weight:600;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .bar-track{flex:1;height:28px;background:#f3f4f6;border-radius:8px;overflow:hidden;position:relative;}
        .bar-fill{height:100%;border-radius:8px;display:flex;align-items:center;padding-left:10px;transition:width 1s cubic-bezier(.22,1,.36,1);}
        .bar-qty{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:#fff;white-space:nowrap;}
        .bar-qty-out{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:var(--ink-3);white-space:nowrap;margin-left:10px;}
        .bar-pct{width:44px;text-align:right;font-size:11px;font-weight:700;color:var(--muted);flex-shrink:0;}

        .tbl-panel{background:var(--surface);border-radius:20px;border:1px solid var(--border);overflow:hidden;animation:fadeUp .4s ease both .14s;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .ts-table{width:100%;border-collapse:collapse;}
        .ts-table thead{background:#fafafa;}
        .ts-table th{padding:10px 20px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;text-align:left;}
        .ts-table td{padding:13px 20px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:var(--ink-3);vertical-align:middle;}
        .ts-table tbody tr{transition:background .12s;}
        .ts-table tbody tr:hover td{background:#fafafa;}
        .rank-medal{font-size:18px;}
        .rank-num{font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:var(--muted);}
        .qty-pill{font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:var(--blue-text);background:var(--blue-bg);padding:4px 10px;border-radius:8px;display:inline-block;}
        .share-bar{width:100px;height:8px;border-radius:99px;background:#f3f4f6;overflow:hidden;display:inline-block;}
        .share-fill{height:100%;border-radius:99px;background:var(--red-mid);}

        .tbl-state{padding:56px 24px;text-align:center;color:var(--muted);}
        .tbl-state-title{font-size:14px;font-weight:600;color:var(--ink-3);margin-bottom:4px;}
        .tbl-state p{margin:0;font-size:13px;}
        .loader{width:26px;height:26px;border:3px solid #f3f4f6;border-top-color:var(--red-mid);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}

        @media(max-width:768px){
          .ts-topbar{padding:14px 20px;flex-wrap:wrap;height:auto;}
          .ts-body{padding:20px;}
          .summary-strip{grid-template-columns:1fr;}
          /* PR-03: mobile bar-info narrows without cutting off abruptly */
          .bar-info{width:90px;}
          .bar-pct{width:36px;font-size:10px;}
        }
      `}</style>

      <div className="ts-root">
        <div className="ts-topbar">
          <div>
            <h1 className="ts-title">
              Top Selling Products
              <span style={{ display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#e11d48',marginLeft:5,marginBottom:2,verticalAlign:'middle' }} />
            </h1>
            <div className="ts-subtitle">REP_002 · Top 10 by Total Quantity Sold</div>
          </div>
          <div className="view-toggle">
            <button className={`vt-btn ${view==='chart'?'active':''}`} onClick={() => setView('chart')}>▦ Chart</button>
            <button className={`vt-btn ${view==='table'?'active':''}`} onClick={() => setView('table')}>☰ Table</button>
          </div>
        </div>

        <div className="ts-body">

          {/* PR-03: error banner — only shown after loading completes, with retry */}
          {error && !isLoading && (
            <div className="err-banner">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>⚠️</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#991b1b' }}>Failed to load sales data</div>
                  <div style={{ fontSize:12, color:'#b91c1c', marginTop:2 }}>{error}</div>
                </div>
              </div>
              <button className="err-retry-btn" onClick={loadData}>↺ Retry</button>
            </div>
          )}

          {/* PR-03: summary strip — skeleton while loading, real values after */}
          <div className="summary-strip">
            {isLoading ? (
              <>
                <SummarySkeleton iconBg="#fef2f2" />
                <SummarySkeleton iconBg="#dbeafe" />
                <SummarySkeleton iconBg="#dcfce7" />
              </>
            ) : (
              <>
                <div className="ss-card">
                  <div className="ss-icon" style={{ background: '#fef2f2' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth="1.8">
                      <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ss-label">Top Product</div>
                    <div className="ss-val" style={{ fontSize:16, paddingTop:2 }}>
                      {rows[0]?.description?.split(' ').slice(0,3).join(' ') || '—'}
                    </div>
                  </div>
                </div>
                <div className="ss-card">
                  <div className="ss-icon" style={{ background: '#dbeafe' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth="1.8">
                      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ss-label">Top 10 Total Units</div>
                    <div className="ss-val">{totalSold.toLocaleString()}</div>
                  </div>
                </div>
                <div className="ss-card">
                  <div className="ss-icon" style={{ background: '#dcfce7' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#15803d" strokeWidth="1.8">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div>
                    <div className="ss-label">Highest Single Product</div>
                    <div className="ss-val">
                      {rows[0] ? `${rows[0].total_qty.toLocaleString()} ${rows[0].unit}` : '—'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chart / Table view */}
          {isLoading ? (
            <div className="chart-panel">
              <div className="tbl-state">
                <div className="loader" />
                {/* PR-03: title line added to loading state */}
                <div className="tbl-state-title">Loading top sellers…</div>
                <p>Fetching sales data from the database</p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="chart-panel">
              <div className="tbl-state">
                <div style={{ fontSize:28, marginBottom:8 }}>📊</div>
                {/* PR-03: title line added to empty state */}
                <div className="tbl-state-title">No sales data found</div>
                <p>No transactions have been recorded yet.</p>
              </div>
            </div>
          ) : view === 'chart' ? (
            <div className="chart-panel">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Sales Volume — Top 10 Products</div>
                  <div className="chart-sub">Ranked by total quantity sold across all transactions</div>
                </div>
              </div>
              <div className="chart-area">
                {rows.map((r, idx) => {
                  const pct   = (r.total_qty / maxQty) * 100;
                  const share = totalSold ? ((r.total_qty / totalSold) * 100).toFixed(1) : 0;
                  const wide  = pct > 30;
                  return (
                    <div key={r.prodcode} className="bar-row" style={{ animationDelay:`${idx * 0.05}s` }}>
                      <div className="bar-rank">
                        {idx < 3 ? <span style={{ fontSize:16 }}>{MEDALS[idx]}</span> : `#${idx+1}`}
                      </div>
                      <div className="bar-info">
                        <div><span className="bar-code">{r.prodcode}</span></div>
                        <div className="bar-desc" title={r.description}>{r.description}</div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width:`${pct}%`, background:BAR_COLORS[idx] ?? '#9ca3af' }}>
                          {wide && <span className="bar-qty">{r.total_qty.toLocaleString()}</span>}
                        </div>
                        {!wide && <span className="bar-qty-out">{r.total_qty.toLocaleString()}</span>}
                      </div>
                      <div className="bar-pct">{share}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="tbl-panel">
              <div style={{ padding:'16px 22px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--ink-3)' }}>Ranked Table</span>
                <span style={{ background:'var(--red-pale)', color:'var(--red-mid)', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>Top {rows.length}</span>
              </div>
              <table className="ts-table">
                <thead>
                  <tr>
                    <th>Rank</th><th>Code</th><th>Product</th><th>Unit</th><th>Qty Sold</th><th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const share = totalSold ? (r.total_qty / totalSold) * 100 : 0;
                    return (
                      <tr key={r.prodcode}>
                        <td>{idx < 3 ? <span className="rank-medal">{MEDALS[idx]}</span> : <span className="rank-num">#{idx+1}</span>}</td>
                        <td><span style={{ fontFamily:"'DM Mono',monospace",fontSize:11.5,fontWeight:500,color:'var(--violet-text)',background:'var(--violet-bg)',padding:'3px 8px',borderRadius:6 }}>{r.prodcode}</span></td>
                        <td><span style={{ fontWeight:600,color:'var(--ink-2)' }}>{r.description}</span></td>
                        <td><span style={{ fontSize:11,fontWeight:600,color:'var(--muted)',background:'#f3f4f6',borderRadius:6,padding:'3px 8px',textTransform:'uppercase' }}>{r.unit}</span></td>
                        <td><span className="qty-pill">{r.total_qty.toLocaleString()}</span></td>
                        <td>
                          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                            <div className="share-bar"><div className="share-fill" style={{ width:`${share}%` }} /></div>
                            <span style={{ fontSize:11,fontWeight:700,color:'var(--muted)' }}>{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopSellingPage;