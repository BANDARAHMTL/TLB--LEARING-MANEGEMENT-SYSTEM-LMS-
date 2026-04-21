import { FiX, FiBook, FiUsers, FiStar, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';

export function Spinner({ size = 36 }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}

export function StatCard({ icon, label, value, delta, color = 'var(--brand-500)', bg = 'var(--brand-50)' }) {
  return (
    <div className="card card-body stat-card animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value ?? '–'}</div>
          {delta !== undefined && (
            <div style={{ fontSize: '0.75rem', color: delta >= 0 ? 'var(--success)' : 'var(--error)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <FiTrendingUp size={12} /> {delta >= 0 ? '+' : ''}{delta}% this month
            </div>
          )}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.3rem', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal animate-in" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ message, onConfirm, onCancel, dangerous = false }) {
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal animate-in" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">Confirm Action</h3>
          <button className="modal-close" onClick={onCancel}><FiX /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{message}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className={`btn ${dangerous ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', message, action, actionLabel }) {
  return (
    <div className="empty-state animate-in">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p style={{ fontSize: '0.875rem', maxWidth: 340 }}>{message}</p>}
      {action && <button className="btn btn-primary" onClick={action}>{actionLabel || 'Get Started'}</button>}
    </div>
  );
}

export function CourseCard({ course, onEnroll, enrolled, onClick }) {
  const price = course.discountPrice || course.price;
  return (
    <div className="card course-card animate-in" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="course-card-thumb">
        {course.thumbnail
          ? <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="course-thumb-placeholder"><FiBook size={32} /></div>
        }
        {course.category && (
          <span className="course-card-cat" style={{ background: course.category.color || 'var(--brand-500)' }}>
            {course.category.name}
          </span>
        )}
      </div>
      <div className="course-card-body">
        <h3 className="course-card-title">{course.title}</h3>
        {course.teacher && (
          <div className="course-card-teacher">
            <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.65rem', width: 22, height: 22 }}>
              {course.teacher.name?.[0]}
            </div>
            <span>{course.teacher.name}</span>
          </div>
        )}
        <div className="course-card-meta">
          {course.rating > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontSize: '0.8rem' }}>
              <FiStar size={12} /> {course.rating.toFixed(1)}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-4)', fontSize: '0.8rem' }}>
            <FiUsers size={12} /> {course.enrolledCount || 0}
          </span>
          <span className={`badge ${course.level === 'Beginner' ? 'badge-green' : course.level === 'Advanced' ? 'badge-red' : 'badge-blue'}`}>
            {course.level}
          </span>
        </div>
        <div className="course-card-footer">
          <span className="course-price">{price === 0 ? 'Free' : `$${price}`}</span>
          {onEnroll && (
            <button className={`btn btn-sm ${enrolled ? 'btn-secondary' : 'btn-primary'}`}
              onClick={e => { e.stopPropagation(); onEnroll(course._id); }} disabled={enrolled}>
              {enrolled ? 'Enrolled' : <><FiShoppingCart size={13} /> Enroll</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgressRing({ percent, size = 80, stroke = 6, color = 'var(--brand-500)' }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--gray-200)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size/5, fontWeight: 700, fill: 'var(--text-1)', fontFamily: 'var(--font-body)' }}>
        {percent}%
      </text>
    </svg>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onChange(p)}>{p}</button>
      ))}
    </div>
  );
}
