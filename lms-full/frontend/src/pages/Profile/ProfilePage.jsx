// ProfilePage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCamera, FiSave, FiLock, FiUser } from 'react-icons/fi';
import { authAPI } from '../../utils/api';
import { updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append('avatar', avatar);
      const r = await authAPI.updateProfile(fd);
      dispatch(updateUser(r.data.data));
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwdForm.newPassword !== pwdForm.confirm) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const roleBadgeColor = { admin: 'badge-red', teacher: 'badge-purple', student: 'badge-blue' };

  return (
    <div className="animate-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">Profile Settings</div>
      </div>

      {/* Avatar card */}
      <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {(avatar ? URL.createObjectURL(avatar) : user?.avatar)
            ? <img src={avatar ? URL.createObjectURL(avatar) : `http://localhost:5000${user.avatar}`} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-200)' }} />
            : <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: '1.4rem' }}>{initials}</div>
          }
          <label style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem' }}>
            <FiCamera size={12} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAvatar(e.target.files[0])} />
          </label>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginBottom: 6 }}>{user?.email}</div>
          <span className={`badge ${roleBadgeColor[user?.role] || 'badge-gray'}`}>{user?.role}</span>
        </div>
      </div>

      <div className="tab-list">
        <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FiUser size={14} /> Profile</button>
        <button className={`tab-btn ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}><FiLock size={14} /> Password</button>
      </div>

      {tab === 'profile' && (
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself…" />
          </div>
          <div className="form-group">
            <label className="form-label">Email (read-only)</label>
            <input value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
            <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, l]) => (
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type="password" value={pwdForm[k]} onChange={e => setPwdForm(p => ({ ...p, [k]: e.target.value }))} placeholder="••••••••" />
            </div>
          ))}
          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>
            <FiLock /> {saving ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      )}
    </div>
  );
}
