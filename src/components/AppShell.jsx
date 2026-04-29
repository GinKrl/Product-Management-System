// src/components/AppShell.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRightsContext } from '../contexts/UserRightsContext';
import { supabase } from '../lib/supabaseClient';

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      {
        label: 'Products',
        href: '/products',
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          </svg>
        ),
      },
      {
        label: 'Orders',
        href: '#',
        badge: '4',
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M9 17H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3" />
            <path d="M13 13h8m0 0l-3-3m3 3l-3 3" />
          </svg>
        ),
      },
      {
        label: 'Customers',
        href: '#',
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            <path d="M16 3.13a4 4 0 010 7.75" />
            <path d="M21 21v-2a4 4 0 00-3-3.87" />
          </svg>
        ),
      },
      {
        label: 'Deleted Items',
        href: '/deleted-items',
        roles: ['ADMIN', 'SUPERADMIN'],
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <polyline points="3 6 5 6 21 6" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Analytics',
    items: [
      {
        label: 'Product Report',
        href: '/reports/products',
        // FIX: was roles: ['ADMIN','SUPERADMIN'] — must gate by REP_001 right
        // USER also has REP_001=1 so role-gating was wrong
        // requiredRight is handled by ProtectedRoute; here we just show/hide in nav
        requiredRight: 'REP_001',
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        ),
      },
      {
        label: 'Top Selling',
        href: '/reports/top-selling',
        // FIX: was roles: ['ADMIN','SUPERADMIN'] — must gate by REP_002 right
        // REP_002=1 only for SUPERADMIN per rights matrix
        requiredRight: 'REP_002',
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        ),
      },
      {
        label: 'Insights',
        href: '#',
        roles: ['ADMIN', 'MANAGER'],
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Settings',
    roles: ['ADMIN', 'SUPERADMIN'],
    items: [
      {
        label: 'Team',
        href: '#',
        roles: ['ADMIN', 'SUPERADMIN'],
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
      {
        label: 'Preferences',
        href: '#',
        roles: ['ADMIN', 'SUPERADMIN'],
        icon: (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41" />
          </svg>
        ),
      },
    ],
  },
];

// FIX: updated canSee to also handle requiredRight using rights from context
// This is called inside the component where rights is available
const canSeeByRole = (allowedRoles, userRole) => {
  if (!allowedRoles) return true;
  if (!userRole) return false;
  return allowedRoles.some(r => r.toUpperCase() === userRole.toUpperCase());
};

const getPageLabel = (pathname) => {
  const map = {
    '/products':            'Products',
    '/deleted-items':       'Deleted Items',
    '/reports/products':    'Product Report',
    '/reports/top-selling': 'Top Selling',
    '/admin/users':         'User Management',
    '/orders':              'Orders',
    '/customers':           'Customers',
    '/insights':            'Insights',
  };
  return map[pathname] ?? 'Dashboard';
};

const AppShell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, loading: loadingAuth } = useAuth();
  const { userRole, rights, loadingRights }   = useRightsContext();

  const userEmail    = currentUser?.email || 'User';
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  const currentRole  = userRole?.toUpperCase() || 'USER';
  const isSyncing    = loadingAuth || loadingRights;

  const SIDEBAR_W   = 232;
  const COLLAPSED_W = 64;
  const NAVBAR_H    = 56;
  const effectiveW  = sidebarOpen ? SIDEBAR_W : COLLAPSED_W;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) setMobileOpen(o => !o);
    else setSidebarOpen(s => !s);
  };

  const AMBER_ROUTES = new Set(['/deleted-items']);
  const BLUE_ROUTES  = new Set(['/reports/products', '/reports/top-selling']);

  const getActiveStyle = (href) => {
    if (AMBER_ROUTES.has(href)) return { bg: 'linear-gradient(90deg,#fffbeb,#fef3c7)', color: '#b45309', border: '#f59e0b' };
    if (BLUE_ROUTES.has(href))  return { bg: 'linear-gradient(90deg,#eff6ff,#dbeafe)', color: '#1d4ed8', border: '#3b82f6' };
    return { bg: 'linear-gradient(90deg,#fef2f2,#fee2e2)', color: '#b91c1c', border: '#b91c1c' };
  };

  // FIX: canSee now checks both roles AND requiredRight
  const canSeeItem = (item) => {
    if (item.requiredRight) {
      return rights[item.requiredRight] === 1;
    }
    return canSeeByRole(item.roles, currentRole);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f2f5; }
        .shell-sidebar { transition: width 0.24s cubic-bezier(.4,0,.2,1); overflow: hidden; }
        .nav-item { transition: background 0.12s, color 0.12s; white-space: nowrap; overflow: hidden; cursor: pointer; text-decoration: none; }
        .nav-item:hover { background: rgba(185,28,28,0.06); color: #b91c1c !important; }
        .nav-item.active { background: linear-gradient(90deg,#fef2f2,#fee2e2); color: #b91c1c !important; border-left: 3px solid #b91c1c !important; }
        .nb-icon-btn { transition: background 0.12s, color 0.12s; }
        .nb-icon-btn:hover { background: #f3f4f6 !important; color: #b91c1c !important; }
        .logout-btn { transition: background 0.12s, color 0.12s, border-color 0.12s; }
        .logout-btn:hover { background: #fef2f2 !important; color: #b91c1c !important; border-color: #fca5a5 !important; }
        .user-menu { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); width: 210px; z-index: 100; animation: menuFadeIn 0.14s ease; overflow: hidden; }
        @keyframes menuFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .menu-item { display: flex; align-items: center; gap: 9px; padding: 10px 14px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: background 0.1s; }
        .menu-item:hover { background: #f9fafb; }
        .menu-item.danger { color: #dc2626; }
        .menu-item.danger:hover { background: #fef2f2; }
        .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.38); z-index: 39; backdrop-filter: blur(2px); animation: fadeIn 0.18s ease; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @media (max-width: 768px) {
          .shell-sidebar { position: fixed !important; top: 0 !important; left: 0 !important; height: 100% !important; z-index: 40 !important; transform: translateX(-100%); transition: transform 0.24s cubic-bezier(.4,0,.2,1), width 0s !important; width: ${SIDEBAR_W}px !important; }
          .shell-sidebar.mobile-open { transform: translateX(0); }
          .shell-main { margin-left: 0 !important; }
        }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      <div
        style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans',sans-serif" }}
        onClick={() => userMenuOpen && setUserMenuOpen(false)}
      >
        {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

        <aside
          className={`shell-sidebar sidebar-scroll ${mobileOpen ? 'mobile-open' : ''}`}
          style={{ width: effectiveW, background: '#fff', borderRight: '1px solid rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden', boxShadow: '2px 0 16px rgba(0,0,0,0.04)' }}
        >
          {/* Brand */}
          <div style={{ height: NAVBAR_H, display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '0 18px' : '0', justifyContent: sidebarOpen ? 'flex-start' : 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'linear-gradient(135deg,#7f1d1d,#b91c1c 55%,#e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(185,28,28,0.35)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.4">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, color: '#0f0a1e', lineHeight: 1.2 }}>HOPE, INC.</p>
                <p style={{ fontSize: 9, color: '#b91c1c', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Management System</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '14px 0' }}>
            {NAV_ITEMS.map((section) => {
              if (!canSeeByRole(section.roles, currentRole)) return null;
              // FIX: use canSeeItem which checks both roles and requiredRight
              const visibleItems = section.items.filter(item => canSeeItem(item));
              if (visibleItems.length === 0) return null;
              return (
                <div key={section.section} style={{ marginBottom: 4 }}>
                  {sidebarOpen && (
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#d1d5db', padding: '8px 18px 4px' }}>
                      {section.section}
                    </p>
                  )}
                  {visibleItems.map((item) => {
                    if (isSyncing && (item.roles || item.requiredRight)) return null;
                    const isActive = location.pathname === item.href;
                    const style    = getActiveStyle(item.href);
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={(e) => { e.preventDefault(); navigate(item.href); }}
                        className="nav-item"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: sidebarOpen ? '9px 18px' : '10px 0',
                          justifyContent: sidebarOpen ? 'flex-start' : 'center',
                          fontSize: 13, fontWeight: isActive ? 700 : 500,
                          color: isActive ? style.color : '#4b5563',
                          background: isActive ? style.bg : 'transparent',
                          borderLeft: isActive ? `3px solid ${style.border}` : '3px solid transparent',
                          borderRadius: '0 8px 8px 0',
                          margin: '1px 10px 1px 0',
                        }}
                      >
                        <span style={{ flexShrink: 0 }}>{item.icon}</span>
                        {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
                      </a>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{ padding: sidebarOpen ? '12px 14px' : '12px 8px', borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 12, background: '#f9fafb', border: '1px solid #f3f4f6', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'linear-gradient(135deg,#fef2f2,#fca5a5)', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{userInitials}</div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#0f0a1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail.split('@')[0]}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' }}>{isSyncing ? '...' : currentRole}</p>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%', padding: sidebarOpen ? '8px 12px' : '8px 0', borderRadius: 10, border: '1px solid #e5e7eb', background: 'transparent', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="shell-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <header style={{ position: 'absolute', top: 0, left: 0, right: 0, height: NAVBAR_H, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <button className="nb-icon-btn" onClick={toggleSidebar} style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#9ca3af' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ fontSize: 11, color: '#d1d5db' }}>HOPE, INC.</span>
              <span style={{ fontSize: 11, color: '#e5e7eb' }}>/</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{getPageLabel(location.pathname)}</span>
            </div>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setUserMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 10, border: `1px solid ${userMenuOpen ? '#fca5a5' : '#e5e7eb'}`, background: userMenuOpen ? '#fef2f2' : '#fff', cursor: 'pointer' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#fef2f2,#fca5a5)', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{userInitials}</div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0f0a1e' }}>{userEmail.split('@')[0]}</p>
              </button>
              {userMenuOpen && (
                <div className="user-menu">
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{userEmail.split('@')[0]}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{currentRole}</p>
                  </div>
                  <div className="menu-item danger" onClick={handleLogout}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </header>
          <main style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(160deg,#f8f9fc 0%,#f0f2f5 100%)', paddingTop: NAVBAR_H }}>
            <div style={{ padding: '32px 24px' }}>{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AppShell;
