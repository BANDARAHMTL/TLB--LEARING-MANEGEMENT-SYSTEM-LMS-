import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBook, FiShoppingBag, FiTrendingUp, FiUserPlus, FiPlusCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { analyticsAPI } from '../../utils/api';
import { StatCard, Spinner } from '../../components/common/index';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.admin()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const enrollChart = (data?.enrollmentsByMonth || [])
    .slice().reverse()
    .map(m => ({ name: MONTHS[m._id.month - 1], enrollments: m.count }));

  const roleChart = (data?.usersByRole || []).map(r => ({
    name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
    value: r.count,
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">System overview and key metrics</p>
      </div>

      {/* Stat cards */}
      <div style={g.statsGrid}>
        <StatCard label="Total Users"       value={data?.totalUsers       ?? 0} icon={<FiUsers />}       color="#10b981" bgColor="#ecfdf5" />
        <StatCard label="Total Courses"     value={data?.totalCourses     ?? 0} icon={<FiBook />}        color="#6366f1" bgColor="#f5f3ff" />
        <StatCard label="Total Enrollments" value={data?.totalEnrollments ?? 0} icon={<FiShoppingBag />} color="#f59e0b" bgColor="#fffbeb" />
        <StatCard label="Active Rate"       value="—"                          icon={<FiTrendingUp />}   color="#3b82f6" bgColor="#eff6ff" />
      </div>

      {/* Charts row */}
      <div style={g.chartsRow}>
        {/* Enrollment trend */}
        <div className="card" style={{ flex: 2, ...g.chartCard }}>
          <div className="section-header">
            <span className="section-title">Enrollment Trend</span>
          </div>
          {enrollChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollChart} barSize={22}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Bar dataKey="enrollments" fill="var(--brand-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', padding: '20px 0' }}>No enrollment data yet</p>}
        </div>

        {/* Users by role */}
        <div className="card" style={{ flex: 1, ...g.chartCard }}>
          <div className="section-header">
            <span className="section-title">Users by Role</span>
          </div>
          {roleChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {roleChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-4)', fontSize: '0.875rem', padding: '20px 0' }}>No user data yet</p>}
        </div>
      </div>

      {/* Quick actions */}
      <div style={g.quickActions}>
        {[
          { label: 'Add User',    icon: <FiUserPlus />,   to: '/admin/users',       color: '#10b981', bg: '#ecfdf5' },
          { label: 'Add Course',  icon: <FiPlusCircle />, to: '/admin/courses',     color: '#6366f1', bg: '#f5f3ff' },
          { label: 'Categories',  icon: <FiBook />,       to: '/admin/categories',  color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Enrollments', icon: <FiShoppingBag />,to: '/admin/enrollments', color: '#3b82f6', bg: '#eff6ff' },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.to)} style={{ ...g.qaBtn, background: a.bg, color: a.color }}>
            <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div style={g.bottomRow}>
        {/* Recent users */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <div className="section-header">
              <span className="section-title">Recent Users</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>View all</button>
            </div>
            {(data?.recentUsers || []).length === 0
              ? <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-icon">👤</div><p>No users yet</p></div>
              : (data?.recentUsers || []).map(u => (
                <div key={u._id} style={g.userRow}>
                  <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{u.email}</p>
                  </div>
                  <span className={`badge badge-${u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'purple' : 'green'}`}>{u.role}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Recent enrollments */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-body">
            <div className="section-header">
              <span className="section-title">Recent Enrollments</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/enrollments')}>View all</button>
            </div>
            {(data?.recentEnrollments || []).length === 0
              ? <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-icon">📚</div><p>No enrollments yet</p></div>
              : (data?.recentEnrollments || []).map(e => (
                <div key={e._id} style={g.userRow}>
                  <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>
                    {e.student?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.student?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.course?.title}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const g = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  chartsRow: { display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  chartCard: { padding: '20px 20px 12px' },
  quickActions: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  qaBtn: { flex: '1 1 140px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 16px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s', minWidth: 130 },
  bottomRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  userRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' },
};
