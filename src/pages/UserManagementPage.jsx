import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRightsContext } from '../contexts/UserRightsContext';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const getInitials = (name, email) => {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : '??';
};

const AVATAR_COLORS = [
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#EAF3DE', color: '#27500A' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#FBEAF0', color: '#72243E' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAECE7', color: '#712B13' },
];

const avatarColor = (id) => AVATAR_COLORS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{
    position: 'fixed', bottom: 24, right: 24,
    display: 'flex', flexDirection: 'column', gap: 8,
    zIndex: 9999, pointerEvents: 'none',
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding: '10px 16px', borderRadius: 8,
        background: t.type === 'success' ? '#166534' : '#991b1b',
        color: '#fff', fontSize: 13, fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>{t.type === 'success' ? '✓' : '✕'}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({ size = 12, color }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    border: `1.5px solid ${color}40`,
    borderTop: `1.5px solid ${color}`,
    borderRadius: '50%',
    animation: 'ump-spin 0.7s linear infinite',
    flexShrink: 0,
  }} />
);

// ── Sort Icon ──────────────────────────────────────────────────────────────
const SortIcon = ({ column, sortConfig }) => (
  <span style={{
    fontSize: 10, marginLeft: 3,
    opacity: sortConfig.key === column ? 1 : 0.3,
    color: sortConfig.key === column ? '#111827' : 'inherit',
  }}>
    {sortConfig.key === column ? (sortConfig.dir === 'asc' ? '↑' : '↓') : '↕'}
  </span>
);

// ── Role Badge ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    SUPERADMIN: { background: '#EEEDFE', color: '#3C3489', border: '0.5px solid #AFA9EC' },
    ADMIN:      { background: '#E6F1FB', color: '#0C447C', border: '0.5px solid #85B7EB' },
    USER:       { background: '#f3f4f6', color: '#4b5563', border: '0.5px solid #e5e7eb' },
  };
  const s = styles[role?.toUpperCase()] || styles.USER;
  return (
    <span style={{
      ...s, display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {role || 'USER'}
    </span>
  );
};

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: isActive ? '#EAF3DE' : '#FCEBEB',
      color:      isActive ? '#27500A' : '#791F1F',
      border:     isActive ? '0.5px solid #97C459' : '0.5px solid #F09595',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: isActive ? '#639922' : '#E24B4A',
      }} />
      {status}
    </span>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const UserManagementPage = () => {
  const { userRole } = useRightsContext();

  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch]               = useState('');
  const [filterRole, setFilterRole]       = useState('ALL');
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [sortConfig, setSortConfig]       = useState({ key: 'created_at', dir: 'desc' });
  const [toasts, setToasts]               = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id, email, full_name, user_type, record_status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      addToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const { error } = await supabase
        .from('user')
        .update({ record_status: newStatus })
        .eq('id', userId);
      if (error) throw error;
      // Optimistic update — no full refetch needed
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, record_status: newStatus } : u));
      addToast(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`, 'success');
    } catch (err) {
      console.error('Error updating user status:', err.message);
      addToast('Failed to update user status.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const displayed = useMemo(() => {
    let list = [...users];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'ALL')   list = list.filter(u => u.user_type?.toUpperCase() === filterRole);
    if (filterStatus !== 'ALL') list = list.filter(u => u.record_status === filterStatus);
    list.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      const cmp  = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [users, search, filterRole, filterStatus, sortConfig]);

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.record_status === 'ACTIVE').length,
    inactive: users.filter(u => u.record_status === 'INACTIVE').length,
    admins:   users.filter(u => ['ADMIN', 'SUPERADMIN'].includes(u.user_type?.toUpperCase())).length,
  }), [users]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes ump-spin   { to { transform: rotate(360deg); } }
        @keyframes ump-fadein { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }

        .ump-wrap { font-family: 'DM Sans', sans-serif; color: #111827; }

        .ump-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; margin-bottom: 20px; }
        .ump-stat  { background: #f9fafb; border-radius: 10px; padding: 14px 16px; animation: ump-fadein 0.3s ease; }
        .ump-stat-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; }
        .ump-stat-val   { font-size: 26px; font-weight: 600; color: #111827; }
        .ump-stat-val.g { color: #27500A; }
        .ump-stat-val.r { color: #791F1F; }
        .ump-stat-val.b { color: #0C447C; }

        .ump-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .ump-search-wrap { position: relative; flex: 1; max-width: 260px; }
        .ump-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
        .ump-search {
          width: 100%; padding: 7px 10px 7px 32px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          border: 0.5px solid #e5e7eb; border-radius: 8px;
          background: #fff; color: #111827; outline: none;
          transition: border-color 0.15s;
        }
        .ump-search:focus { border-color: #b91c1c; }
        .ump-select {
          padding: 7px 10px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          border: 0.5px solid #e5e7eb; border-radius: 8px;
          background: #fff; color: #111827; outline: none; cursor: pointer;
        }
        .ump-count { margin-left: auto; font-size: 12px; color: #9ca3af; }

        .ump-table-wrap { background: #fff; border: 0.5px solid #e5e7eb; border-radius: 12px; overflow: hidden; animation: ump-fadein 0.3s ease; }
        .ump-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .ump-table col.c-name    { width: 20%; }
        .ump-table col.c-email   { width: 24%; }
        .ump-table col.c-role    { width: 14%; }
        .ump-table col.c-status  { width: 13%; }
        .ump-table col.c-joined  { width: 13%; }
        .ump-table col.c-actions { width: 16%; }
        .ump-table thead th {
          background: #f9fafb; padding: 9px 14px;
          font-size: 11px; font-weight: 500; color: #6b7280;
          text-transform: uppercase; letter-spacing: .06em;
          text-align: left; border-bottom: 0.5px solid #e5e7eb;
          white-space: nowrap; cursor: pointer; user-select: none;
        }
        .ump-table thead th:hover { color: #111827; }
        .ump-table tbody tr { border-bottom: 0.5px solid #f3f4f6; transition: background 0.1s; }
        .ump-table tbody tr:last-child { border-bottom: none; }
        .ump-table tbody tr:hover { background: #fafafa; }
        .ump-table td {
          padding: 11px 14px; font-size: 13px; color: #374151;
          vertical-align: middle; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* SUPERADMIN row highlight */
        .ump-table tbody tr.row-superadmin { background: #faf8ff; }
        .ump-table tbody tr.row-superadmin:hover { background: #f3f0ff; }

        .ump-name-cell { display: flex; align-items: center; gap: 9px; overflow: hidden; }
        .ump-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; }
        .ump-name-text { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ump-email-cell { color: #6b7280; font-size: 12px; }
        .ump-joined { color: #9ca3af; font-size: 12px; }

        .ump-btn {
          padding: 5px 12px; font-size: 12px; font-weight: 500;
          border-radius: 7px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex; align-items: center; gap: 5px;
          white-space: nowrap; transition: background 0.15s;
        }
        .ump-btn:disabled { cursor: not-allowed; opacity: 0.55; }
        .ump-btn-deactivate { background: #FCEBEB; color: #791F1F; border: 0.5px solid #F09595; }
        .ump-btn-deactivate:hover:not(:disabled) { background: #F7C1C1; }
        .ump-btn-activate   { background: #EAF3DE; color: #27500A; border: 0.5px solid #97C459; }
        .ump-btn-activate:hover:not(:disabled)   { background: #C0DD97; }
        .ump-btn-protected  { background: #f3f4f6; color: #9ca3af; border: 0.5px solid #e5e7eb; cursor: default; }

        /* Tooltip wrapper */
        .ump-tip-wrap { position: relative; display: inline-flex; }
        .ump-tip {
          visibility: hidden; opacity: 0; pointer-events: none;
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: #1f2937; color: #fff;
          font-size: 11px; padding: 5px 9px; border-radius: 6px;
          white-space: nowrap; transition: opacity 0.15s; z-index: 200;
        }
        .ump-tip-wrap:hover .ump-tip { visibility: visible; opacity: 1; }

        .ump-empty { text-align: center; padding: 48px 24px; font-size: 13px; color: #9ca3af; }
        .ump-skel  { background: #f3f4f6; border-radius: 4px; height: 13px; }
        .ump-skel-row td { padding: 13px 14px; }

        @media (max-width: 768px) {
          .ump-stats { grid-template-columns: repeat(2,1fr); }
          .ump-toolbar { flex-direction: column; align-items: flex-start; }
          .ump-search-wrap { max-width: 100%; width: 100%; }
        }
      `}</style>

      <div className="ump-wrap">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 3 }}>User Management</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Manage account access — activate or deactivate users as needed.</p>
        </div>

        {/* Stat Cards */}
        <div className="ump-stats">
          <div className="ump-stat">
            <div className="ump-stat-label">Total users</div>
            <div className="ump-stat-val">{stats.total}</div>
          </div>
          <div className="ump-stat">
            <div className="ump-stat-label">Active</div>
            <div className="ump-stat-val g">{stats.active}</div>
          </div>
          <div className="ump-stat">
            <div className="ump-stat-label">Inactive</div>
            <div className="ump-stat-val r">{stats.inactive}</div>
          </div>
          <div className="ump-stat">
            <div className="ump-stat-label">Admins</div>
            <div className="ump-stat-val b">{stats.admins}</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ump-toolbar">
          <div className="ump-search-wrap">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="ump-search"
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="ump-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="ALL">All roles</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <select className="ump-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <span className="ump-count">{displayed.length} of {users.length} users</span>
        </div>

        {/* Table */}
        <div className="ump-table-wrap">
          <table className="ump-table">
            <colgroup>
              <col className="c-name" />
              <col className="c-email" />
              <col className="c-role" />
              <col className="c-status" />
              <col className="c-joined" />
              <col className="c-actions" />
            </colgroup>
            <thead>
              <tr>
                <th onClick={() => handleSort('full_name')}>Name <SortIcon column="full_name" sortConfig={sortConfig} /></th>
                <th onClick={() => handleSort('email')}>Email <SortIcon column="email" sortConfig={sortConfig} /></th>
                <th onClick={() => handleSort('user_type')}>Role <SortIcon column="user_type" sortConfig={sortConfig} /></th>
                <th onClick={() => handleSort('record_status')}>Status <SortIcon column="record_status" sortConfig={sortConfig} /></th>
                <th onClick={() => handleSort('created_at')}>Joined <SortIcon column="created_at" sortConfig={sortConfig} /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="ump-skel-row">
                    {['50%', '70%', '50%', '55%', '60%', '55%'].map((w, j) => (
                      <td key={j}><div className="ump-skel" style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ump-empty">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                displayed.map(user => {
                  const isSA     = user.user_type?.toUpperCase() === 'SUPERADMIN';
                  const isActive = user.record_status === 'ACTIVE';
                  const busy     = actionLoading[user.id] || false;
                  const av       = avatarColor(user.id);

                  return (
                    <tr key={user.id} className={isSA ? 'row-superadmin' : ''}>
                      {/* Name */}
                      <td>
                        <div className="ump-name-cell">
                          <div className="ump-avatar" style={{ background: av.bg, color: av.color }}>
                            {getInitials(user.full_name, user.email)}
                          </div>
                          <span className="ump-name-text">{user.full_name || '—'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="ump-email-cell">{user.email}</td>

                      {/* Role */}
                      <td><RoleBadge role={user.user_type} /></td>

                      {/* Status */}
                      <td><StatusBadge status={user.record_status} /></td>

                      {/* Joined */}
                      <td className="ump-joined">{fmt(user.created_at)}</td>

                      {/* Actions */}
                      <td>
                        {isSA ? (
                          // SUPERADMIN — protected, tooltip on hover
                          <div className="ump-tip-wrap">
                            <button className="ump-btn ump-btn-protected" disabled>
                             Protected
                            </button>
                            <span className="ump-tip">SUPERADMIN accounts cannot be modified</span>
                          </div>
                        ) : isActive ? (
                          // Active user — show Deactivate
                          <button
                            className="ump-btn ump-btn-deactivate"
                            disabled={busy}
                            onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                          >
                            {busy && <Spinner color="#791F1F" />}
                            Deactivate
                          </button>
                        ) : (
                          // Inactive user — show Activate
                          <button
                            className="ump-btn ump-btn-activate"
                            disabled={busy}
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                          >
                            {busy && <Spinner color="#27500A" />}
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toasts={toasts} />
    </>
  );
};

export default UserManagementPage;