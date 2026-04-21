import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiBook, FiCheckCircle, FiTrendingUp, FiAward, FiArrowRight, FiPlay } from 'react-icons/fi';
import { analyticsAPI, enrollmentAPI } from '../../utils/api';
import { Spinner, ProgressRing, EmptyState } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.student()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-in">
      {/* Welcome banner */}
      <div className="card card-body" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--accent-600) 100%)', border: 'none', color: 'white', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: 4 }}>{greeting()},</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>{user?.name} 👋</h2>
          <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>You have {data?.totalEnrolled || 0} course{data?.totalEnrolled !== 1 ? 's' : ''} enrolled. Keep learning!</p>
        </div>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
          onClick={() => navigate('/student/browse')}>
          Browse Courses <FiArrowRight />
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Enrolled Courses', val: data?.totalEnrolled || 0, icon: <FiBook />, bg: 'var(--brand-50)', color: 'var(--brand-600)' },
          { label: 'Avg Progress', val: `${data?.avgProgress || 0}%`, icon: <FiTrendingUp />, bg: '#eff6ff', color: 'var(--info)' },
          { label: 'Completed', val: data?.completedCourses || 0, icon: <FiCheckCircle />, bg: '#f0fdf4', color: 'var(--success)' },
          { label: 'Quizzes Taken', val: data?.quizzesTaken || 0, icon: <FiAward />, bg: '#fdf4ff', color: '#9333ea' },
        ].map(s => (
          <div key={s.label} className="card card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.val}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Continue Learning */}
        <div>
          <div className="section-header">
            <span className="section-title">Continue Learning</span>
            <Link to="/student/my-courses" className="btn btn-ghost btn-sm">View All <FiArrowRight size={13} /></Link>
          </div>
          {!data?.enrollments?.length ? (
            <EmptyState icon="📚" title="No courses yet" message="Start by browsing our course catalog." action={() => navigate('/student/browse')} actionLabel="Browse Courses" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.enrollments.slice(0, 4).map(e => (
                <div key={e._id} className="enrolled-card">
                  <div style={{ width: 64, height: 44, borderRadius: 8, background: 'var(--gray-100)', overflow: 'hidden', flexShrink: 0 }}>
                    {e.course?.thumbnail
                      ? <img src={`http://localhost:5000${e.course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiBook color="var(--gray-300)" /></div>
                    }
                  </div>
                  <div className="enrolled-info">
                    <div className="enrolled-title">{e.course?.title}</div>
                    <div className="progress-bar" style={{ maxWidth: 180 }}>
                      <div className="progress-fill" style={{ width: `${e.progressPercent}%` }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: 3 }}>{e.progressPercent}% complete</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/courses/${e.course?._id}`)}>
                    <FiPlay size={12} /> Continue
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Results */}
        <div>
          <div className="section-header">
            <span className="section-title">Recent Quiz Results</span>
            <Link to="/student/grades" className="btn btn-ghost btn-sm">View All <FiArrowRight size={13} /></Link>
          </div>
          {!data?.recentAttempts?.length ? (
            <EmptyState icon="📝" title="No quiz attempts yet" message="Take quizzes from your enrolled courses to see results here." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentAttempts.map(a => (
                <div key={a._id} className="card card-body" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 3 }}>{a.quiz?.title || 'Quiz'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <ProgressRing percent={a.percentage} size={52} stroke={5} color={a.passed ? 'var(--success)' : 'var(--error)'} />
                  </div>
                  <span className={`badge ${a.passed ? 'badge-green' : 'badge-red'}`}>{a.passed ? 'Passed' : 'Failed'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
