import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiCheckCircle, FiBook } from 'react-icons/fi';
import { enrollmentAPI } from '../../utils/api';
import { Spinner, EmptyState, ProgressRing } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function MyCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    enrollmentAPI.getMy()
      .then(r => setEnrollments(r.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.status === filter);

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">My Courses</div>
        <div className="page-subtitle">{enrollments.length} courses enrolled</div>
      </div>

      {/* Status tabs */}
      <div className="tab-list" style={{ marginBottom: 24 }}>
        {[['all', 'All'], ['active', 'In Progress'], ['completed', 'Completed']].map(([val, label]) => (
          <button key={val} className={`tab-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            {label} <span style={{ fontSize: '0.72rem', marginLeft: 4, opacity: 0.7 }}>
              ({val === 'all' ? enrollments.length : enrollments.filter(e => e.status === val).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title={filter === 'completed' ? 'No completed courses yet' : 'No courses in progress'}
          message="Keep learning to see your progress here."
          action={() => navigate('/student/browse')} actionLabel="Browse Courses" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filtered.map(e => {
            const course = e.course;
            if (!course) return null;
            return (
              <div key={e._id} className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onClick={() => navigate(`/student/courses/${course._id}`)}>
                {/* Thumbnail */}
                <div style={{ aspectRatio: '16/9', background: 'var(--gray-100)', overflow: 'hidden', position: 'relative' }}>
                  {course.thumbnail
                    ? <img src={`http://localhost:5000${course.thumbnail}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiBook size={36} color="var(--gray-300)" /></div>
                  }
                  {e.status === 'completed' && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--success)', borderRadius: 20, padding: '3px 10px', color: 'white', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCheckCircle size={11} /> Completed
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                      {course.title}
                    </h3>
                    <ProgressRing percent={e.progressPercent} size={52} stroke={5} />
                  </div>
                  {course.teacher && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 12 }}>
                      by {course.teacher.name}
                    </div>
                  )}
                  <div className="progress-bar" style={{ marginBottom: 8 }}>
                    <div className="progress-fill" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>
                      {e.completedMaterials?.length || 0} items completed
                    </span>
                    <button className="btn btn-primary btn-sm" onClick={ev => { ev.stopPropagation(); navigate(`/student/courses/${course._id}`); }}>
                      <FiPlay size={12} /> {e.progressPercent > 0 ? 'Continue' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
