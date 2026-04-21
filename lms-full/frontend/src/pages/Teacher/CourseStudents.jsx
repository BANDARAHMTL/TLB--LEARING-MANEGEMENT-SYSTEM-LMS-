import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
import { userAPI, enrollmentAPI } from '../../utils/api';
import { Spinner, EmptyState, ProgressRing } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function CourseStudents() {
  const { id: courseId } = useParams();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    enrollmentAPI.getAll({ courseId })
      .then(r => setEnrollments(r.data.data.enrollments))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const filtered = enrollments.filter(e =>
    !search || e.student?.name?.toLowerCase().includes(search.toLowerCase()) || e.student?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length)
    : 0;

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">Enrolled Students</div>
        <div className="page-subtitle">{enrollments.length} students enrolled</div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', val: enrollments.length, icon: <FiUsers /> },
          { label: 'Avg Progress', val: `${avgProgress}%`, icon: <FiTrendingUp /> },
          { label: 'Completed', val: enrollments.filter(e => e.status === 'completed').length, icon: '🎓' },
          { label: 'Active', val: enrollments.filter(e => e.status === 'active').length, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 320, marginBottom: 16 }}>
        <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No students found" message={search ? 'No students match your search.' : 'No students enrolled yet.'} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Progress</th><th>Status</th><th>Last Accessed</th><th>Enrolled On</th></tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.7rem', width: 34, height: 34, flexShrink: 0 }}>
                        {e.student?.avatar
                          ? <img src={`http://localhost:5000${e.student.avatar}`} alt="" className="avatar avatar-sm" style={{ width: 34, height: 34 }} />
                          : e.student?.name?.[0]
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.student?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{e.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 120 }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${e.progressPercent}%` }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', minWidth: 32 }}>{e.progressPercent}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${e.status === 'completed' ? 'badge-green' : e.status === 'active' ? 'badge-blue' : 'badge-gray'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    {e.lastAccessed ? new Date(e.lastAccessed).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
