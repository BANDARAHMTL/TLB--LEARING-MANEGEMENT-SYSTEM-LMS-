import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './AuthPages.module.css';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill required fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    dispatch(registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password }));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.orb} />
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>TLB</div>
          <h2>Join the best online learning platform.</h2>
          <p>Start your smart educational journey today!</p>
          <div className={styles.illustration}>📚</div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.formWrap}>
          <h1 className={styles.formTitle}>Create Account</h1>
          <p className={styles.formSub}>
            Already have an account? <Link to="/login" className={styles.formLink}>Sign In</Link>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <input className={styles.input} type="text" placeholder="Tharindu Lakmal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input className={styles.input} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone (optional)</label>
              <input className={styles.input} type="tel" placeholder="+94 77 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password *</label>
              <div className={styles.inputWrap}>
                <input className={styles.input} type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password *</label>
              <input className={styles.input} type="password" placeholder="Re-enter password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
