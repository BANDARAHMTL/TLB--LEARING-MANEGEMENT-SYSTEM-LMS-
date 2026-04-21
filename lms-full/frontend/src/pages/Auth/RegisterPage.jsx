import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { if (user) navigate(`/${user.role}`, { replace: true }); }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handle = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div style={s.page}>
      <div style={s.formPanel}>
        <div style={s.formWrap}>
          <div style={s.logoRow}>
            <div style={s.logoBox}>📚</div>
            <span style={s.logoText}>EduFlow LMS</span>
          </div>
          <h2 style={s.title}>Create account</h2>
          <p style={s.sub}>Join as a student and start learning today</p>

          <form onSubmit={handle} style={s.form}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={s.icon} />
                <input type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={s.icon} />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={s.icon} />
                <input type={show ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShow(!show)} style={s.eye}>
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={s.icon} />
                <input type="password" placeholder="Repeat password" value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })} style={{ paddingLeft: 38 }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p style={s.link}>Already have an account? <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', padding: '20px' },
  formPanel: { width: '100%', maxWidth: 440, background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '36px 40px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' },
  formWrap: {},
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoBox: { width: 38, height: 38, background: 'linear-gradient(135deg,var(--brand-500),var(--accent-500))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-1)' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 },
  sub: { color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 },
  icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' },
  eye: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 },
  link: { textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' },
};
