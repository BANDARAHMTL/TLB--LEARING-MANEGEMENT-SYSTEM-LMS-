// ProfilePage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCamera, FiSave } from 'react-icons/fi';
import { userAPI } from '../../utils/api';
import { updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      dispatch(updateUser(data));
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.wrap}>
          <h1 className={styles.title}>Profile Settings</h1>

          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {user?.avatar
                ? <img src={user.avatar} alt="" className={styles.avatar} />
                : <div className={styles.avatarPlaceholder}>{user?.name?.[0]?.toUpperCase()}</div>
              }
              <button className={styles.cameraBtn}><FiCamera /></button>
            </div>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 000 0000" />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="Tell us about yourself..." />
              </div>
              <div className={styles.field}>
                <label>Email (read-only)</label>
                <input type="email" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
