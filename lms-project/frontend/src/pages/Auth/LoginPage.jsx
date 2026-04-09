import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    dispatch(loginUser(form));
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.orb} />
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>TLB</div>
          <h2>Discover world best online courses here.</h2>
          <p>24k online course is waiting for you</p>
          <div className={styles.illustration}>🎓</div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.formWrap}>
          <h1 className={styles.formTitle}>Sign In</h1>
          <p className={styles.formSub}>
            New User? <Link to="/register" className={styles.formLink}>Create an Account</Link>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email or Phone</label>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  placeholder="tharindulakmal@oeti.edu.lk"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={styles.input}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>

            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
