import React, { useState, useEffect, useMemo } from 'react';
import {
  getProducts,
  addProduct,
  updateProduct,
  softDeleteProduct
} from '../services/productService';

import AddProductModal    from '../components/AddProductModal';
import EditProductModal   from '../components/EditProductModal';
import SoftDeleteDialog   from '../components/SoftDeleteDialog';
import PriceHistoryPanel  from '../components/PriceHistoryPanel';
import { useRights }      from '../hooks/useRights';
import { useAuth }        from '../contexts/AuthContext';

const ProductListPage = () => {
  const { currentUser } = useAuth();
  const { rights }      = useRights();

  const currentUserRole = currentUser?.user_type || 'USER';

  const [products, setProducts]               = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [fetchError, setFetchError]           = useState(null); // PR-03
  const [search, setSearch]                   = useState('');
  const [filter, setFilter]                   = useState('ALL');
  const [isAddOpen, setIsAddOpen]             = useState(false);
  const [isEditOpen, setIsEditOpen]           = useState(false);
  const [isDeleteOpen, setIsDeleteOpen]       = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData]               = useState({ prodcode: '', description: '', unit: '', current_price: '' });
  const [toast, setToast]                     = useState(null);
  const [sortCol, setSortCol]                 = useState(null);
  const [sortDir, setSortDir]                 = useState('asc');
  const [expandedProdcode, setExpandedProdcode] = useState(null);

  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductList = async () => {
    setIsLoading(true);
    setFetchError(null); // PR-03: clear previous error on retry
    try {
      const data = await getProducts(currentUserRole);
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setFetchError('Failed to load products. Please try again.'); // PR-03
      showToast('Failed to load products.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProductList(); }, [currentUserRole]);

  const handleAddSubmit = async () => {
    if (!formData.prodcode || !formData.description || !formData.unit) {
      showToast('All fields are required.', 'error');
      return;
    }
    try {
      await addProduct({ ...formData, record_status: 'ACTIVE' }, currentUser?.id);
      setIsAddOpen(false);
      setFormData({ prodcode: '', description: '', unit: '', current_price: '' });
      fetchProductList();
      showToast('Product added successfully.');
    } catch (error) {
      console.error('Error adding product:', error);
      showToast('Error adding product.', 'error');
    }
  };

  const handleEditSubmit = async () => {
    if (!formData.description || !formData.unit) {
      showToast('Description and unit are required.', 'error');
      return;
    }
    try {
      await updateProduct(selectedProduct.prodcode, {
        description:   formData.description,
        unit:          formData.unit,
        current_price: formData.current_price,
      }, currentUser?.id);
      setIsEditOpen(false);
      fetchProductList();
      showToast('Product updated successfully.');
    } catch (error) {
      console.error('Error updating product:', error);
      showToast('Error updating product.', 'error');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await softDeleteProduct(selectedProduct.prodcode, currentUser?.id);
      setIsDeleteOpen(false);
      fetchProductList();
      showToast('Product deactivated.');
    } catch (error) {
      console.error('Error deactivating product:', error);
      showToast('Error deactivating product.', 'error');
    }
  };

  const openEditModal = (p) => {
    setSelectedProduct(p);
    setFormData({ prodcode: p.prodcode, description: p.description, unit: p.unit, current_price: p.current_price ?? '' });
    setIsEditOpen(true);
  };

  const openDeleteModal = (p) => {
    setSelectedProduct(p);
    setIsDeleteOpen(true);
  };

  const togglePriceHistory = (prodcode) => {
    setExpandedProdcode(prev => prev === prodcode ? null : prodcode);
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const visibleProducts = [...products]
    .filter(p => {
      if (!isAdmin && p.record_status === 'INACTIVE') return false;
      if (filter !== 'ALL' && p.record_status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.description?.toLowerCase().includes(q) || p.prodcode?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortCol) return 0;
      let av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
      if (sortCol === 'current_price') { av = Number(av); bv = Number(bv); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const { totalCount, activeCount, totalValue } = useMemo(() => {
    const active = products.filter(p => p.record_status === 'ACTIVE').length;
    const total  = isAdmin ? products.length : active;
    const value  = products
      .filter(p => isAdmin || p.record_status === 'ACTIVE')
      .reduce((s, p) => s + (Number(p.current_price) || 0), 0);
    return { totalCount: total, activeCount: active, totalValue: value };
  }, [products, isAdmin]);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{opacity:.3,marginLeft:4,fontSize:10}}>⇅</span>;
    return <span style={{marginLeft:4,fontSize:10,color:'#b91c1c'}}>{sortDir==='asc'?'↑':'↓'}</span>;
  };

  const colCount = isAdmin ? 8 : 7;

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
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideIn{from{opacity:0;transform:scale(.97) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes barGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes numIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        .plp-root{background:var(--bg);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--ink);}
        .plp-topbar{position:sticky;top:0;z-index:30;background:rgba(247,247,249,0.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 36px;height:68px;display:flex;align-items:center;justify-content:space-between;gap:20px;animation:fadeUp .4s ease both;}
        .plp-title{font-family:'DM Serif Display',serif;font-size:22px;font-weight:400;color:var(--ink);margin:0;letter-spacing:-.3px;}
        .plp-subtitle{font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;}
        .add-btn{display:flex;align-items:center;gap:8px;padding:10px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--red-deep),var(--red-mid) 55%,var(--red-bright));color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 18px var(--red-glow),0 1px 0 rgba(255,255,255,.15) inset;transition:transform .15s,box-shadow .15s;letter-spacing:.2px;}
        .add-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(185,28,28,.35),0 1px 0 rgba(255,255,255,.15) inset;}
        .add-btn:active{transform:translateY(0);}
        .add-btn-icon{width:18px;height:18px;background:rgba(255,255,255,.22);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;}
        .plp-body{padding:28px 36px;display:flex;flex-direction:column;gap:24px;}
        .stat-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;animation:fadeUp .4s ease both .07s;}
        .stat-card{border-radius:20px;padding:22px 22px 18px;position:relative;overflow:hidden;cursor:default;transition:transform .22s cubic-bezier(.34,1.56,.64,1);}
        .stat-card:hover{transform:translateY(-4px) scale(1.01);}
        .stat-card.s-total{background:#7f1d1d;}
        .stat-card.s-active{background:#fff;border:1px solid rgba(0,0,0,.07);box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .stat-card.s-value{background:#fff;border:1px solid rgba(0,0,0,.07);box-shadow:0 2px 8px rgba(0,0,0,.04);}
        .sc-orb{position:absolute;border-radius:50%;pointer-events:none;z-index:0;}
        .s-total .sc-orb-a{width:120px;height:120px;background:rgba(255,255,255,.06);bottom:-40px;right:-28px;}
        .s-total .sc-orb-b{width:60px;height:60px;background:rgba(255,255,255,.05);top:-16px;right:60px;}
        .s-active .sc-orb-a{width:80px;height:80px;background:#dcfce7;bottom:-24px;right:-18px;}
        .s-value .sc-orb-a{width:80px;height:80px;background:#dbeafe;bottom:-24px;right:-18px;}
        .stat-card>*:not(.sc-orb){position:relative;z-index:1;}
        .stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;}
        .stat-icon-wrap{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .s-total .stat-icon-wrap{background:rgba(255,255,255,.15);}
        .s-active .stat-icon-wrap{background:#dcfce7;}
        .s-value .stat-icon-wrap{background:#dbeafe;}
        .stat-icon-wrap svg{width:18px;height:18px;}
        .stat-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:99px;letter-spacing:.2px;}
        .s-total .stat-badge{background:rgba(255,255,255,.15);color:rgba(255,255,255,.85);}
        .s-active .stat-badge{background:#dcfce7;color:#15803d;}
        .s-value .stat-badge{background:#dbeafe;color:#1d4ed8;}
        .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;margin-bottom:4px;}
        .s-total .stat-label{color:rgba(255,255,255,.55);}
        .s-active .stat-label,.s-value .stat-label{color:var(--muted);}
        .stat-value{font-family:'DM Serif Display',serif;font-size:36px;line-height:1;font-weight:400;letter-spacing:-0.5px;margin-bottom:2px;animation:numIn .5s ease both;}
        .s-total .stat-value{color:#fff;}
        .s-active .stat-value,.s-value .stat-value{color:var(--ink);}
        .stat-sub{font-size:11px;font-weight:500;margin-bottom:16px;}
        .s-total .stat-sub{color:rgba(255,255,255,.4);}
        .s-active .stat-sub,.s-value .stat-sub{color:var(--muted);}
        .stat-divider{height:1px;margin-bottom:12px;}
        .s-total .stat-divider{background:rgba(255,255,255,.12);}
        .s-active .stat-divider,.s-value .stat-divider{background:#f3f4f6;}
        .stat-footer{display:flex;align-items:center;justify-content:space-between;}
        .stat-foot-left{display:flex;align-items:center;gap:6px;}
        .stat-foot-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .s-total .stat-foot-dot{background:rgba(255,255,255,.35);}
        .s-active .stat-foot-dot{background:#4ade80;}
        .s-value .stat-foot-dot{background:#60a5fa;}
        .stat-foot-text{font-size:11px;font-weight:500;}
        .s-total .stat-foot-text{color:rgba(255,255,255,.45);}
        .s-active .stat-foot-text,.s-value .stat-foot-text{color:var(--muted);}
        .stat-bar-track{height:3px;border-radius:99px;margin-top:14px;overflow:hidden;}
        .s-total .stat-bar-track{background:rgba(255,255,255,.12);}
        .s-active .stat-bar-track{background:#f0fdf4;}
        .s-value .stat-bar-track{background:#eff6ff;}
        .stat-bar-fill{height:100%;border-radius:99px;animation:barGrow 1.1s cubic-bezier(.22,1,.36,1) both .35s;transform-origin:left;}
        .s-total .stat-bar-fill{background:rgba(255,255,255,.45);}
        .s-active .stat-bar-fill{background:#4ade80;}
        .s-value .stat-bar-fill{background:#60a5fa;}
        .table-panel{background:var(--surface);border-radius:20px;border:1px solid var(--border);overflow:hidden;animation:fadeUp .4s ease both .14s;box-shadow:0 1px 3px rgba(0,0,0,.04);}
        .panel-toolbar{padding:18px 24px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
        .toolbar-left{display:flex;align-items:center;gap:12px;}
        .panel-title{font-size:14px;font-weight:700;color:var(--ink-3);}
        .count-chip{background:var(--red-pale);color:var(--red-mid);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;}
        .toolbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .search-wrap{position:relative;display:flex;align-items:center;}
        .search-icon{position:absolute;left:10px;color:var(--muted);font-size:13px;pointer-events:none;}
        .search-input{padding:7px 12px 7px 30px;border:1px solid var(--border);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:12px;color:var(--ink-3);outline:none;width:190px;background:var(--bg);transition:border-color .15s,box-shadow .15s,width .25s;}
        .search-input:focus{border-color:var(--red-mid);box-shadow:0 0 0 3px var(--red-glow);width:230px;background:#fff;}
        .search-input::placeholder{color:#c4c4cc;}
        .f-chips{display:flex;gap:6px;}
        .f-chip{padding:5px 14px;border-radius:20px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .15s;}
        .f-chip:hover{border-color:#d1d5db;color:var(--ink-3);}
        .f-chip.fc-all{border-color:var(--red-mid);background:var(--red-pale);color:var(--red-mid);}
        .f-chip.fc-active{border-color:#bbf7d0;background:var(--green-bg);color:var(--green-text);}
        .f-chip.fc-inact{border-color:#fde68a;background:var(--amber-bg);color:var(--amber-text);}
        .plp-table{width:100%;border-collapse:collapse;}
        .plp-table thead{background:#fafafa;}
        .plp-table th{padding:11px 20px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.9px;text-align:left;cursor:pointer;user-select:none;white-space:nowrap;transition:color .15s;}
        .plp-table th:hover{color:var(--ink-3);}
        .plp-table th.th-noclick{cursor:default;}
        .plp-table td{padding:14px 20px;border-top:1px solid #f3f4f6;font-size:13px;font-weight:500;color:var(--ink-3);vertical-align:middle;}
        .plp-table tbody tr{transition:background .12s;}
        .plp-table tbody tr:hover td{background:#fafafa;}
        .plp-table tbody tr.row-expanded td{background:#fef9f9;}
        .plp-table tbody tr.row-panel td{padding:0;border-top:none;}
        .plp-table tbody tr.row-panel:hover td{background:transparent;}
        .cell-code{font-family:'DM Mono',monospace;font-size:11.5px;font-weight:500;color:var(--violet-text);background:var(--violet-bg);padding:4px 9px;border-radius:7px;display:inline-block;letter-spacing:.3px;}
        .cell-desc{color:var(--ink-2);font-weight:600;}
        .cell-unit{font-size:11px;font-weight:600;color:var(--muted);background:#f3f4f6;border-radius:6px;padding:3px 8px;display:inline-block;text-transform:uppercase;letter-spacing:.5px;}
        .cell-price{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:var(--blue-text);}
        .cell-stamp{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
        .badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.3px;}
        .badge-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .badge.b-active{background:var(--green-bg);color:var(--green-text);}
        .badge.b-active .badge-dot{background:var(--green-text);}
        .badge.b-inactive{background:var(--amber-bg);color:var(--amber-text);}
        .badge.b-inactive .badge-dot{background:var(--amber-text);}
        .act-wrap{display:flex;gap:6px;align-items:center;}
        .act-btn{padding:5px 12px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;cursor:pointer;border:1px solid;transition:all .15s;letter-spacing:.2px;display:flex;align-items:center;gap:4px;}
        .act-btn.ab-edit{color:var(--blue-text);border-color:#bfdbfe;background:var(--blue-bg);}
        .act-btn.ab-edit:hover{background:#dbeafe;border-color:#93c5fd;}
        .act-btn.ab-del{color:var(--red-mid);border-color:#fecaca;background:var(--red-pale);}
        .act-btn.ab-del:hover{background:#fee2e2;border-color:#fca5a5;}
        .act-btn.ab-hist{color:var(--violet-text);border-color:#ddd6fe;background:var(--violet-bg);}
        .act-btn.ab-hist:hover{background:#ede9fe;border-color:#c4b5fd;}
        .act-btn.ab-hist.ab-hist-open{background:var(--violet-text);color:#fff;border-color:var(--violet-text);}

        /* PR-03: unified table states */
        .table-state{padding:60px 24px;text-align:center;color:var(--muted);}
        .table-state p{margin:8px 0 0;font-size:13px;}
        .table-state .state-icon{font-size:32px;margin-bottom:8px;}
        .table-state .state-title{font-size:14px;font-weight:700;color:var(--ink-3);margin:0 0 4px;}
        .table-state .state-sub{font-size:12px;color:var(--muted);}
        .loader{width:28px;height:28px;border:3px solid #f3f4f6;border-top-color:var(--red-mid);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;}
        .retry-btn{margin-top:14px;padding:7px 18px;border-radius:8px;border:1px solid #fecaca;background:var(--red-pale);color:var(--red-mid);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:background .15s;}
        .retry-btn:hover{background:#fee2e2;}

        .toast-wrap{position:fixed;bottom:28px;right:28px;z-index:200;animation:toastIn .25s ease;}
        .toast{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:14px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;box-shadow:0 8px 28px rgba(0,0,0,.14);backdrop-filter:blur(8px);min-width:240px;}
        .toast.t-success{background:#fff;border:1px solid #bbf7d0;color:var(--green-text);}
        .toast.t-error{background:#fff;border:1px solid #fecaca;color:#dc2626;}
        .toast-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .toast.t-success .toast-dot{background:var(--green-text);}
        .toast.t-error .toast-dot{background:#dc2626;}
        .modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .18s ease;}
        .modal-box{background:#fff;border-radius:20px;width:100%;max-width:460px;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:slideIn .22s ease;overflow:hidden;}
        .modal-header{padding:26px 26px 0;}
        .modal-eyebrow{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--red-mid);margin-bottom:5px;}
        .modal-title{font-family:'DM Serif Display',serif;font-size:23px;font-weight:400;color:var(--ink);margin:0 0 6px;}
        .modal-sub{font-size:12px;color:var(--muted);line-height:1.55;margin:0;}
        .form-group{padding:0 26px;margin-top:18px;}
        .form-label{display:block;font-size:10px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
        .form-input{width:100%;padding:10px 13px;border:1px solid #e5e7eb;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;background:#fff;transition:border-color .15s,box-shadow .15s;}
        .form-input:focus{border-color:var(--red-mid);box-shadow:0 0 0 3px var(--red-glow);}
        .form-input:disabled{background:#f9fafb;color:var(--muted);cursor:not-allowed;}
        .form-hint{font-size:10px;color:var(--muted);margin-top:5px;}
        .modal-footer{padding:22px 26px 26px;display:flex;justify-content:flex-end;gap:10px;margin-top:20px;}
        .btn-cancel{padding:10px 20px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;color:var(--ink-3);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;}
        .btn-cancel:hover{background:#f9fafb;}
        .btn-primary{padding:10px 22px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--red-deep),var(--red-mid) 55%,var(--red-bright));color:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 3px 12px var(--red-glow);transition:transform .15s,box-shadow .15s;}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(185,28,28,.3);}
        .btn-danger{padding:10px 22px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 3px 12px rgba(220,38,38,.25);transition:transform .15s,box-shadow .15s;}
        .btn-danger:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(220,38,38,.35);}
        .delete-head{display:flex;align-items:center;gap:14px;padding:26px 26px 0;}
        .delete-icon-wrap{width:46px;height:46px;border-radius:13px;background:var(--red-pale);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .delete-detail{margin:18px 26px 0;border:1px solid #f3f4f6;border-radius:12px;overflow:hidden;}
        .delete-detail-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #f9fafb;}
        .delete-detail-row:last-child{border-bottom:none;}
        .detail-key{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;}
        .detail-val{font-family:'DM Mono',monospace;font-size:11px;color:var(--ink-2);}
        .delete-warn{margin:14px 26px 0;background:var(--amber-bg);border:1px solid #fde68a;border-radius:10px;padding:10px 14px;font-size:11px;color:var(--amber-text);line-height:1.5;display:flex;gap:8px;align-items:flex-start;}

        @media(max-width:768px){
          .plp-topbar{padding:14px 20px;flex-wrap:wrap;height:auto;gap:12px;}
          .plp-body{padding:16px;}
          .stat-row{grid-template-columns:1fr;}
          .panel-toolbar{flex-direction:column;align-items:flex-start;}
          .toolbar-right{width:100%;}
          .search-input{width:100%;}
          .search-input:focus{width:100%;}
          .modal-box{max-width:100%;}
        }
      `}</style>

      <div className="plp-root">
        <div className="plp-topbar">
          <div>
            <h1 className="plp-title">
              Product Masterlist
              <span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#e11d48',marginLeft:5,marginBottom:2,verticalAlign:'middle'}} />
            </h1>
            <div className="plp-subtitle">Inventory Management System</div>
          </div>
          {rights.PRD_ADD === 1 && (
            <button className="add-btn" onClick={()=>{setFormData({prodcode:'',description:'',unit:'',current_price:''});setIsAddOpen(true);}}>
              <div className="add-btn-icon">+</div>Add Product
            </button>
          )}
        </div>

        <div className="plp-body">
          <div className="stat-row">
            <div className="stat-card s-total">
              <div className="sc-orb sc-orb-a" /><div className="sc-orb sc-orb-b" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 5l7-3 7 3v8l-7 3-7-3V5z"/><path d="M9 2v14M2 5l7 3 7-3"/>
                  </svg>
                </div>
                <span className="stat-badge">Catalog</span>
              </div>
              <div className="stat-label">Total Items</div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-sub">{isAdmin?'Active + inactive records':'Active records only'}</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">{activeCount} active now</span></div>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:totalCount>0?`${Math.round((activeCount/totalCount)*100)}%`:'0%'}} /></div>
            </div>

            <div className="stat-card s-active">
              <div className="sc-orb sc-orb-a" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="7"/><path d="M6 9l2 2 4-4"/>
                  </svg>
                </div>
                <span className="stat-badge">Live</span>
              </div>
              <div className="stat-label">Active Items</div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-sub">In circulation</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">{totalCount>0?Math.round((activeCount/totalCount)*100):0}% of catalog</span></div>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:totalCount>0?`${Math.round((activeCount/totalCount)*100)}%`:'0%'}} /></div>
            </div>

            <div className="stat-card s-value">
              <div className="sc-orb sc-orb-a" />
              <div className="stat-top">
                <div className="stat-icon-wrap">
                  <svg viewBox="0 0 18 18" fill="none" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="9" r="7"/><path d="M9 5v1.5M9 11.5V13M6.5 7.5C6.5 6.67 7.17 6 8 6h2a1.5 1.5 0 010 3H8a1.5 1.5 0 000 3h2c.83 0 1.5-.67 1.5-1.5"/>
                  </svg>
                </div>
                <span className="stat-badge">Pricing</span>
              </div>
              <div className="stat-label">Catalog Value</div>
              <div className="stat-value">₱{totalValue.toLocaleString()}</div>
              <div className="stat-sub">Sum of all prices</div>
              <div className="stat-divider" />
              <div className="stat-footer">
                <div className="stat-foot-left"><div className="stat-foot-dot" /><span className="stat-foot-text">Avg ₱{activeCount>0?Math.round(totalValue/activeCount).toLocaleString():0} / item</span></div>
              </div>
              <div className="stat-bar-track"><div className="stat-bar-fill" style={{width:'57%'}} /></div>
            </div>
          </div>

          <div className="table-panel">
            <div className="panel-toolbar">
              <div className="toolbar-left">
                <span className="panel-title">Product Listings</span>
                <span className="count-chip">{visibleProducts.length} shown</span>
              </div>
              <div className="toolbar-right">
                <div className="search-wrap">
                  <span className="search-icon">⌕</span>
                  <input className="search-input" placeholder="Search by code or name…" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                <div className="f-chips">
                  <button className={`f-chip ${filter==='ALL'?'fc-all':''}`} onClick={()=>setFilter('ALL')}>All</button>
                  <button className={`f-chip ${filter==='ACTIVE'?'fc-active':''}`} onClick={()=>setFilter('ACTIVE')}>Active</button>
                  {isAdmin && <button className={`f-chip ${filter==='INACTIVE'?'fc-inact':''}`} onClick={()=>setFilter('INACTIVE')}>Inactive</button>}
                </div>
              </div>
            </div>

            {/* PR-03: loading → error → empty → data */}
            {isLoading ? (
              <div className="table-state">
                <div className="loader" />
                <p>Loading products…</p>
              </div>
            ) : fetchError ? (
              <div className="table-state">
                <div className="state-icon">⚠️</div>
                <p className="state-title">Something went wrong</p>
                <p className="state-sub">{fetchError}</p>
                <button className="retry-btn" onClick={fetchProductList}>Try again</button>
              </div>
            ) : (
              <table className="plp-table">
                <thead>
                  <tr>
                    <th onClick={()=>handleSort('prodcode')}>Code <SortIcon col="prodcode" /></th>
                    <th onClick={()=>handleSort('description')}>Description <SortIcon col="description" /></th>
                    <th className="th-noclick">Unit</th>
                    <th onClick={()=>handleSort('current_price')}>Price <SortIcon col="current_price" /></th>
                    <th onClick={()=>handleSort('record_status')}>Status <SortIcon col="record_status" /></th>
                    {isAdmin && <th onClick={()=>handleSort('stamp')}>Last Updated <SortIcon col="stamp" /></th>}
                    <th className="th-noclick">History</th>
                    <th className="th-noclick">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.length === 0 ? (
                    <tr>
                      <td colSpan={colCount}>
                        <div className="table-state">
                          <div className="state-icon">📦</div>
                          <p className="state-title">No products found</p>
                          <p className="state-sub">Try adjusting your search or filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map(p => {
                      const isExpanded = expandedProdcode === p.prodcode;
                      return (
                        <React.Fragment key={p.prodcode}>
                          <tr className={isExpanded ? 'row-expanded' : ''}>
                            <td><span className="cell-code">{p.prodcode}</span></td>
                            <td><span className="cell-desc">{p.description}</span></td>
                            <td><span className="cell-unit">{p.unit}</span></td>
                            <td><span className="cell-price">₱{(Number(p.current_price)||0).toLocaleString()}</span></td>
                            <td>
                              <span className={`badge ${p.record_status==='ACTIVE'?'b-active':'b-inactive'}`}>
                                <span className="badge-dot" />{p.record_status}
                              </span>
                            </td>
                            {isAdmin && <td><span className="cell-stamp">{p.stamp || '—'}</span></td>}
                            <td>
                              <button
                                className={`act-btn ab-hist ${isExpanded?'ab-hist-open':''}`}
                                onClick={()=>togglePriceHistory(p.prodcode)}
                                title={isExpanded?'Collapse price history':'View price history'}
                              >
                                {isExpanded ? '▲ Hide' : 'History'}
                              </button>
                            </td>
                            <td>
                              <div className="act-wrap">
                                {rights.PRD_EDIT === 1 && <button className="act-btn ab-edit" onClick={()=>openEditModal(p)}>✎ Edit</button>}
                                {rights.PRD_DEL === 1  && <button className="act-btn ab-del"  onClick={()=>openDeleteModal(p)}>⊘ Delete</button>}
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="row-panel">
                              <td colSpan={colCount}>
                                <PriceHistoryPanel prodcode={p.prodcode} isAdmin={isAdmin} onClose={()=>setExpandedProdcode(null)} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AddProductModal   isOpen={isAddOpen}    onClose={()=>setIsAddOpen(false)}   formData={formData} setFormData={setFormData} onSubmit={handleAddSubmit} />
      <EditProductModal  isOpen={isEditOpen}   onClose={()=>setIsEditOpen(false)}  formData={formData} setFormData={setFormData} selectedProduct={selectedProduct} onSubmit={handleEditSubmit} />
      <SoftDeleteDialog  isOpen={isDeleteOpen} onClose={()=>setIsDeleteOpen(false)} selectedProduct={selectedProduct} onSubmit={handleDeleteSubmit} />

      {toast && (
        <div className="toast-wrap">
          <div className={`toast t-${toast.type}`}><span className="toast-dot" />{toast.msg}</div>
        </div>
      )}
    </>
  );
};

export default ProductListPage;