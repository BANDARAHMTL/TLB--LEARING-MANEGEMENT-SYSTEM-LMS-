// MyGrades.jsx
import { useEffect, useState } from 'react';
import { FiAward, FiCheckCircle, FiClock } from 'react-icons/fi';
import { analyticsAPI, quizAPI, assignmentAPI, enrollmentAPI } from '../../utils/api';
import { Spinner, EmptyState, ProgressRing } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function MyGrades() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('quizzes');

  useEffect(() => {
    analyticsAPI.student()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load grades'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">My Grades</div>
        <div className="page-subtitle">Track your quiz scores and assignment grades</div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Quizzes Taken', val: data?.quizzesTaken || 0, icon: '📝' },
          { label: 'Assignments', val: data?.assignmentsSubmitted || 0, icon: '📋' },
          { label: 'Avg Progress', val: `${data?.avgProgress || 0}%`, icon: '📈' },
          { label: 'Completed Courses', val: data?.completedCourses || 0, icon: '🎓' },
        ].map(s => (
          <div key={s.label} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-list">
        <button className={`tab-btn ${tab === 'quizzes' ? 'active' : ''}`} onClick={() => setTab('quizzes')}>Quiz Results</button>
        <button className={`tab-btn ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>Course Progress</button>
      </div>

      {tab === 'quizzes' && (
        <>
          {!data?.recentAttempts?.length ? (
            <EmptyState icon="📝" title="No quiz results yet" message="Complete quizzes from your enrolled courses to see results here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Quiz</th><th>Score</th><th>Result</th><th>Date</th><th>Attempt</th></tr></thead>
                <tbody>
                  {data.recentAttempts.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600 }}>{a.quiz?.title || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ProgressRing percent={a.percentage} size={42} stroke={4} color={a.passed ? 'var(--success)' : 'var(--error)'} />
                        </div>
                      </td>
                      <td><span className={`badge ${a.passed ? 'badge-green' : 'badge-red'}`}>{a.passed ? '✅ Passed' : '❌ Failed'}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>#{a.attemptNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'courses' && (
        <>
          {!data?.enrollments?.length ? (
            <EmptyState icon="📚" title="No enrolled courses" message="Enroll in courses to track your progress." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.enrollments.map(e => (
                <div key={e._id} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ width: 64, height: 44, borderRadius: 8, background: 'var(--gray-100)', overflow: 'hidden', flexShrink: 0 }}>
                    {e.course?.thumbnail && <img src={`http://localhost:5000${e.course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{e.course?.title}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${e.progressPercent}%` }} />
                    </div>
                  </div>
                  <ProgressRing percent={e.progressPercent} size={56} stroke={5} />
                  <span className={`badge ${e.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                    {e.status === 'completed' ? '🎓 Completed' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
