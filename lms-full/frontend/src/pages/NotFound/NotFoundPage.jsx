import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '6rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--brand-500)', lineHeight: 1 }}>404</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: '16px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? `/${user.role}` : '/login')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
