import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi';
import { userAPI } from '../../utils/api';
import { Modal, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const ROLES = ['student', 'teacher', 'admin'];
const EMPTY = { name: '', email: '', password: '', role: 'student', bio: '', phone: '' };

export default function ManageUsers() {
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ search, role: roleFilter, page, limit: 15 });
      setUsers(data.data.users);
      setTotal(data.data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, roleFilter, page]);

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); };
  const openEdit   = u => { setForm({ name: u.name, email: u.email, password: '', role: u.role, bio: u.bio || '', phone: u.phone || '' }); setSelected(u); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (modal === 'create' && !form.password) { toast.error('Password is required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        await userAPI.create(form);
        toast.success('User created');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await userAPI.update(selected._id, payload);
        toast.success('User updated');
      }
      closeModal();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving user'); }
    finally { setSaving(false); }
  };

  const handleDelete = async u => {
    if (!confirm(`Delete "${u.name}"? This cannot be undone.`)) return;
    try {
      await userAPI.delete(u._id);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error deleting'); }
  };

  const handleToggleActive = async u => {
    try {
      await userAPI.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const pages = Math.ceil(total / 15);

  return (
    <div className="animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{total} total users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add User</button>
      </div>

      {/* Filters */}
      <div style={g.filterRow}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <FiSearch className="search-icon" size={15} />
          <input placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 38 }} />
        </div>
        <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1); }} style={{ width: 140 }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-4)' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem', flexShrink: 0 }}>{u.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'purple' : 'green'}`}>{u.role}</span></td>
                  <td><span className={`badge badge-${u.isActive ? 'green' : 'red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit"><FiEdit2 /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive ? <FiUserX style={{ color: 'var(--warning)' }} /> : <FiUserCheck style={{ color: 'var(--success)' }} />}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)} title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={g.pagination}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ ...g.pageBtn, background: p === page ? 'var(--brand-600)' : 'var(--surface)', color: p === page ? 'white' : 'var(--text-2)' }}>{p}</button>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Add New User' : `Edit ${selected?.name}`} onClose={closeModal}>
          <form onSubmit={handleSave} style={g.form}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">{modal === 'create' ? 'Password *' : 'New Password (optional)'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={modal === 'edit' ? 'Leave blank to keep current' : 'Min 6 chars'} required={modal === 'create'} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Short bio…" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : modal === 'create' ? 'Create User' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const g = {
  filterRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  pagination: { display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 },
  pageBtn: { width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
};
