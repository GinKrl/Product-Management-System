import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService.js';


// ─────────────────────────────────────────────────────────────
// Dashboard — content only.
// The sidebar, navbar, and layout wrapper live in AppShell.jsx
// (PR-03). Do NOT add a sidebar or full-screen flex wrapper here.
// ─────────────────────────────────────────────────────────────


const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);


  useEffect(() => { fetchProducts(); }, []);


  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await productService.getAllProducts();
    if (!error) setProducts(data || []);
    setLoading(false);
  };


 
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2);
  const lowStock   = products.filter(p => p.stock < 10).length;


  const stats = [
    {
      label: 'Total Products', value: products.length, trend: 'Items in system',
      accent: '#2563eb', bg: '#eff6ff',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      label: 'Low Stock', value: lowStock, trend: 'Needs attention',
      accent: '#d97706', bg: '#fffbeb',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      ),
    },
    {
      label: 'Total Value', value: `$${totalValue}`, trend: 'Inventory worth',
      accent: '#16a34a', bg: '#f0fdf4',
      icon: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
    },
  ];


  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .f1{animation:fadeUp .38s ease both .04s;}
        .f2{animation:fadeUp .38s ease both .08s;}
        .f3{animation:fadeUp .38s ease both .12s;}
        .f4{animation:fadeUp .38s ease both .16s;}
        .f5{animation:fadeUp .38s ease both .20s;}
        .stat-card{transition:transform .2s,box-shadow .2s;}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.09);}
        .trow:hover td{background:#fafbfc;}
        .trow td{transition:background .12s;}
        .dash-bg { background:linear-gradient(160deg,#f8f9fc 0%,#f0f2f5 100%); min-height:100%; font-family:'DM Sans',sans-serif; }
        .top-bar {
          position:sticky; top:0; z-index:20;
          background:rgba(248,249,252,0.88);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(0,0,0,0.06);
          padding:18px 32px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .add-btn { transition:transform .15s, box-shadow .15s; }
        .add-btn:hover { transform:translateY(-1px); }
      `}</style>


      <div className="dash-bg">


        {/* ── TOP HEADER ── */}
        <div className="top-bar">
          <div className="f1">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#b91c1c', background:'#fef2f2', padding:'2px 8px', borderRadius:999 }}>
                Live
              </span>
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:25, color:'#0f0a1e', margin:0, letterSpacing:-0.4 }}>
              Workspace Overview
            </h1>
            <p style={{ fontSize:11, color:'#9ca3af', margin:'2px 0 0' }}>
              Manage your inventory and product listings.
            </p>
          </div>


          <div style={{ display:'flex', alignItems:'center', gap:10 }} className="f1">
            {/* Refresh */}
            <button
              onClick={fetchProducts}
              title="Refresh"
              style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:12, border:'1px solid #e5e7eb', background:'#fff', color:'#9ca3af', cursor:'pointer', flexShrink:0 }}
              onMouseEnter={e => { e.currentTarget.style.color='#b91c1c'; e.currentTarget.style.borderColor='#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='#e5e7eb'; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>


            {/* Add Product */}
            <button
              className="add-btn"
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:12, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", background:'linear-gradient(135deg,#7f1d1d,#b91c1c 55%,#e11d48)', boxShadow:'0 4px 16px rgba(185,28,28,0.32)' }}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.8">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Product
            </button>
          </div>
        </div>


        {/* ── BODY ── */}
        <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:22 }}>


          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {stats.map((s, i) => (
              <div key={i} className={`stat-card f${i + 2}`} style={{ background:'#fff', borderRadius:18, padding:20, border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', position:'relative', overflow:'hidden' }}>
                {/* Accent bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'18px 18px 0 0', background:`linear-gradient(90deg,${s.accent},transparent)` }} />
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#9ca3af', margin:'0 0 10px' }}>{s.label}</p>
                    <p style={{ fontSize:30, fontWeight:700, color:s.accent, margin:0, letterSpacing:-1 }}>{s.value}</p>
                    <p style={{ fontSize:11, color:'#d1d5db', margin:'6px 0 0' }}>{s.trend}</p>
                  </div>
                  <div style={{ width:42, height:42, borderRadius:14, background:s.bg, color:s.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Product table */}
          <div className="f5" style={{ background:'#fff', borderRadius:18, border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>


            {/* Toolbar */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f0a1e', margin:0 }}>Product Listings</p>
                <p style={{ fontSize:11, color:'#9ca3af', margin:'2px 0 0' }}>
                  {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} in inventory`}
                </p>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, fontSize:12, color:'#6b7280', width:200, cursor:'text' }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search products…"
                  style={{ background:'transparent', border:'none', outline:'none', fontSize:12, color:'#374151', width:'100%', fontFamily:"'DM Sans',sans-serif" }}
                />
              </label>
            </div>




            {/* Table */}
            <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
              <thead>
                <tr style={{ background:'linear-gradient(90deg,#fafafa,#f7f8fa)' }}>
                  {['Product','Price','Stock Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 24px', fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:1.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ padding:'64px 24px', textAlign:'center' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', border:'2.5px solid #b91c1c', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />
                      <span style={{ fontSize:13, color:'#9ca3af', fontWeight:500 }}>Loading products…</span>
                    </div>
                  </td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding:'72px 24px', textAlign:'center' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                      <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#fef2f2,#fee2e2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(185,28,28,0.10)' }}>
                        <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#b91c1c" strokeWidth="1.6">
                          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:'#4b5563', margin:0 }}>No products yet</p>
                        <p style={{ fontSize:12, color:'#9ca3af', margin:'4px 0 0' }}>
                          Click <strong style={{ color:'#b91c1c' }}>Add Product</strong> to get started.
                        </p>
                      </div>
                    </div>
                  </td></tr>
                ) : (
                  products.map((product, idx) => {
                    const isLow = product.stock < 10;
                    return (
                      <tr key={product.id} className="trow" style={{ borderTop:'1px solid #f3f4f6', background: idx % 2 !== 0 ? 'rgba(249,250,251,0.5)' : 'transparent' }}>
                        <td style={{ padding:'14px 24px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#fef2f2,#fee2e2)', color:'#b91c1c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                              {product.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:'#0f0a1e', margin:0 }}>{product.name}</p>
                              <p style={{ fontSize:10, color:'#9ca3af', margin:'1px 0 0' }}>SKU #{String(product.id).padStart(4,'0')}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>${product.price}</span>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, border:'1px solid', background: isLow ? '#fffbeb':'#f0fdf4', color: isLow ? '#d97706':'#16a34a', borderColor: isLow ? '#fde68a':'#bbf7d0' }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background: isLow ? '#f59e0b':'#22c55e', display:'inline-block' }} />
                            {product.stock} in stock
                          </span>
                        </td>
                        <td style={{ padding:'14px 24px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', fontSize:12, fontWeight:600, color:'#6b7280', background:'transparent', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}
                              onMouseEnter={e => { e.currentTarget.style.color='#b91c1c'; e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.borderColor='#fca5a5'; }}
                              onMouseLeave={e => { e.currentTarget.style.color='#6b7280'; e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#e5e7eb'; }}
                            >
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            <button
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', fontSize:12, fontWeight:600, color:'#6b7280', background:'transparent', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}
                              onMouseEnter={e => { e.currentTarget.style.color='#dc2626'; e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.borderColor='#fca5a5'; }}
                              onMouseLeave={e => { e.currentTarget.style.color='#6b7280'; e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#e5e7eb'; }}
                            >
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
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


            {/* Table footer */}
            {!loading && products.length > 0 && (
              <div style={{ padding:'12px 24px', borderTop:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>Showing all {products.length} products</p>
                <div style={{ display:'flex', gap:6 }}>
                  {['← Prev', 'Next →'].map(label => (
                    <button key={label} style={{ padding:'6px 14px', fontSize:11, color:'#6b7280', background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                      {label}
                    </button>
                  ))}
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