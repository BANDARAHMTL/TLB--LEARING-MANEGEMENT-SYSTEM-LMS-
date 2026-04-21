// LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { if (user) navigate(`/${user.role}`, { replace: true }); }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handle = e => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    dispatch(loginUser(form));
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.panel}>
        <div style={styles.panelInner}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>📚</div>
            <span style={styles.logoText}>EduFlow LMS</span>
          </div>
          <h1 style={styles.heading}>Smart Learning<br/>for Everyone.</h1>
          <p style={styles.sub}>Manage courses, quizzes, and assignments — all in one platform designed for admins, teachers and students.</p>
          <div style={styles.featureList}>
            {['Role-based dashboards', 'Quiz auto-grading', 'PDF materials & assignments', 'Real-time progress tracking'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.checkIcon}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.formPanel}>
        <div style={styles.formWrap}>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>Sign in to your account</p>

          <form onSubmit={handle} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position:'relative' }}>
                <FiMail style={styles.fieldIcon} />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} style={{ paddingLeft: 38 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <FiLock style={styles.fieldIcon} />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} style={{ paddingLeft: 38, paddingRight: 42 }} />
                <button type="button" onClick={() => setShow(!show)} style={styles.eyeBtn}>
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={styles.registerLink}>
            Don't have an account? <Link to="/register" style={{ color:'var(--brand-600)', fontWeight:600 }}>Register</Link>
          </p>

          <div style={styles.demoAccounts}>
            <p style={styles.demoTitle}>Demo credentials:</p>
            {[
              { role:'Admin',   email:'admin@lms.com',   pass:'admin123' },
              { role:'Teacher', email:'teacher@lms.com', pass:'teacher123' },
              { role:'Student', email:'student@lms.com', pass:'student123' },
            ].map(d => (
              <button key={d.role} style={styles.demoBtn}
                onClick={() => setForm({ email: d.email, password: d.pass })}>
                {d.role}: {d.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:      { display:'flex', minHeight:'100vh', fontFamily:'var(--font-body)' },
  panel:     { flex:1, background:'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #064e3b 100%)', display:'none', alignItems:'center', justifyContent:'center', padding:'48px' },
  panelInner:{ maxWidth:440 },
  logoRow:   { display:'flex', alignItems:'center', gap:12, marginBottom:40 },
  logoBox:   { width:44, height:44, background:'rgba(255,255,255,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', backdropFilter:'blur(10px)' },
  logoText:  { fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'white' },
  heading:   { fontFamily:'var(--font-display)', fontSize:'2.8rem', fontWeight:900, color:'white', lineHeight:1.15, marginBottom:16 },
  sub:       { color:'rgba(255,255,255,0.65)', fontSize:'1rem', lineHeight:1.7, marginBottom:36 },
  featureList:{ display:'flex', flexDirection:'column', gap:10 },
  featureItem:{ color:'rgba(255,255,255,0.8)', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:10 },
  checkIcon: { width:22, height:22, background:'var(--brand-500)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'white', fontWeight:700, flexShrink:0, textAlign:'center', lineHeight:'22px' },
  formPanel: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', background:'var(--bg)', minWidth:0 },
  formWrap:  { width:'100%', maxWidth:420 },
  formTitle: { fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:'var(--text-1)', marginBottom:6 },
  formSub:   { color:'var(--text-3)', fontSize:'0.9rem', marginBottom:28 },
  form:      { display:'flex', flexDirection:'column', gap:18, marginBottom:20 },
  fieldIcon: { position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' },
  eyeBtn:    { position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-4)', cursor:'pointer', display:'flex', alignItems:'center', padding:4 },
  registerLink: { textAlign:'center', fontSize:'0.875rem', color:'var(--text-3)', marginBottom:24 },
  demoAccounts: { background:'var(--gray-50)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:16 },
  demoTitle:    { fontSize:'0.75rem', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 },
  demoBtn:      { display:'block', width:'100%', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'8px 12px', fontSize:'0.8rem', color:'var(--brand-700)', cursor:'pointer', textAlign:'left', marginBottom:6, fontFamily:'var(--font-body)', transition:'background 0.15s' },
};

// Override panel display for md+
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = '@media (min-width: 768px) { .auth-panel { display: flex !important; } }';
  document.head.appendChild(style);
  styles.panel.display = window.innerWidth >= 768 ? 'flex' : 'none';
}
