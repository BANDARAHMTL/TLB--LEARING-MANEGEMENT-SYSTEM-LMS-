// TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiUsers, FiFileText, FiClipboard } from 'react-icons/fi';
import { analyticsAPI } from '../../utils/api';
import { StatCard, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.teacher()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-subtitle">Manage your courses and students</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard label="My Courses"     value={data?.totalCourses    ?? 0} icon={<FiBook />}      color="#10b981" bgColor="#ecfdf5" />
        <StatCard label="Total Students" value={data?.totalStudents   ?? 0} icon={<FiUsers />}     color="#6366f1" bgColor="#f5f3ff" />
        <StatCard label="Quizzes"        value={data?.quizCount       ?? 0} icon={<FiFileText />}  color="#f59e0b" bgColor="#fffbeb" />
        <StatCard label="Assignments"    value={data?.assignmentCount ?? 0} icon={<FiClipboard />} color="#3b82f6" bgColor="#eff6ff" />
      </div>

      <div>
        <div className="section-header">
          <span className="section-title">My Courses</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/teacher/courses')}>Manage Courses</button>
        </div>
        {(data?.courses || []).length === 0
          ? <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses yet</h3><p>Create your first course to get started.</p><button className="btn btn-primary" onClick={() => navigate('/teacher/courses')}>Create Course</button></div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
              {(data?.courses || []).map(c => (
                <div key={c._id} className="card" style={{ padding:16, cursor:'pointer' }} onClick={() => navigate(`/teacher/courses/${c._id}/build`)}>
                  <p style={{ fontWeight:700, marginBottom:4 }}>{c.title}</p>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.82rem', color:'var(--text-3)' }}>{c.enrolledCount} students</span>
                    <span className={`badge badge-${c.rating >= 4 ? 'green' : 'gray'}`}>⭐ {c.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
